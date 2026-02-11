-- Run this script in your MySQL Workbench or Command Line Client
-- Source: source c:/Projects/Geofencing/setup_database.sql

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS geofencing_attendance;

-- 2. Create a dedicated user (avoids root password issues)
-- If the user already exists, this might fail, so we drop it first or just create if not exists (MySQL 5.7+)
-- For compatibility:
CREATE USER IF NOT EXISTS 'geo_user'@'localhost' IDENTIFIED BY 'geo_pass_123';

-- 3. Grant full permissions
GRANT ALL PRIVILEGES ON geofencing_attendance.* TO 'geo_user'@'localhost';

-- 4. Apply changes
FLUSH PRIVILEGES;

-- 5. Helper verification
USE geofencing_attendance;
SELECT "Database Setup Completed Successfully" as status;
