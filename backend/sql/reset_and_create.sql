-- WARNING: This script will DROP existing tables and recreate the schema.
-- Make a backup before running: mysqldump -u root -p gearguard_dev > backup.sql

SET FOREIGN_KEY_CHECKS = 0;

-- Drop in dependency order
DROP TABLE IF EXISTS MaintenanceLog;
DROP TABLE IF EXISTS MaintenanceRequest;
DROP TABLE IF EXISTS Equipment;
DROP TABLE IF EXISTS TeamMember;
DROP TABLE IF EXISTS EquipmentCategory;
DROP TABLE IF EXISTS WorkCenter;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS MaintenanceTeam;

SET FOREIGN_KEY_CHECKS = 1;

-- Create tables per provided schema
CREATE DATABASE IF NOT EXISTS db_default;
USE db_default;

CREATE TABLE MaintenanceTeam (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL,
    company   VARCHAR(150)
);

CREATE TABLE `User` (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    CHAR(60) NOT NULL,
    role        ENUM('ADMIN','MANAGER','TECHNICIAN','USER') NOT NULL DEFAULT 'USER',
    teamId      INT NULL,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES MaintenanceTeam(id),
    CHECK (CHAR_LENGTH(password) >= 8)
);

CREATE TABLE TeamMember (
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id),
    FOREIGN KEY (user_id) REFERENCES `User`(id)
);

CREATE TABLE EquipmentCategory (
    id                  INT PRIMARY KEY AUTO_INCREMENT,
    name                VARCHAR(100) NOT NULL UNIQUE,
    responsible_user_id INT NULL,
    company             VARCHAR(150),
    FOREIGN KEY (responsible_user_id) REFERENCES `User`(id)
);

CREATE TABLE WorkCenter (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL UNIQUE,
    code          CHAR(10) NOT NULL UNIQUE,
    cost_per_hour DECIMAL(10,2) NOT NULL,
    capacity      INT NOT NULL,
    oee_target    DECIMAL(5,2) NOT NULL,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Equipment (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(100) NOT NULL,
    serial_number  VARCHAR(100) NOT NULL UNIQUE,
    employee_name  VARCHAR(100),
    department     VARCHAR(100),
    location       VARCHAR(150),
    purchase_date  DATE,
    warranty_end   DATE,
    category_id    INT NOT NULL,
    team_id        INT NOT NULL,
    technician_id  INT NULL,
    is_scrapped    BOOLEAN DEFAULT FALSE,
    company        VARCHAR(150),
    workCenterId   INT NULL,
    CHECK (warranty_end >= purchase_date),
    FOREIGN KEY (category_id) REFERENCES EquipmentCategory(id),
    FOREIGN KEY (team_id) REFERENCES MaintenanceTeam(id),
    FOREIGN KEY (technician_id) REFERENCES `User`(id),
    FOREIGN KEY (workCenterId) REFERENCES WorkCenter(id)
);

CREATE TABLE MaintenanceRequest (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    subject        VARCHAR(255) NOT NULL,
    type           ENUM('CORRECTIVE','PREVENTIVE') NOT NULL,
    status         ENUM('NEW','IN_PROGRESS','REPAIRED','SCRAP') DEFAULT 'NEW',
    equipmentId    INT NOT NULL,
    teamId         INT NOT NULL,
    technicianId   INT NULL,
    scheduled_date TIMESTAMP NULL,
    duration_hours INT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipmentId) REFERENCES Equipment(id),
    FOREIGN KEY (teamId) REFERENCES MaintenanceTeam(id),
    FOREIGN KEY (technicianId) REFERENCES `User`(id)
);

CREATE TABLE MaintenanceLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  from_status ENUM('NEW','IN_PROGRESS','REPAIRED','SCRAP'),
  to_status   ENUM('NEW','IN_PROGRESS','REPAIRED','SCRAP'),
  performed_by_id INT NULL,
  notes TEXT,
  duration_hours DECIMAL(8,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES MaintenanceRequest(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_id) REFERENCES `User`(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_requests_status ON MaintenanceRequest(status);
CREATE INDEX idx_requests_team ON MaintenanceRequest(teamId);
CREATE INDEX idx_requests_scheduled ON MaintenanceRequest(scheduled_date);

-- Done
SELECT 'Schema reset and created' AS result;
