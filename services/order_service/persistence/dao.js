import { OrderModel, OrderItemModel } from "./model.js";
import { DatabaseConnection } from "shared-db";

export class OrderDAO {
    dbConnection = DatabaseConnection.getInstance();

    async create(order) {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO orders (customer_id, order_date, status, total_amount) 
                 VALUES (?, ?, ?, ?)`,
                [
                    order.customerId,
                    order.orderDate,
                    order.status,
                    order.totalAmount
                ]
            );

            const createdOrder = await this.findById(Number(result.insertId));
            if (!createdOrder) {
                throw new Error('Failed to create order');
            }
            return createdOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error}`);
        }
    }

    async findById(id) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE id = ?`,
                [id]
            );

            if (!rows || rows.length === 0) return null;

            return new OrderModel(rows[0]);
        } catch (error) {
            throw new Error(`Error finding order by ID: ${error}`);
        }
    }

    async findAll() {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM orders ORDER BY order_date DESC`);
            return rows.map((row) => new OrderModel(row));
        } catch (error) {
            throw new Error(`Error finding all orders: ${error}`);
        }
    }

    async update(id, order) {
        try {
            await this.dbConnection.execute(
                `UPDATE orders SET customer_id = ?, status = ?, total_amount = ? WHERE id = ?`,
                [order.customerId, order.status, order.totalAmount, id]
            );

            const updatedOrder = await this.findById(id);
            if (!updatedOrder) {
                throw new Error('OrderModel not found after update');
            }
            return updatedOrder;
        } catch (error) {
            throw new Error(`Error updating order: ${error}`);
        }
    }

    async delete(id) {
        try {
            await this.dbConnection.execute(`DELETE FROM orders WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order: ${error}`);
        }
    }

    async findByCustomerId(customerId) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC`,
                [customerId]
            );

            return rows.map((row) => new OrderModel(row));
        } catch (error) {
            throw new Error(`Error finding orders by customer ID: ${error}`);
        }
    }

    async findByStatus(status) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC`,
                [status]
            );

            return rows.map((row) => new OrderModel(row));
        } catch (error) {
            throw new Error(`Error finding orders by status: ${error}`);
        }
    }

    async updateStatus(id, status) {
        try {
            await this.dbConnection.execute(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, id]
            );

            const updatedOrder = await this.findById(id);
            if (!updatedOrder) {
                throw new Error('OrderModel not found after status update');
            }
            return updatedOrder;
        } catch (error) {
            throw new Error(`Error updating order status: ${error}`);
        }
    }
}

export class OrderItemDAO {
    dbConnection = DatabaseConnection.getInstance();

    async create(orderItem) {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    orderItem.orderId,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.quantity * orderItem.unitPrice
                ]
            );

            const createdOrderItem = await this.findById(Number(result.insertId));
            if (!createdOrderItem) {
                throw new Error('Failed to create order item');
            }
            return createdOrderItem;
        } catch (error) {
            throw new Error(`Error creating order item: ${error}`);
        }
    }

    async findById(id) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE id = ?`,
                [id]
            );

            if (!rows || rows.length === 0) return null;
            const row = rows[0];

            return OrderItemModel.fromJSON({
                ...row,
                orderId: row.order_id,
                productId: row.product_id,
                unitPrice: row.unit_price,
                totalPrice: row.total_price
            });
        } catch (error) {
            throw new Error(`Error finding order item by ID: ${error}`);
        }
    }

    async findAll() {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM order_items ORDER BY id`);
            return rows.map((row) =>
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    subtotal: row.total_price
                })
            );
        } catch (error) {
            throw new Error(`Error finding all order items: ${error}`);
        }
    }

    async update(id, orderItem) {
        try {
            await this.dbConnection.execute(
                `UPDATE order_items SET order_id = ?, product_id = ?, quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
                [
                    orderItem.orderId,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.quantity * orderItem.unitPrice,
                    id
                ]
            );

            const updatedOrderItem = await this.findById(id);
            if (!updatedOrderItem) {
                throw new Error('Order item not found after update');
            }
            return updatedOrderItem;
        } catch (error) {
            throw new Error(`Error updating order item: ${error}`);
        }
    }

    async delete(id) {
        try {
            await this.dbConnection.execute(`DELETE FROM order_items WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order item: ${error}`);
        }
    }

    async findByOrderId(orderId) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE order_id = ? ORDER BY id`,
                [orderId]
            );

            return rows.map((row) =>
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    subtotal: row.total_price
                })
            );
        } catch (error) {
            throw new Error(`Error finding order items by order ID: ${error}`);
        }
    }

    async findByProductId(productId) {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE product_id = ? ORDER BY id DESC`,
                [productId]
            );

            return rows.map((row) =>
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    subtotal: row.total_price
                })
            );
        } catch (error) {
            throw new Error(`Error finding order items by product ID: ${error}`);
        }
    }

    async deleteByOrderId(orderId) {
        try {
            await this.dbConnection.execute(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
        } catch (error) {
            throw new Error(`Error deleting order items by order ID: ${error}`);
        }
    }
}
