# Spherical GIS Database Setup Guide

## Overview

This guide provides comprehensive instructions for setting up, configuring, and maintaining the PostgreSQL database for the Spherical GIS project. The setup includes security configurations, performance optimizations, backup procedures, and monitoring capabilities.

## Database Architecture

### Database Type: PostgreSQL 17.6
**Rationale**: PostgreSQL was chosen for its:
- Excellent GIS support with PostGIS extension capability
- ACID compliance and data integrity
- Advanced indexing and query optimization
- Robust backup and recovery features
- Strong security features
- JSON/JSONB support for flexible data structures

### Schema Organization

```
sherical_gis/
├── app_data/          # Main application tables
├── audit/             # Audit logging and tracking
└── backup/            # Backup configuration and logs
```

## Prerequisites

1. **PostgreSQL 17.6** installed and running
2. **Node.js** and **npm** for Prisma operations
3. **PowerShell 5.0+** for Windows setup scripts
4. **7-Zip** (optional, for backup compression)

## Quick Setup

### 1. Environment Configuration

Update your `.env` file:
```env
DATABASE_URL="postgresql://spherical_app_user:spherical_secure_2024!@localhost:5432/spherical_gis"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@spherical.com"
ADMIN_PASSWORD="secure-admin-password"
```

### 2. Run Database Setup

```powershell
# Navigate to database directory
cd database

# Run setup script
.\setup-database.ps1
```

### 3. Verify Installation

```bash
# Test database connection
psql -h localhost -U spherical_app_user -d spherical_gis -c "SELECT 'Connected!' as status;"

# Run Prisma migrations
npx prisma db push
npx prisma generate
```

## Detailed Configuration

### User Roles and Permissions

| Role | Purpose | Permissions |
|------|---------|-------------|
| `spherical_app_user` | Application runtime | Full CRUD on app_data schema |
| `spherical_readonly` | Reporting/monitoring | SELECT only on all schemas |
| `spherical_backup` | Backup operations | Backup/restore permissions |

### Security Configuration

- **Password Encryption**: SCRAM-SHA-256
- **SSL**: Enabled for all connections
- **Connection Logging**: Enabled for security monitoring
- **Role-based Access Control**: Implemented with principle of least privilege

### Performance Optimizations

```sql
-- Memory Configuration
shared_buffers = 256MB          -- 25% of available RAM
effective_cache_size = 1GB      -- 75% of available RAM
work_mem = 4MB                  -- Per-operation memory
maintenance_work_mem = 64MB     -- Maintenance operations

-- Query Optimization
default_statistics_target = 100  -- Statistics collection
random_page_cost = 1.1          -- SSD optimization

-- WAL Configuration
wal_buffers = 16MB              -- Write-ahead logging
checkpoint_completion_target = 0.9
```

## Data Model

### Core Entities

1. **Users** - Authentication and authorization
2. **Products** - Inventory management
3. **Sales** - Transaction tracking
4. **Inventory** - Stock management
5. **Content Management** - CMS functionality
6. **Media Files** - Asset management
7. **Training Programs** - Educational content
8. **Solar Materials** - Specialized product catalog

### Audit System

All data modifications are automatically logged with:
- Table name and operation type
- Before/after values (JSON)
- User ID and timestamp
- IP address tracking

## Backup Strategy

### Backup Types

1. **Full Backup** - Weekly (Sundays at 2 AM)
   - Complete database dump
   - 90-day retention
   - Compressed and encrypted

2. **Incremental Backup** - Daily (Monday-Saturday at 2 AM)
   - Changes since last backup
   - 7-day retention
   - Fast recovery capability

3. **Differential Backup** - Daily (2 PM)
   - Changes since last full backup
   - 14-day retention
   - Balance of speed and storage

### Backup Commands

```powershell
# Manual full backup
.\setup-database.ps1 -BackupType "full"

# Automated backup (via Task Scheduler)
schtasks /create /tn "Spherical_DB_Backup" /tr "powershell.exe -File C:\path\to\setup-database.ps1" /sc daily /st 02:00
```

