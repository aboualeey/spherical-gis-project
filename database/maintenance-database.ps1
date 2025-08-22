# Spherical GIS Database Maintenance Script
# PowerShell script for automated database maintenance tasks

param(
    [string]$PostgreSQLPath = "C:\Program Files\PostgreSQL\17\bin",
    [string]$DatabaseName = "spherical_gis",
    [string]$MaintenanceUser = "spherical_app_user",
    [string]$LogPath = "C:\Backups\spherical_gis\logs\maintenance.log",
    [switch]$FullMaintenance = $false,
    [switch]$VacuumOnly = $false,
    [switch]$ReindexOnly = $false,
    [switch]$AnalyzeOnly = $false,
    [switch]$DryRun = $false
)

# Configuration
$script:MaintenanceConfig = @{
    VacuumThresholdDays = 7
    ReindexThresholdDays = 30
    AnalyzeThresholdDays = 1
    MaxMaintenanceHours = 4
    FragmentationThreshold = 20  # Percentage
    DeadTupleThreshold = 10      # Percentage
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
        [string]$Database = $DatabaseName,
        [switch]$NoOutput = $false
    )
    
    $psqlPath = Join-Path $PostgreSQLPath "psql.exe"
    
    try {
        if ($DryRun) {
            Write-LogMessage "[DRY RUN] Would execute: $($Query.Substring(0, [Math]::Min(100, $Query.Length)))..." "INFO" "Cyan"
            return "DRY_RUN_SUCCESS"
        }
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        $Query | Out-File -FilePath $tempFile -Encoding UTF8
        
        if ($NoOutput) {
            $result = & $psqlPath -h localhost -U $MaintenanceUser -d $Database -f $tempFile -q 2>&1
        } else {
            $result = & $psqlPath -h localhost -U $MaintenanceUser -d $Database -f $tempFile -t -A -F "`t" 2>&1
        }
        
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

# Function to get table statistics
function Get-TableStatistics {
    Write-LogMessage "Gathering table statistics..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    CASE 
        WHEN n_live_tup > 0 THEN ROUND((n_dead_tup::float / n_live_tup::float) * 100, 2)
        ELSE 0
    END as dead_tuple_ratio,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY dead_tuple_ratio DESC, n_dead_tup DESC;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result -and $result -ne "DRY_RUN_SUCCESS") {
        $tables = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        
        $tableStats = @()
        foreach ($table in $tables) {
            $parts = $table -split "`t"
            if ($parts.Count -ge 12) {
                $tableStats += @{
                    Schema = $parts[0]
                    Table = $parts[1]
                    Inserts = [long]$parts[2]
                    Updates = [long]$parts[3]
                    Deletes = [long]$parts[4]
                    LiveTuples = [long]$parts[5]
                    DeadTuples = [long]$parts[6]
                    DeadTupleRatio = [decimal]$parts[7]
                    LastVacuum = $parts[8]
                    LastAutoVacuum = $parts[9]
                    LastAnalyze = $parts[10]
                    LastAutoAnalyze = $parts[11]
                }
            }
        }
        
        Write-LogMessage "Found $($tableStats.Count) tables for analysis" "INFO" "White"
        return $tableStats
    }
    
    return @()
}

# Function to get index statistics
function Get-IndexStatistics {
    Write-LogMessage "Gathering index statistics..." "INFO" "Cyan"
    
    $query = @"
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
"@
    
    $result = Invoke-DatabaseQuery -Query $query
    
    if ($result -and $result -ne "DRY_RUN_SUCCESS") {
        $indexes = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
        
        $indexStats = @()
        foreach ($index in $indexes) {
            $parts = $index -split "`t"
            if ($parts.Count -ge 7) {
                $indexStats += @{
                    Schema = $parts[0]
                    Table = $parts[1]
                    Index = $parts[2]
                    Scans = [long]$parts[3]
                    TuplesRead = [long]$parts[4]
                    TuplesFetched = [long]$parts[5]
                    Size = $parts[6]
                }
            }
        }
        
        Write-LogMessage "Found $($indexStats.Count) indexes for analysis" "INFO" "White"
        return $indexStats
    }
    
    return @()
}

