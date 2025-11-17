export class ConfigStore {
    static instance;

    constructor() {
        this.config = {
            database: {
                host: process.env.DB_HOST || 'mysql',
                user: process.env.DB_USER || 'appuser',
                password: process.env.DB_PASSWORD || 'apppassword',
                name: process.env.DB_NAME || 'ecommerce_db',
                port: parseInt(process.env.DB_PORT || '3306', 10),
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
                connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10)
            },
            redis: {
                url: process.env.REDIS_URL || 'redis://redis:6379'
            },
            gateway: {
                port: parseInt(process.env.GATEWAY_PORT || '8080', 10),
                backendService1: process.env.BACKEND_SERVICE_1 || 'http://app1:3000',
                backendService2: process.env.BACKEND_SERVICE_2 || 'http://app2:3000',
                backendService3: process.env.BACKEND_SERVICE_3 || 'http://app3:3000'
            },
            app: {
                port: parseInt(process.env.APP_PORT || '3000', 10),
                nodeEnv: process.env.NODE_ENV || 'production'
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'super-secret-de-iara',
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
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
