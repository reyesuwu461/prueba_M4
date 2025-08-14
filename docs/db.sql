-- Full Database Creation: Payment System (English version with comments)

-- Create database
CREATE DATABASE payment_system;
USE payment_system;

-- Table: Clients (with full validation)
CREATE TABLE clients (
    id_client INT AUTO_INCREMENT PRIMARY KEY,
    identification_numero VARCHAR(20) NOT NULL UNIQUE,
    client_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@__%.__%')
);

-- registered_at
