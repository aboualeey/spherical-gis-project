# Spherical GIS Database Setup Script
param(
    [string]$PostgreSQLPath = "C:\Program Files\PostgreSQL\17\bin",
    [string]$DatabaseName = "spherical_gis",
    [string]$BackupDir = "C:\Backups\spherical_gis"
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-PostgreSQLService {
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-ColorOutput "[OK] PostgreSQL service is running" "Green"
        return $true
    } else {
        Write-ColorOutput "[ERROR] PostgreSQL service is not running" "Red"
        return $false
    }
}

function New-BackupDirectories {
    $directories = @($BackupDir, "$BackupDir\full", "$BackupDir\incremental", "$BackupDir\logs")
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-ColorOutput "Created directory: $dir" "Cyan"
        }
    }
    Write-ColorOutput "[OK] Backup directories ready" "Green"
    return $true
}

function Invoke-SqlFile {
    param([string]$FilePath, [string]$Database = "postgres")
    $psqlPath = Join-Path $PostgreSQLPath "psql.exe"
    
    if (!(Test-Path $psqlPath)) {
        Write-ColorOutput "[ERROR] psql.exe not found at: $psqlPath" "Red"
        return $false
    }
    
    if (!(Test-Path $FilePath)) {
        Write-ColorOutput "[ERROR] SQL file not found: $FilePath" "Red"
        return $false
    }
    
    try {
        Write-ColorOutput "Executing SQL file: $(Split-Path $FilePath -Leaf)" "Cyan"
        $securePassword = Read-Host "Enter PostgreSQL superuser password" -AsSecureString
        $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
        $env:PGPASSWORD = $password
        
        $result = & $psqlPath -h localhost -U postgres -d $Database -f $FilePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[OK] SQL file executed successfully" "Green"
            return $true
        } else {
            Write-ColorOutput "[ERROR] SQL execution failed: $result" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "[ERROR] Error executing SQL file: $($_.Exception.Message)" "Red"
        return $false
    } finally {
        $env:PGPASSWORD = $null
    }
}

function Test-DatabaseConnection {
    $psqlPath = Join-Path $PostgreSQLPath "psql.exe"
    try {
        $securePassword = Read-Host "Enter PostgreSQL password for connection test" -AsSecureString
        $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
        $env:PGPASSWORD = $password
        
        $result = & $psqlPath -h localhost -U postgres -d $DatabaseName -c "SELECT 'Connection successful!' as status;" -t
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[OK] Database connection test successful" "Green"
            return $true
        } else {
            Write-ColorOutput "[ERROR] Database connection test failed" "Red"
            return $false
        }
    } catch {
        Write-ColorOutput "[ERROR] Connection test error: $($_.Exception.Message)" "Red"
        return $false
    } finally {
        $env:PGPASSWORD = $null
    }
}

function Invoke-PrismaMigrations {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    try {
        Push-Location $projectRoot
        Write-ColorOutput "Installing Prisma dependencies..." "Cyan"
        npm install @prisma/client prisma
        Write-ColorOutput "Generating Prisma client..." "Cyan"
        npx prisma generate
        Write-ColorOutput "Running database migrations..." "Cyan"
        npx prisma db push
        Write-ColorOutput "[OK] Prisma migrations completed successfully" "Green"
        return $true
    } catch {
        Write-ColorOutput "[ERROR] Prisma migration error: $($_.Exception.Message)" "Red"
        return $false
    } finally {
        Pop-Location
    }
}

# Main execution
Write-ColorOutput "=== Spherical GIS Database Setup ===" "Magenta"
Write-ColorOutput "" "White"

# Step 1: Check PostgreSQL service
Write-ColorOutput "Step 1: Checking PostgreSQL service..." "Yellow"
if (!(Test-PostgreSQLService)) {
    Write-ColorOutput "Please start PostgreSQL service and try again" "Red"
    exit 1
}

# Step 2: Create backup directories
Write-ColorOutput "Step 2: Creating backup directories..." "Yellow"
if (!(New-BackupDirectories)) {
    Write-ColorOutput "Failed to create backup directories" "Red"
    exit 1
}

# Step 3: Execute database initialization script
Write-ColorOutput "Step 3: Initializing database..." "Yellow"
$initScript = Join-Path $PSScriptRoot "init-database.sql"
if (Invoke-SqlFile -FilePath $initScript -Database "postgres") {
    Write-ColorOutput "[OK] Database initialization completed" "Green"
} else {
    Write-ColorOutput "[ERROR] Database initialization failed" "Red"
    exit 1
}

# Step 4: Execute backup script setup
Write-ColorOutput "Step 4: Setting up backup procedures..." "Yellow"
$backupScript = Join-Path $PSScriptRoot "backup-script.sql"
if (Invoke-SqlFile -FilePath $backupScript -Database $DatabaseName) {
    Write-ColorOutput "[OK] Backup procedures setup completed" "Green"
} else {
    Write-ColorOutput "[ERROR] Backup procedures setup failed" "Red"
}

# Step 5: Run Prisma migrations
Write-ColorOutput "Step 5: Running Prisma migrations..." "Yellow"
if (Invoke-PrismaMigrations) {
    Write-ColorOutput "[OK] Prisma setup completed" "Green"
} else {
    Write-ColorOutput "[ERROR] Prisma setup failed" "Red"
}

# Step 6: Test database connection
Write-ColorOutput "Step 6: Testing database connection..." "Yellow"
if (Test-DatabaseConnection) {
    Write-ColorOutput "[OK] Database setup verification successful" "Green"
} else {
    Write-ColorOutput "[ERROR] Database connection verification failed" "Red"
}

Write-ColorOutput "" "White"
Write-ColorOutput "=== Database Setup Complete ===" "Magenta"
Write-ColorOutput "" "White"
Write-ColorOutput "Next steps:" "Yellow"
Write-ColorOutput "1. Update your .env file with the correct DATABASE_URL" "White"
Write-ColorOutput "2. Test your application connection" "White"
Write-ColorOutput "3. Set up automated backup scheduling" "White"
Write-ColorOutput "4. Configure monitoring and alerting" "White"
Write-ColorOutput "" "White"
Write-ColorOutput "Database URL format:" "Yellow"
Write-ColorOutput "postgresql://username:password@localhost:5432/spherical_gis" "Cyan"