### Backup Monitoring

```sql
-- Check backup health
SELECT * FROM backup.backup_health;

-- View backup statistics
SELECT * FROM backup.get_backup_stats();

-- Manual health check
SELECT backup.check_backup_health();
```

## Monitoring and Maintenance

### Database Statistics

```sql
-- Database size information
SELECT * FROM app_data.get_database_size_info();

-- Table statistics
SELECT * FROM app_data.database_stats;

-- Connection monitoring
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start
FROM pg_stat_activity
WHERE datname = 'spherical_gis';
```

### Performance Monitoring

```sql
-- Slow query identification
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage analysis
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Maintenance Tasks

```sql
-- Manual vacuum (run weekly)
VACUUM ANALYZE;

-- Reindex (run monthly)
REINDEX DATABASE spherical_gis;

-- Update table statistics
ANALYZE;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check PostgreSQL service
   Get-Service postgresql*
   
   # Start service if stopped
   Start-Service postgresql-x64-17
   ```

2. **Authentication Failed**
   ```bash
   # Reset user password
   psql -U postgres -c "ALTER USER spherical_app_user PASSWORD 'new_password';"
   ```

3. **Disk Space Issues**
   ```sql
   -- Check database size
   SELECT pg_size_pretty(pg_database_size('spherical_gis'));
   
   -- Clean old audit logs
   DELETE FROM audit.audit_log WHERE timestamp < NOW() - INTERVAL '90 days';
   ```

4. **Performance Issues**
   ```sql
   -- Identify blocking queries
   SELECT 
       blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
   FROM pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
   JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
   WHERE NOT blocked_locks.granted;
   ```

### Log Locations

- **PostgreSQL Logs**: `C:\Program Files\PostgreSQL\17\data\log\`
- **Backup Logs**: `C:\Backups\spherical_gis\logs\`
- **Application Logs**: Check your application's log directory

## Security Best Practices

1. **Regular Password Updates**
   - Change database passwords quarterly
   - Use strong, unique passwords
   - Store passwords securely (e.g., Azure Key Vault)

2. **Network Security**
   - Restrict database access to application servers only
   - Use SSL/TLS for all connections
   - Configure firewall rules appropriately

3. **Audit Monitoring**
   - Review audit logs regularly
   - Set up alerts for suspicious activities
   - Monitor failed login attempts

4. **Backup Security**
   - Encrypt backup files
   - Store backups in secure, offsite locations
   - Test backup restoration procedures regularly

## Disaster Recovery

### Recovery Procedures

1. **Point-in-Time Recovery**
   ```bash
   # Stop PostgreSQL service
   Stop-Service postgresql-x64-17
   
   # Restore from backup
   pg_restore -h localhost -U postgres -d spherical_gis backup_file.sql
   
   # Start PostgreSQL service
   Start-Service postgresql-x64-17
   ```

2. **Full Database Restoration**
   ```bash
   # Drop and recreate database
   dropdb -U postgres spherical_gis
   createdb -U postgres spherical_gis
   
   # Restore from full backup
   psql -U postgres -d spherical_gis -f full_backup.sql
   ```

### Recovery Testing

- Test backup restoration monthly
- Document recovery procedures
- Maintain recovery time objectives (RTO < 4 hours)
- Maintain recovery point objectives (RPO < 1 hour)

## Support and Maintenance

### Regular Maintenance Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Backup Verification | Daily | Automated backup health checks |
| Performance Review | Weekly | Query performance analysis |
| Security Audit | Monthly | Access logs and permission review |
| Full System Test | Quarterly | Complete disaster recovery test |

### Contact Information

For database-related issues:
- **Primary DBA**: [Your Name]
- **Backup Contact**: [Backup Contact]
- **Emergency Escalation**: [Emergency Contact]

---

*Last Updated: $(Get-Date -Format 'yyyy-MM-dd')*
*Version: 1.0*