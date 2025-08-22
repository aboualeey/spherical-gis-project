# Spherical GIS Database Monitoring Script
# PowerShell script for comprehensive database health monitoring

param(
    [string]$PostgreSQLPath = "C:\Program Files\PostgreSQL\17\bin",
    [string]$DatabaseName = "spherical_gis",
    [string]$MonitorUser = "spherical_readonly",
    [string]$LogPath = "C:\Backups\spherical_gis\logs\monitoring.log",
    [switch]$SendAlerts = $false,
    [string]$AlertEmail = ""
)

# Import required modules
Add-Type -AssemblyName System.Web

# Configuration
$script:AlertThresholds = @{
    DatabaseSizeMB = 10240  # 10GB
    ConnectionCount = 80    # 80% of max_connections
    LongRunningQueryMinutes = 30
    DeadlockCount = 5
    BackupAgeDays = 2
    DiskSpacePercentage = 85
}

# Function to write log messages
function Write-LogMessage {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to console with color
    Write-Host $logEntry -ForegroundColor $Color
    
    # Write to log file
    if ($LogPath) {
        $logDir = Split-Path $LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        Add-Content -Path $LogPath -Value $logEntry
    }
}

# Function to execute SQL query
function Invoke-DatabaseQuery {
    param(
        [string]$Query,
        [string]$Database = $DatabaseName
    )
    
    $psqlPath = Join-Path $PostgreSQLPath "psql.exe"
    
    try {
        $tempFile = [System.IO.Path]::GetTempFileName()
        $Query | Out-File -FilePath $tempFile -Encoding UTF8
        
        $result = & $psqlPath -h localhost -U $MonitorUser -d $Database -f $tempFile -t -A -F "`t" 2>&1
        
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        
        if ($LASTEXITCODE -eq 0) {
            return $result
        } else {
            throw "Query execution failed: $result"
        }
    }
    catch {
        Write-LogMessage "Database query error: $($_.Exception.Message)" "ERROR" "Red"
        return $null
    }
}

# Function to check database connectivity
function Test-DatabaseConnectivity {
    Write-LogMessage "Testing database connectivity..." "INFO" "Cyan"
    
    $query = "SELECT 'Connected' as status, version() as version;"
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result) {
        Write-LogMessage "✓ Database connection successful" "INFO" "Green"
        return $true
    } else {
        Write-LogMessage "✗ Database connection failed" "ERROR" "Red"
        return $false
    }
}

# Function to check database size
function Get-DatabaseSize {
    Write-LogMessage "Checking database size..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    pg_database_size('$DatabaseName') / 1024 / 1024 as size_mb,
    pg_size_pretty(pg_database_size('$DatabaseName')) as size_pretty;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result) {
        $sizeMB = [math]::Round([decimal]($result -split "`t")[0], 2)
        $sizePretty = ($result -split "`t")[1]
        
        Write-LogMessage "Database size: $sizePretty ($sizeMB MB)" "INFO" "White"
        
        if ($sizeMB -gt $script:AlertThresholds.DatabaseSizeMB) {
            Write-LogMessage "⚠ WARNING: Database size exceeds threshold ($($script:AlertThresholds.DatabaseSizeMB) MB)" "WARN" "Yellow"
            return @{ Status = "WARNING"; SizeMB = $sizeMB; Message = "Database size exceeds threshold" }
        }
        
        return @{ Status = "OK"; SizeMB = $sizeMB; SizePretty = $sizePretty }
    }
    
    return @{ Status = "ERROR"; Message = "Failed to retrieve database size" }
}

# Function to check active connections
function Get-ActiveConnections {
    Write-LogMessage "Checking active connections..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    COUNT(*) as active_connections,
    COUNT(CASE WHEN state = 'active' THEN 1 END) as active_queries,
    COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
FROM pg_stat_activity 
WHERE datname = '$DatabaseName';
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result) {
        $parts = $result -split "`t"
        $activeConnections = [int]$parts[0]
        $activeQueries = [int]$parts[1]
        $idleConnections = [int]$parts[2]
        
        Write-LogMessage "Active connections: $activeConnections (Active queries: $activeQueries, Idle: $idleConnections)" "INFO" "White"
        
        if ($activeConnections -gt $script:AlertThresholds.ConnectionCount) {
            Write-LogMessage "⚠ WARNING: High connection count ($activeConnections)" "WARN" "Yellow"
            return @{ Status = "WARNING"; Count = $activeConnections; Message = "High connection count" }
        }
        
        return @{ Status = "OK"; Total = $activeConnections; Active = $activeQueries; Idle = $idleConnections }
    }
    
    return @{ Status = "ERROR"; Message = "Failed to retrieve connection information" }
}