# Function to perform VACUUM operation
function Invoke-VacuumOperation {
    param(
        [array]$TableStats,
        [switch]$Full = $false
    )
    
    Write-LogMessage "Starting VACUUM operation..." "INFO" "Cyan"
    
    $vacuumTables = $TableStats | Where-Object { 
        $_.DeadTupleRatio -gt $script:MaintenanceConfig.DeadTupleThreshold -or
        $_.DeadTuples -gt 1000
    }
    
    if ($vacuumTables.Count -eq 0) {
        Write-LogMessage "No tables require vacuuming" "INFO" "Green"
        return $true
    }
    
    Write-LogMessage "Found $($vacuumTables.Count) tables that need vacuuming" "INFO" "White"
    
    $success = $true
    foreach ($table in $vacuumTables) {
        $tableName = "$($table.Schema).$($table.Table)"
        $vacuumType = if ($Full) { "VACUUM FULL" } else { "VACUUM" }
        
        Write-LogMessage "${vacuumType}: $tableName (Dead tuples: $($table.DeadTuples), Ratio: $($table.DeadTupleRatio)%)" "INFO" "Yellow"
        
        $startTime = Get-Date
        $query = "$vacuumType $tableName;"
        $result = Invoke-DatabaseQuery -Query $query -NoOutput
        $duration = (Get-Date) - $startTime
        
        if ($result -ne $null) {
            Write-LogMessage "✓ Completed $tableName in $($duration.TotalSeconds.ToString('F2')) seconds" "INFO" "Green"
        } else {
            Write-LogMessage "✗ Failed to vacuum $tableName" "ERROR" "Red"
            $success = $false
        }
    }
    
    return $success
}

# Function to perform REINDEX operation
function Invoke-ReindexOperation {
    param(
        [array]$IndexStats
    )
    
    Write-LogMessage "Starting REINDEX operation..." "INFO" "Cyan"
    
    # Identify indexes that might benefit from reindexing
    $reindexCandidates = $IndexStats | Where-Object {
        $_.Scans -gt 1000 -and ($_.TuplesRead -eq 0 -or ($_.TuplesFetched / [Math]::Max($_.TuplesRead, 1)) -lt 0.8)
    }
    
    if ($reindexCandidates.Count -eq 0) {
        Write-LogMessage "No indexes require reindexing" "INFO" "Green"
        return $true
    }
    
    Write-LogMessage "Found $($reindexCandidates.Count) indexes that might benefit from reindexing" "INFO" "White"
    
    $success = $true
    $processedTables = @()
    
    foreach ($index in $reindexCandidates) {
        $tableName = "$($index.Schema).$($index.Table)"
        
        # Reindex entire table instead of individual indexes for efficiency
        if ($tableName -notin $processedTables) {
            Write-LogMessage "REINDEX TABLE: $tableName" "INFO" "Yellow"
            
            $startTime = Get-Date
            $query = "REINDEX TABLE $tableName;"
            $result = Invoke-DatabaseQuery -Query $query -NoOutput
            $duration = (Get-Date) - $startTime
            
            if ($result -ne $null) {
                Write-LogMessage "✓ Completed reindex of $tableName in $($duration.TotalSeconds.ToString('F2')) seconds" "INFO" "Green"
                $processedTables += $tableName
            } else {
                Write-LogMessage "✗ Failed to reindex $tableName" "ERROR" "Red"
                $success = $false
            }
        }
    }
    
    return $success
}

