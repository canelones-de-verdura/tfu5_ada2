-- Database initialization script for Customer Service
-- This database is shared by all customer service instances

CREATE DATABASE IF NOT EXISTS customer_db;
USE customer_db;
SET foreign_key_checks = 1;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customers_email (email),
    INDEX idx_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO customers (name, email, phone, address) VALUES
('Juan Pérez', 'juan.perez@gmail.com', '+598-99-123-456', 'Av. 18 de Julio 1234, Montevideo, Uruguay'),
('María González', 'maria.gonzalez@hotmail.com', '+598-99-234-567', 'Bulevar Artigas 567, Montevideo, Uruguay'),
('Carlos Rodríguez', 'carlos.rodriguez@outlook.com', '+598-99-345-678', 'Av. Rivera 890, Montevideo, Uruguay'),
('Ana López', 'ana.lopez@gmail.com', '+598-99-456-789', 'Punta Carretas Shopping, Montevideo, Uruguay'),
('Diego Martínez', 'diego.martinez@adinet.com.uy', '+598-99-567-890', 'Rambla República de México 1245, Montevideo, Uruguay');

COMMIT;