# Function to check for long-running queries
function Get-LongRunningQueries {
    Write-LogMessage "Checking for long-running queries..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    pid,
    usename,
    application_name,
    state,
    EXTRACT(EPOCH FROM (NOW() - query_start))/60 as duration_minutes,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE datname = '$DatabaseName'
    AND state = 'active'
    AND query_start < NOW() - INTERVAL '$($script:AlertThresholds.LongRunningQueryMinutes) minutes'
ORDER BY query_start;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result -and $result.Trim() -ne "") {
        $longQueries = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        Write-LogMessage "⚠ WARNING: Found $($longQueries.Count) long-running queries" "WARN" "Yellow"
        
        foreach ($query in $longQueries) {
            $parts = $query -split "`t"
            if ($parts.Count -ge 6) {
                $duration = [math]::Round([decimal]$parts[4], 2)
                Write-LogMessage "  PID $($parts[0]): $duration minutes - $($parts[5])" "WARN" "Yellow"
            }
        }
        
        return @{ Status = "WARNING"; Count = $longQueries.Count; Queries = $longQueries }
    } else {
        Write-LogMessage "✓ No long-running queries found" "INFO" "Green"
        return @{ Status = "OK"; Count = 0 }
    }
}

# Function to check backup status
function Get-BackupStatus {
    Write-LogMessage "Checking backup status..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    backup_type,
    health_status,
    last_backup
FROM backup.backup_health
ORDER BY backup_type;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result) {
        $backups = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        $issues = @()
        
        foreach ($backup in $backups) {
            $parts = $backup -split "`t"
            if ($parts.Count -ge 3) {
                $backupType = $parts[0]
                $healthStatus = $parts[1]
                $lastBackup = $parts[2]
                
                if ($healthStatus -ne "Healthy") {
                    Write-LogMessage "⚠ WARNING: $backupType backup status: $healthStatus" "WARN" "Yellow"
                    $issues += "$backupType backup: $healthStatus"
                } else {
                    Write-LogMessage "✓ $backupType backup: $healthStatus (Last: $lastBackup)" "INFO" "Green"
                }
            }
        }
        
        if ($issues.Count -gt 0) {
            return @{ Status = "WARNING"; Issues = $issues }
        } else {
            return @{ Status = "OK"; Message = "All backups healthy" }
        }
    }
    
    return @{ Status = "ERROR"; Message = "Failed to retrieve backup status" }
}

# Function to check disk space
function Get-DiskSpace {
    Write-LogMessage "Checking disk space..." "INFO" "Cyan"
    
    try {
        $dataDir = "C:\Program Files\PostgreSQL\17\data"
        $drive = (Get-Item $dataDir).PSDrive
        $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
        $totalSpaceGB = [math]::Round(($drive.Free + $drive.Used) / 1GB, 2)
        $usedPercentage = [math]::Round((($drive.Used / ($drive.Free + $drive.Used)) * 100), 2)
        
        Write-LogMessage "Disk space: $freeSpaceGB GB free of $totalSpaceGB GB total ($usedPercentage% used)" "INFO" "White"
        
        if ($usedPercentage -gt $script:AlertThresholds.DiskSpacePercentage) {
            Write-LogMessage "⚠ WARNING: Disk space usage is high ($usedPercentage%)" "WARN" "Yellow"
            return @{ Status = "WARNING"; UsedPercentage = $usedPercentage; Message = "High disk usage" }
        }
        
        return @{ Status = "OK"; FreeGB = $freeSpaceGB; TotalGB = $totalSpaceGB; UsedPercentage = $usedPercentage }
    }
    catch {
        Write-LogMessage "Error checking disk space: $($_.Exception.Message)" "ERROR" "Red"
        return @{ Status = "ERROR"; Message = "Failed to check disk space" }
    }
}

