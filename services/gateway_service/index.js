import express from 'express';
import { ConfigClient } from 'shared-config-client';
import { Gateway } from './src/Gateway.js';

const app = express();
let port = Number(process.env.PORT ?? 8080);
let customerServices = [
    process.env.BACKEND_SERVICE_1 || 'http://customer-service-1:3000',
    process.env.BACKEND_SERVICE_2 || 'http://customer-service-2:3000',
    process.env.BACKEND_SERVICE_3 || 'http://customer-service-3:3000'
];

let productServices = [
    process.env.BACKEND_PRODUCT_SERVICE_1 || 'http://product-service-1:3001',
    process.env.BACKEND_PRODUCT_SERVICE_2 || 'http://product-service-2:3001',
    process.env.BACKEND_PRODUCT_SERVICE_3 || 'http://product-service-3:3001'
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
                customerServices = [
                    gatewayConfig.backendService1,
                    gatewayConfig.backendService2,
                    gatewayConfig.backendService3
                ];
            }

            if (gatewayConfig.backendProductService1 && gatewayConfig.backendProductService2 && gatewayConfig.backendProductService3) {
                productServices = [
                    gatewayConfig.backendProductService1,
                    gatewayConfig.backendProductService2,
                    gatewayConfig.backendProductService3
                ];
            }
        }
    } catch (error) {
        console.warn('Failed to load gateway config from config service, using defaults:', error.message);
    }
}

await loadGatewayConfig();

const customerGateway = new Gateway(customerServices);
const productGateway = new Gateway(productServices);
let server;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.status(200).json({ 
        message: 'TFU5 ADA2 API Gateway',
        customerServices: customerServices,
        productServices: productServices
    });
});

app.get('/health', async (req, res) => {
    try {
        const customerHealth = await new Promise((resolve) => {
            const mockRes = {
                status: (code) => ({
                    json: (data) => resolve({ code, data })
                })
            };
            customerGateway.healthCheck(req, mockRes);
        });

        const productHealth = await new Promise((resolve) => {
            const mockRes = {
                status: (code) => ({
                    json: (data) => resolve({ code, data })
                })
            };
            productGateway.healthCheck(req, mockRes);
        });

        const overallStatus = customerHealth.code === 200 && productHealth.code === 200 ? 200 : 503;
        
        res.status(overallStatus).json({
            status: overallStatus === 200 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: {
                customers: customerHealth.data,
                products: productHealth.data
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Proxy routes
app.use('/api/customers', customerGateway.createProxyConFallback('/api/customers', 'customers'));
app.use('/api/products', productGateway.createProxyConFallback('/api/products', 'products'));

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
            console.log(`Customer services: ${customerServices.join(', ')}`);
            console.log(`Product services: ${productServices.join(', ')}`);
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
