-- Database initialization script for Order Service
-- This database is shared by all order service instances

CREATE DATABASE IF NOT EXISTS order_db;
USE order_db;
SET foreign_key_checks = 1;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_order_date (order_date),
    INDEX idx_orders_total_amount (total_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    o.id as order_id,
    o.customer_id,
    o.customer_name,
    o.customer_email,
    o.total_amount,
    o.status,
    o.order_date,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_id, o.customer_name, o.customer_email, o.total_amount, o.status, o.order_date;

INSERT INTO orders (customer_id, customer_name, customer_email, total_amount, status) VALUES
(1, 'Juan Pérez', 'juan.perez@gmail.com', 45890.00, 'delivered'),
(2, 'María González', 'maria.gonzalez@hotmail.com', 34200.00, 'shipped'),
(3, 'Carlos Rodríguez', 'carlos.rodriguez@outlook.com', 11490.00, 'processing'),
(4, 'Ana López', 'ana.lopez@gmail.com', 4200.00, 'pending'),
(5, 'Diego Martínez', 'diego.martinez@adinet.com.uy', 17290.00, 'delivered');

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
-- Order 1 - Juan
(1, 1, 'Notebook Gamer', 1, 45000.00, 45000.00),
(1, 3, 'Remera de Algodón', 1, 890.00, 890.00),
-- Order 2 - María
(2, 2, 'Smartphone Samsung', 1, 32000.00, 32000.00),
(2, 4, 'Jeans Clásico', 1, 2200.00, 2200.00),
-- Order 3 - Carlos
(3, 9, 'Auriculares Inalámbricos', 1, 8900.00, 8900.00),
(3, 5, 'Libro de Programación', 1, 1800.00, 1800.00),
(3, 3, 'Remera de Algodón', 1, 890.00, 890.00),
-- Order 4 - Ana
(4, 6, 'Set de Herramientas para Jardín', 1, 4200.00, 4200.00),
-- Order 5 - Diego
(5, 7, 'Raqueta de Tenis', 1, 5800.00, 5800.00),
(5, 10, 'Reloj Fitness', 1, 6700.00, 6700.00),
(5, 8, 'Cafetera Automática', 1, 3600.00, 3600.00),
(5, 3, 'Remera de Algodón', 1, 890.00, 890.00),
(5, 4, 'Jeans Clásico', 1, 2200.00, 2200.00);

COMMIT;