# Function to get performance metrics
function Get-PerformanceMetrics {
    Write-LogMessage "Collecting performance metrics..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    'cache_hit_ratio' as metric,
    ROUND((sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2) as value
FROM pg_statio_user_tables
UNION ALL
SELECT 
    'index_usage_ratio' as metric,
    ROUND((sum(idx_blks_hit) / (sum(idx_blks_hit) + sum(idx_blks_read))) * 100, 2) as value
FROM pg_statio_user_indexes;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result) {
        $metrics = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        
        foreach ($metric in $metrics) {
            $parts = $metric -split "`t"
            if ($parts.Count -ge 2) {
                $metricName = $parts[0]
                $value = $parts[1]
                Write-LogMessage "$metricName: $value%" "INFO" "White"
            }
        }
        
        return @{ Status = "OK"; Metrics = $metrics }
    }
    
    return @{ Status = "ERROR"; Message = "Failed to retrieve performance metrics" }
}

# Function to send alert notifications
function Send-AlertNotification {
    param(
        [string]$Subject,
        [string]$Body
    )
    
    if ($SendAlerts -and $AlertEmail) {
        try {
            # This is a placeholder for email notification
            # In production, implement actual email sending logic
            Write-LogMessage "ALERT: $Subject" "ALERT" "Magenta"
            Write-LogMessage "Details: $Body" "ALERT" "Magenta"
            
            # Example using Send-MailMessage (requires SMTP configuration)
            # Send-MailMessage -To $AlertEmail -Subject $Subject -Body $Body -SmtpServer "your-smtp-server"
        }
        catch {
            Write-LogMessage "Failed to send alert notification: $($_.Exception.Message)" "ERROR" "Red"
        }
    }
}

# Main monitoring function
function Start-DatabaseMonitoring {
    Write-LogMessage "=== Spherical GIS Database Monitoring Started ===" "INFO" "Magenta"
    Write-LogMessage "Timestamp: $(Get-Date)" "INFO" "White"
    Write-LogMessage "Database: $DatabaseName" "INFO" "White"
    Write-LogMessage "" "INFO" "White"
    
    $overallStatus = "OK"
    $alerts = @()
    
    # Test connectivity
    if (!(Test-DatabaseConnectivity)) {
        $overallStatus = "CRITICAL"
        $alerts += "Database connectivity failed"
        Send-AlertNotification "Database Connectivity Alert" "Failed to connect to database $DatabaseName"
        return
    }
    
    # Check database size
    $sizeResult = Get-DatabaseSize
    if ($sizeResult.Status -eq "WARNING") {
        $overallStatus = "WARNING"
        $alerts += $sizeResult.Message
    }
    
    # Check connections
    $connectionResult = Get-ActiveConnections
    if ($connectionResult.Status -eq "WARNING") {
        $overallStatus = "WARNING"
        $alerts += $connectionResult.Message
    }
    
    # Check long-running queries
    $queryResult = Get-LongRunningQueries
    if ($queryResult.Status -eq "WARNING") {
        $overallStatus = "WARNING"
        $alerts += "Long-running queries detected"
    }
    
    # Check backup status
    $backupResult = Get-BackupStatus
    if ($backupResult.Status -eq "WARNING") {
        $overallStatus = "WARNING"
        $alerts += $backupResult.Issues
    }
    
    # Check disk space
    $diskResult = Get-DiskSpace
    if ($diskResult.Status -eq "WARNING") {
        $overallStatus = "WARNING"
        $alerts += $diskResult.Message
    }
    
    # Get performance metrics
    $perfResult = Get-PerformanceMetrics
    
    # Summary
    Write-LogMessage "" "INFO" "White"
    Write-LogMessage "=== Monitoring Summary ===" "INFO" "Magenta"
    Write-LogMessage "Overall Status: $overallStatus" "INFO" $(if ($overallStatus -eq "OK") { "Green" } elseif ($overallStatus -eq "WARNING") { "Yellow" } else { "Red" })
    
    if ($alerts.Count -gt 0) {
        Write-LogMessage "Alerts:" "WARN" "Yellow"
        foreach ($alert in $alerts) {
            Write-LogMessage "  - $alert" "WARN" "Yellow"
        }
        
        # Send consolidated alert
        if ($SendAlerts) {
            $alertBody = "Database monitoring detected the following issues:`n`n" + ($alerts -join "`n")
            Send-AlertNotification "Database Monitoring Alert - $DatabaseName" $alertBody
        }
    } else {
        Write-LogMessage "No issues detected" "INFO" "Green"
    }
    
    Write-LogMessage "=== Monitoring Complete ===" "INFO" "Magenta"
}

# Execute monitoring
if ($MyInvocation.InvocationName -ne '.') {
    Start-DatabaseMonitoring
}