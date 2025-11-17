import express from 'express';
import { ConfigStore } from './src/ConfigStore.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const configStore = ConfigStore.getInstance();
let server;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.status(200).json({ 
        message: 'Configuration Service API',
        version: '1.0.0'
    });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ 
        status: 'ok',
        service: 'config-service'
    });
});

app.get('/config/:service', (req, res) => {
    const { service } = req.params;
    const validServices = ['database_customers', 'database_products', 'database_orders', 'redis', 'gateway', 'app', 'jwt'];
    if (!validServices.includes(service)) {
        return res.status(400).json({ 
            error: 'Invalid service name',
            validServices 
        });
    }

    const config = configStore.getServiceConfig(service);
    
    if (!config) {
        return res.status(404).json({ 
            error: `No configuration found for service: ${service}` 
        });
    }

    return res.status(200).json(config);
});

app.get('/config', (_req, res) => {
    const allConfigs = configStore.getAllConfigs();
    res.status(200).json(allConfigs);
});

app.get('/config/:service/:key', (req, res) => {
    const { service, key } = req.params;
    const validServices = ['database_customers', 'database_products', 'database_orders', 'redis', 'gateway', 'app', 'jwt'];
    if (!validServices.includes(service)) {
        return res.status(400).json({ 
            error: 'Invalid service name',
            validServices 
        });
    }

    const value = configStore.getValue(service, key);
    
    if (value === undefined) {
        return res.status(404).json({ 
            error: `Configuration ${service}.${key} not found` 
        });
    }

    return res.status(200).json({ [key]: value });
});

app.use((req, res) => {
    res.status(404).json({ 
        message: `Endpoint ${req.method} ${req.originalUrl} not found` 
    });
});

app.use((error, _req, res, _next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
    try {
        server = app.listen(port, '0.0.0.0', () => {
            console.log(`Configuration Service is running on port ${port}`);
            console.log(`Available endpoints:`);
            console.log(`  GET /health`);
            console.log(`  GET /config/:service`);
            console.log(`  GET /config/:service/:key`);
        });
    } catch (error) {
        console.error('Failed to start config service:', error);
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server?.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        console.log('Shutdown completed. Goodbye!');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    void shutdown('SIGTERM');
});

void startServer();
