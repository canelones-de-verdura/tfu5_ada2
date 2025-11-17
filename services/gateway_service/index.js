import express from 'express';
import { ConfigClient } from 'shared-config-client';
import { Gateway } from './src/Gateway.js';

const app = express();
let port = Number(process.env.PORT ?? 8080);
let backendServices = [
    process.env.BACKEND_SERVICE_1 || 'http://customer-service-1:3000',
    process.env.BACKEND_SERVICE_2 || 'http://customer-service-2:3000',
    process.env.BACKEND_SERVICE_3 || 'http://customer-service-3:3000'
];

async function loadGatewayConfig() {
    try {
        const configClient = ConfigClient.getInstance();
        const gatewayConfig = await configClient.getServiceConfig('gateway');
        
        if (gatewayConfig) {
            console.log('Successfully loaded gateway config from config service');
            
            if (gatewayConfig.port) {
                port = gatewayConfig.port;
            }
            
            if (gatewayConfig.backendService1 && gatewayConfig.backendService2 && gatewayConfig.backendService3) {
                backendServices = [
                    gatewayConfig.backendService1,
                    gatewayConfig.backendService2,
                    gatewayConfig.backendService3
                ];
            }
        }
    } catch (error) {
        console.warn('Failed to load gateway config from config service, using defaults:', error.message);
    }
}

await loadGatewayConfig();

const gateway = new Gateway(backendServices);
let server;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.status(200).json({ 
        message: 'TFU5 ADA2 API Gateway',
        backendServices: backendServices
    });
});

app.get('/health', (req, res) => {
    gateway.healthCheck(req, res);
});

// Proxy routes
app.use('/api/customers', gateway.createProxyConFallback('/api/customers', 'customers'));
app.use('/api/products', gateway.createProxyConFallback('/api/products', 'products'));

app.use((req, res) => {
    res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

app.use((error, _req, res, _next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
    try {
        server = app.listen(port, '0.0.0.0', () => {
            console.log(`Gateway is running on port ${port}`);
            console.log(`Backend services: ${backendServices.join(', ')}`);
        });
    } catch (error) {
        console.error('Failed to start gateway:', error);
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
