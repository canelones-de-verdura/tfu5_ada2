import mysql from 'mysql2/promise';

export class DatabaseConnection {
    static instance;

    constructor(db_config) {
        this.config = {
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            database: db_config.name,
            port: parseInt(db_config.port, 10),
            connectionLimit: parseInt(db_config.connectionLimit ?? '10', 10),
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: parseInt(db_config.connectTimeout ?? '60000', 10)
        };

        this.pool = mysql.createPool(this.config);
        DatabaseConnection.instance = this
    }

    static getInstance() {
        if (!DatabaseConnection.instance) {
            throw "Class hasn't been initialized yet."
        }

        return DatabaseConnection.instance;
    }

    getPool() {
        return this.pool;
    }

    async getConnection() {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('Error getting database connection:', error);
            throw error;
        }
    }

    async query(sql, values) {
        try {
            const [rows] = await this.pool.execute(sql, values);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async execute(sql, values) {
        try {
            const [result] = await this.pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error('Database execute error:', error);
            throw error;
        }
    }

    async beginTransaction() {
        const connection = await this.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    async commitTransaction(connection) {
        try {
            await connection.commit();
            connection.release();
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    async rollbackTransaction(connection) {
        try {
            await connection.rollback();
            connection.release();
        } catch (error) {
            connection.release();
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.getConnection();
            await connection.ping();
            connection.release();
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    async close() {
        try {
            await this.pool.end();
        } catch (error) {
            console.error('Error closing database pool:', error);
            throw error;
        }
    }

    getConfig() {
        return { ...this.config };
    }
}
