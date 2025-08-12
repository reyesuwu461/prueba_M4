-- Full Database Creation: Payment System (English version with comments)

-- Create database
CREATE DATABASE payment_system;
USE payment_system;

-- Table: Platforms (with ENUM)
CREATE TABLE platforms (
    id_platform INT AUTO_INCREMENT PRIMARY KEY,
    platform_name ENUM('Nequi', 'Daviplata') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Clients (with full validation)
CREATE TABLE clients (
    id_client INT AUTO_INCREMENT PRIMARY KEY,
    identification_number VARCHAR(20) NOT NULL UNIQUE,
    client_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (email LIKE '%_@__%.__%')
);

-- Table: Bills (complete structure)
CREATE TABLE bills (
    id_bill INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(20) NOT NULL UNIQUE,
    billing_period VARCHAR(10) NOT NULL,
    billed_amount DECIMAL(12, 2) NOT NULL,
    id_client INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_client) REFERENCES clients(id_client)
);

-- Table: Transaction Statuses (with ENUM)
CREATE TABLE transaction_statuses (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    status_name ENUM('Pending', 'Completed', 'Failed') NOT NULL,
    description VARCHAR(100)
);

-- Table: Transaction Types (with ENUM)
CREATE TABLE transaction_types (
    id_type INT AUTO_INCREMENT PRIMARY KEY,
    type_name ENUM('Bill Payment') NOT NULL,
    description VARCHAR(100)
);

-- Table: Transactions (complete structure)
CREATE TABLE transactions (
    id_transaction INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(20) NOT NULL UNIQUE,
    transaction_datetime DATETIME NOT NULL,
    transaction_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL,
    id_bill INT NOT NULL,
    id_platform INT NOT NULL,
    id_status INT NOT NULL,
    id_type INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bill) REFERENCES bills(id_bill),
    FOREIGN KEY (id_platform) REFERENCES platforms(id_platform),
    FOREIGN KEY (id_status) REFERENCES transaction_statuses(id_status),
    FOREIGN KEY (id_type) REFERENCES transaction_types(id_type)
);

-- Function: Robust email validation
DELIMITER //
CREATE FUNCTION fn_validate_email(email VARCHAR(100)) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN email REGEXP '^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9._-]*\\.[a-zA-Z]{2,}$';
END //
DELIMITER ;

-- Trigger: Validate email on INSERT
DELIMITER //
CREATE TRIGGER trg_validate_email_insert
BEFORE INSERT ON clients
FOR EACH ROW
BEGIN
    IF NOT fn_validate_email(NEW.email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email: must follow user@domain.ext format';
    END IF;
END //
DELIMITER ;

-- Trigger: Validate email on UPDATE
DELIMITER //
CREATE TRIGGER trg_validate_email_update
BEFORE UPDATE ON clients
FOR EACH ROW
BEGIN
    IF NOT fn_validate_email(NEW.email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email: must follow user@domain.ext format';
    END IF;
END //
DELIMITER ;

-- Indexes for optimization
CREATE INDEX idx_client_ident ON clients(identification_number);
CREATE INDEX idx_bill_number ON bills(bill_number);
CREATE INDEX idx_trans_code ON transactions(transaction_code);
CREATE INDEX idx_trans_datetime ON transactions(transaction_datetime);
CREATE INDEX idx_trans_status ON transactions(id_status);

-- Initial data
INSERT INTO platforms (platform_name) VALUES 
('Nequi'), ('Daviplata');

INSERT INTO transaction_statuses (status_name, description) VALUES 
('Pending', 'Transaction started but not completed'),
('Completed', 'Transaction successful and finished'),
('Failed', 'Transaction could not be completed');

INSERT INTO transaction_types (type_name, description) VALUES 
('Bill Payment', 'Payment made')