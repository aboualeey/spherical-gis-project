-- Spherical GIS Database Initialization Script
-- PostgreSQL Database Setup with Security, Performance, and Backup Configuration

-- Create database (run this as superuser)
CREATE DATABASE spherical_gis
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Connect to the spherical_gis database
\c spherical_gis;

-- Create application-specific roles
CREATE ROLE spherical_app_user WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT -1
    PASSWORD 'spherical_secure_2024!';

CREATE ROLE spherical_readonly WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT 5
    PASSWORD 'spherical_read_2024!';

CREATE ROLE spherical_backup WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    INHERIT
    NOREPLICATION
    CONNECTION LIMIT 2
    PASSWORD 'spherical_backup_2024!';

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS app_data;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS backup;

-- Grant schema permissions
GRANT USAGE ON SCHEMA app_data TO spherical_app_user;
GRANT CREATE ON SCHEMA app_data TO spherical_app_user;
GRANT USAGE ON SCHEMA app_data TO spherical_readonly;
GRANT USAGE ON SCHEMA audit TO spherical_app_user;
GRANT USAGE ON SCHEMA backup TO spherical_backup;

-- Performance optimizations
-- Increase shared_buffers (25% of RAM recommended)
ALTER SYSTEM SET shared_buffers = '256MB';

-- Optimize for OLTP workload
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Connection and query optimization
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET random_page_cost = 1.1;

-- Enable query logging for monitoring
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Security settings
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Create audit table for tracking changes
CREATE TABLE audit.audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- Create indexes for audit table
CREATE INDEX idx_audit_log_table_name ON audit.audit_log(table_name);
CREATE INDEX idx_audit_log_timestamp ON audit.audit_log(timestamp);
CREATE INDEX idx_audit_log_user_id ON audit.audit_log(user_id);

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log (table_name, operation, old_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_setting('app.current_user_id', true));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log (table_name, operation, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log (table_name, operation, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create backup configuration table
CREATE TABLE backup.backup_config (
    id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'differential'
    schedule VARCHAR(100) NOT NULL, -- cron expression
    retention_days INTEGER DEFAULT 30,
    compression BOOLEAN DEFAULT true,
    encryption BOOLEAN DEFAULT true,
    storage_path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default backup configurations
INSERT INTO backup.backup_config (backup_type, schedule, retention_days, storage_path) VALUES
('full', '0 2 * * 0', 90, '/var/backups/spherical_gis/full'), -- Weekly full backup
('incremental', '0 2 * * 1-6', 7, '/var/backups/spherical_gis/incremental'), -- Daily incremental
('differential', '0 14 * * *', 14, '/var/backups/spherical_gis/differential'); -- Daily differential

-- Create backup log table
CREATE TABLE backup.backup_log (
    id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'running'
    file_path TEXT,
    file_size BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for backup tables
CREATE INDEX idx_backup_log_start_time ON backup.backup_log(start_time);
CREATE INDEX idx_backup_log_status ON backup.backup_log(status);

-- Grant permissions for backup operations
GRANT SELECT, INSERT, UPDATE ON backup.backup_config TO spherical_backup;
GRANT SELECT, INSERT, UPDATE ON backup.backup_log TO spherical_backup;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA backup TO spherical_backup;

-- Create monitoring views
CREATE VIEW app_data.database_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables;

-- Grant permissions on monitoring views
GRANT SELECT ON app_data.database_stats TO spherical_readonly;
GRANT SELECT ON app_data.database_stats TO spherical_app_user;

-- Create function to get database size information
CREATE OR REPLACE FUNCTION app_data.get_database_size_info()
RETURNS TABLE(
    database_name TEXT,
    size_mb NUMERIC,
    size_pretty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        current_database()::TEXT,
        ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2),
        pg_size_pretty(pg_database_size(current_database()));
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION app_data.get_database_size_info() TO spherical_readonly;
GRANT EXECUTE ON FUNCTION app_data.get_database_size_info() TO spherical_app_user;

-- Reload configuration to apply system settings
SELECT pg_reload_conf();

-- Display completion message
SELECT 'Database initialization completed successfully!' as status;