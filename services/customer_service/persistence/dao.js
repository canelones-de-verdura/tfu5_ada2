import { CustomerModel } from "./model.js";
import DatabaseConnection from "shared-db"

export class CustomerDAO {
    get dbConnection() {
        return DatabaseConnection.getInstance();
    }

    async create(customer) {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
                [customer.name, customer.email, customer.phone, customer.address]
            );

            const createdCustomer = await this.findById(Number(result.insertId));
            if (!createdCustomer) {
                throw new Error('Failed to create customer');
            }
            return createdCustomer;
        } catch (error) {
            throw new Error(`Error creating customer: ${error}`);
        }
    }

    async findById(id) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM customers WHERE id = ?`,
                [id]
            );

            return rows && rows.length > 0 ? new CustomerModel(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding customer by ID: ${error}`);
        }
    }

    async findAll() {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM customers ORDER BY id`);
            return rows.map((row) => new CustomerModel(row));
        } catch (error) {
            throw new Error(`Error finding all customers: ${error}`);
        }
    }

    async update(id, customer) {
        try {
            await this.dbConnection.execute(
                `UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
                [customer.name, customer.email, customer.phone, customer.address, id]
            );

            const updatedCustomer = await this.findById(id);
            if (!updatedCustomer) {
                throw new Error('CustomerModel not found after update');
            }
            return updatedCustomer;
        } catch (error) {
            throw new Error(`Error updating customer: ${error}`);
        }
    }

    async delete(id) {
        try {
            await this.dbConnection.execute(`DELETE FROM customers WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting customer: ${error}`);
        }
    }

    async findByEmail(email) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM customers WHERE email = ?`,
                [email]
            );

            return rows && rows.length > 0 ? new CustomerModel(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding customer by email: ${error}`);
        }
    }
}
