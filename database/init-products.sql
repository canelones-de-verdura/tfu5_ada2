-- Database initialization script for Product Service
-- This database is shared by all product service instances

CREATE DATABASE IF NOT EXISTS product_db;
USE product_db;
SET foreign_key_checks = 1;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_name (name),
    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_name (name),
    INDEX idx_products_price (price),
    INDEX idx_products_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_category (product_id, category_id),
    INDEX idx_product_categories_product_id (product_id),
    INDEX idx_product_categories_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW product_inventory AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    GROUP_CONCAT(c.name SEPARATOR ', ') as categories
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
GROUP BY p.id, p.name, p.description, p.price, p.stock;

INSERT INTO categories (name, description) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Moda y vestimenta'),
('Libros', 'Libros y literatura'),
('Hogar y Jardín', 'Artículos para el hogar y jardinería'),
('Deportes', 'Equipamiento y accesorios deportivos');

INSERT INTO products (name, description, price, stock) VALUES
('Notebook Gamer', 'Notebook de alta performance para trabajo y juegos', 45000.00, 50),
('Smartphone Samsung', 'Último modelo de smartphone con funciones avanzadas', 32000.00, 100),
('Remera de Algodón', 'Remera cómoda de algodón en varios colores', 890.00, 200),
('Jeans Clásico', 'Jean de mezclilla clásico para uso diario', 2200.00, 150),
('Libro de Programación', 'Guía completa de programación moderna', 1800.00, 75),
('Set de Herramientas para Jardín', 'Set completo de herramientas esenciales para jardín', 4200.00, 30),
('Raqueta de Tenis', 'Raqueta de tenis profesional', 5800.00, 25),
('Cafetera Automática', 'Cafetera de goteo automática', 3600.00, 40),
('Auriculares Inalámbricos', 'Auriculares inalámbricos con cancelación de ruido', 8900.00, 60),
('Reloj Fitness', 'Dispositivo avanzado para seguimiento de actividad física y salud', 6700.00, 80);

INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1),
(2, 1),
(9, 1),
(10, 1),
(8, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 4),
(8, 4),
(7, 5),
(10, 5);

COMMIT;
