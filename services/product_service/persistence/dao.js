import { ProductModel, CategoryModel } from "./model";
import { DatabaseConnection } from "shared-db";

export class ProductDAO {
    dbConnection = DatabaseConnection.getInstance();

    async create(product) {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`,
                [product.name, product.description, product.price, product.stock]
            );

            const createdProduct = await this.findById(Number(result.insertId));
            if (!createdProduct) {
                throw new Error('Failed to create product');
            }
            return createdProduct;
        } catch (error) {
            throw new Error(`Error creating product: ${error}`);
        }
    }

    async findById(id) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE id = ?`,
                [id]
            );

            if (!rows || rows.length === 0) return null;

            return new ProductModel(rows[0]);
        } catch (error) {
            throw new Error(`Error finding product by ID: ${error}`);
        }
    }

    async findAll() {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM products ORDER BY id`);
            return rows.map((row) => new ProductModel(row));
        } catch (error) {
            throw new Error(`Error finding all products: ${error}`);
        }
    }

    async update(id, product) {
        try {
            await this.dbConnection.execute(
                `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
                [product.name, product.description, product.price, product.stock, id]
            );

            const updatedProduct = await this.findById(id);
            if (!updatedProduct) {
                throw new Error('ProductModel not found after update');
            }
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error updating product: ${error}`);
        }
    }

    async delete(id) {
        try {
            await this.dbConnection.execute(`DELETE FROM products WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting product: ${error}`);
        }
    }

    async findByName(name) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE name LIKE ? ORDER BY id`,
                [`%${name}%`]
            );
            return rows.map((row) => new ProductModel(row));
        } catch (error) {
            throw new Error(`Error finding products by name: ${error}`);
        }
    }

    async findLowStockProducts(threshold) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE stock < ? ORDER BY stock ASC`,
                [threshold]
            );
            return rows.map((row) => new ProductModel(row));
        } catch (error) {
            throw new Error(`Error finding low stock products: ${error}`);
        }
    }

    async updateStock(id, newStock) {
        try {
            await this.dbConnection.execute(
                `UPDATE products SET stock = ? WHERE id = ?`,
                [newStock, id]
            );

            const updatedProduct = await this.findById(id);
            if (!updatedProduct) {
                throw new Error('ProductModel not found after stock update');
            }
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error updating product stock: ${error}`);
        }
    }
}

export class CategoryDAO {
    dbConnection = DatabaseConnection.getInstance();

    async create(category) {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO categories (name, description) VALUES (?, ?)`,
                [category.name, category.description]
            );

            const createdCategory = await this.findById(Number(result.insertId));
            if (!createdCategory) {
                throw new Error('Failed to create category');
            }
            return createdCategory;
        } catch (error) {
            throw new Error(`Error creating category: ${error}`);
        }
    }

    async findById(id) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM categories WHERE id = ?`,
                [id]
            );

            return rows && rows.length > 0 ? CategoryModel.fromJSON(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding category by ID: ${error}`);
        }
    }

    async findAll() {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM categories ORDER BY name`);
            return rows.map((row) => new CategoryModel(row));
        } catch (error) {
            throw new Error(`Error finding all categories: ${error}`);
        }
    }

    async update(id, category) {
        try {
            await this.dbConnection.execute(
                `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
                [category.name, category.description, id]
            );

            const updatedCategory = await this.findById(id);
            if (!updatedCategory) {
                throw new Error('CategoryModel not found after update');
            }
            return updatedCategory;
        } catch (error) {
            throw new Error(`Error updating category: ${error}`);
        }
    }

    async delete(id) {
        try {
            // Remove from product_categories first (foreign key constraint)
            await this.dbConnection.execute(`DELETE FROM product_categories WHERE category_id = ?`, [id]);
            await this.dbConnection.execute(`DELETE FROM categories WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting category: ${error}`);
        }
    }

    async findByName(name) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM categories WHERE name = ?`,
                [name]
            );
            return rows && rows.length > 0 ? new CategoryModel(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding category by name: ${error}`);
        }
    }
}