# Function to perform ANALYZE operation
function Invoke-AnalyzeOperation {
    param(
        [array]$TableStats
    )
    
    Write-LogMessage "Starting ANALYZE operation..." "INFO" "Cyan"
    
    # Analyze tables that have had significant activity or haven't been analyzed recently
    $analyzeTables = $TableStats | Where-Object {
        ($_.Inserts + $_.Updates + $_.Deletes) -gt 100 -or
        $_.LastAnalyze -eq "" -or
        $_.LastAutoAnalyze -eq ""
    }
    
    if ($analyzeTables.Count -eq 0) {
        Write-LogMessage "No tables require analysis" "INFO" "Green"
        return $true
    }
    
    Write-LogMessage "Found $($analyzeTables.Count) tables that need analysis" "INFO" "White"
    
    $success = $true
    foreach ($table in $analyzeTables) {
        $tableName = "$($table.Schema).$($table.Table)"
        
        Write-LogMessage "ANALYZE: $tableName" "INFO" "Yellow"
        
        $startTime = Get-Date
        $query = "ANALYZE $tableName;"
        $result = Invoke-DatabaseQuery -Query $query -NoOutput
        $duration = (Get-Date) - $startTime
        
        if ($result -ne $null) {
            Write-LogMessage "✓ Completed analysis of $tableName in $($duration.TotalSeconds.ToString('F2')) seconds" "INFO" "Green"
        } else {
            Write-LogMessage "✗ Failed to analyze $tableName" "ERROR" "Red"
            $success = $false
        }
    }
    
    return $success
}

# Function to update database statistics
function Update-DatabaseStatistics {
    Write-LogMessage "Updating database-wide statistics..." "INFO" "Cyan"
    
    $queries = @(
        "UPDATE pg_stat_reset();",
        "SELECT pg_stat_reset_shared('bgwriter');",
        "SELECT pg_stat_reset_shared('archiver');"
    )
    
    $success = $true
    foreach ($query in $queries) {
        $result = Invoke-DatabaseQuery -Query $query -NoOutput
        if ($result -eq $null -and !$DryRun) {
            $success = $false
        }
    }
    
    if ($success) {
        Write-LogMessage "✓ Database statistics updated" "INFO" "Green"
    } else {
        Write-LogMessage "✗ Failed to update some database statistics" "ERROR" "Red"
    }
    
    return $success
}

# Function to clean up temporary files and logs
function Invoke-Cleanup {
    Write-LogMessage "Performing cleanup operations..." "INFO" "Cyan"
    
    try {
        # Clean up old log files (keep last 30 days)
        $logDir = Split-Path $LogPath -Parent
        if (Test-Path $logDir) {
            $oldLogs = Get-ChildItem -Path $logDir -Filter "*.log" | Where-Object {
                $_.LastWriteTime -lt (Get-Date).AddDays(-30)
            }
            
            foreach ($log in $oldLogs) {
                if (!$DryRun) {
                    Remove-Item $log.FullName -Force
                }
                Write-LogMessage "Removed old log file: $($log.Name)" "INFO" "White"
            }
        }
        
        # Clean up PostgreSQL log files if accessible
        $pgLogDir = "C:\Program Files\PostgreSQL\17\data\log"
        if (Test-Path $pgLogDir) {
            $oldPgLogs = Get-ChildItem -Path $pgLogDir -Filter "*.log" | Where-Object {
                $_.LastWriteTime -lt (Get-Date).AddDays(-7)
            }
            
            foreach ($log in $oldPgLogs) {
                if (!$DryRun) {
                    Remove-Item $log.FullName -Force
                }
                Write-LogMessage "Removed old PostgreSQL log: $($log.Name)" "INFO" "White"
            }
        }
        
        Write-LogMessage "✓ Cleanup completed" "INFO" "Green"
        return $true
    }
    catch {
        Write-LogMessage "Cleanup error: $($_.Exception.Message)" "ERROR" "Red"
        return $false
    }
}

