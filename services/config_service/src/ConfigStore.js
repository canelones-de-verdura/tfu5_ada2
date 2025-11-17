export class ConfigStore {
    static instance;

    constructor() {
        this.config = {
            database_customers: {
                host: process.env.DB_CUSTOMERS_HOST,
                user: process.env.DB_CUSTOMERS_USER,
                password: process.env.DB_CUSTOMERS_PASSWORD,
                name: process.env.DB_CUSTOMERS_NAME,
                port: parseInt(process.env.DB_CUSTOMERS_PORT, 10),
                connectionLimit: parseInt(process.env.DB_CUSTOMERS_CONNECTION_LIMIT, 10),
                connectTimeout: parseInt(process.env.DB_CUSTOMERS_CONNECT_TIMEOUT, 10)
            },
            database_products: {
                host: process.env.DB_PRODUCTS_HOST,
                user: process.env.DB_PRODUCTS_USER,
                password: process.env.DB_PRODUCTS_PASSWORD,
                name: process.env.DB_PRODUCTS_NAME,
                port: parseInt(process.env.DB_PRODUCTS_PORT, 10),
                connectionLimit: parseInt(process.env.DB_PRODUCTS_CONNECTION_LIMIT, 10),
                connectTimeout: parseInt(process.env.DB_PRODUCTS_CONNECT_TIMEOUT, 10)
            },
            database_orders: {
                host: process.env.DB_ORDERS_HOST,
                user: process.env.DB_ORDERS_USER,
                password: process.env.DB_ORDERS_PASSWORD,
                name: process.env.DB_ORDERS_NAME,
                port: parseInt(process.env.DB_ORDERS_PORT, 10),
                connectionLimit: parseInt(process.env.DB_ORDERS_CONNECTION_LIMIT, 10),
                connectTimeout: parseInt(process.env.DB_ORDERS_CONNECT_TIMEOUT, 10)
            },
            redis: {
                url: process.env.REDIS_URL
            },
            gateway: {
                port: parseInt(process.env.GATEWAY_PORT, 10),
                backendCustomerService1: process.env.BACKEND_CUSTOMER_SERVICE_1,
                backendCustomerService2: process.env.BACKEND_CUSTOMER_SERVICE_2,
                backendCustomerService3: process.env.BACKEND_CUSTOMER_SERVICE_3,
                backendProductService1: process.env.BACKEND_PRODUCT_SERVICE_1,
                backendProductService2: process.env.BACKEND_PRODUCT_SERVICE_2,
                backendProductService3: process.env.BACKEND_PRODUCT_SERVICE_3,
                backendOrderService1: process.env.BACKEND_ORDER_SERVICE_1,
                backendOrderService2: process.env.BACKEND_ORDER_SERVICE_2,
                backendOrderService3: process.env.BACKEND_ORDER_SERVICE_3
            },
            app: {
                port: parseInt(process.env.APP_PORT, 10),
                nodeEnv: process.env.NODE_ENV
            },
            jwt: {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        };
    }

    static getInstance() {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    getServiceConfig(service) {
        return this.config[service];
    }

    getValue(service, key) {
        const serviceConfig = this.config[service];
        return serviceConfig ? serviceConfig[key] : undefined;
    }

    getAllConfigs() {
        return this.config;
    }

    updateConfig(service, updates) {
        if (this.config[service]) {
            this.config[service] = { ...this.config[service], ...updates };
        } else {
            this.config[service] = updates;
        }
    }
}