# Function to generate maintenance report
function New-MaintenanceReport {
    param(
        [hashtable]$Results
    )
    
    Write-LogMessage "" "INFO" "White"
    Write-LogMessage "=== Maintenance Report ===" "INFO" "Magenta"
    Write-LogMessage "Start Time: $($Results.StartTime)" "INFO" "White"
    Write-LogMessage "End Time: $($Results.EndTime)" "INFO" "White"
    Write-LogMessage "Duration: $($Results.Duration)" "INFO" "White"
    Write-LogMessage "" "INFO" "White"
    
    Write-LogMessage "Operations Performed:" "INFO" "White"
    foreach ($operation in $Results.Operations.Keys) {
        $status = if ($Results.Operations[$operation]) { "✓ SUCCESS" } else { "✗ FAILED" }
        $color = if ($Results.Operations[$operation]) { "Green" } else { "Red" }
        Write-LogMessage "  $operation`: $status" "INFO" $color
    }
    
    Write-LogMessage "" "INFO" "White"
    Write-LogMessage "Statistics:" "INFO" "White"
    Write-LogMessage "  Tables Processed: $($Results.TablesProcessed)" "INFO" "White"
    Write-LogMessage "  Indexes Processed: $($Results.IndexesProcessed)" "INFO" "White"
    
    if ($Results.Errors.Count -gt 0) {
        Write-LogMessage "" "INFO" "White"
        Write-LogMessage "Errors Encountered:" "ERROR" "Red"
        foreach ($error in $Results.Errors) {
            Write-LogMessage "  - $error" "ERROR" "Red"
        }
    }
    
    $overallStatus = if ($Results.Operations.Values -contains $false) { "PARTIAL SUCCESS" } else { "SUCCESS" }
    $statusColor = if ($overallStatus -eq "SUCCESS") { "Green" } else { "Yellow" }
    
    Write-LogMessage "" "INFO" "White"
    Write-LogMessage "Overall Status: $overallStatus" "INFO" $statusColor
    Write-LogMessage "=== End Report ===" "INFO" "Magenta"
}

# Main maintenance function
function Start-DatabaseMaintenance {
    $startTime = Get-Date
    
    Write-LogMessage "=== Spherical GIS Database Maintenance Started ===" "INFO" "Magenta"
    Write-LogMessage "Timestamp: $startTime" "INFO" "White"
    Write-LogMessage "Database: $DatabaseName" "INFO" "White"
    Write-LogMessage "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'LIVE' })" "INFO" "White"
    Write-LogMessage "" "INFO" "White"
    
    $results = @{
        StartTime = $startTime
        Operations = @{}
        TablesProcessed = 0
        IndexesProcessed = 0
        Errors = @()
    }
    
    try {
        # Get current statistics
        $tableStats = Get-TableStatistics
        $indexStats = Get-IndexStatistics
        
        $results.TablesProcessed = $tableStats.Count
        $results.IndexesProcessed = $indexStats.Count
        
        # Perform maintenance operations based on parameters
        if ($VacuumOnly -or $FullMaintenance -or (!$ReindexOnly -and !$AnalyzeOnly)) {
            Write-LogMessage "Performing VACUUM operations..." "INFO" "Cyan"
            $results.Operations["VACUUM"] = Invoke-VacuumOperation -TableStats $tableStats -Full:$FullMaintenance
        }
        
        if ($ReindexOnly -or $FullMaintenance) {
            Write-LogMessage "Performing REINDEX operations..." "INFO" "Cyan"
            $results.Operations["REINDEX"] = Invoke-ReindexOperation -IndexStats $indexStats
        }
        
        if ($AnalyzeOnly -or $FullMaintenance -or (!$VacuumOnly -and !$ReindexOnly)) {
            Write-LogMessage "Performing ANALYZE operations..." "INFO" "Cyan"
            $results.Operations["ANALYZE"] = Invoke-AnalyzeOperation -TableStats $tableStats
        }
        
        if ($FullMaintenance) {
            Write-LogMessage "Updating database statistics..." "INFO" "Cyan"
            $results.Operations["UPDATE_STATS"] = Update-DatabaseStatistics
            
            Write-LogMessage "Performing cleanup..." "INFO" "Cyan"
            $results.Operations["CLEANUP"] = Invoke-Cleanup
        }
        
    }
    catch {
        $errorMsg = "Maintenance error: $($_.Exception.Message)"
        Write-LogMessage $errorMsg "ERROR" "Red"
        $results.Errors += $errorMsg
    }
    
    $endTime = Get-Date
    $results.EndTime = $endTime
    $results.Duration = $endTime - $startTime
    
    # Generate report
    New-MaintenanceReport -Results $results
}

# Execute maintenance if script is run directly
if ($MyInvocation.InvocationName -ne '.') {
    Start-DatabaseMaintenance
}