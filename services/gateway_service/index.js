import express from 'express';
import { ConfigClient } from 'shared-config-client';
import { Gateway } from './src/Gateway.js';

const app = express();
let port;
let customerServices;
let productServices;
let orderServices;

async function loadGatewayConfig() {
    const configClient = ConfigClient.getInstance();
    const gatewayConfig = await configClient.getServiceConfig('gateway');
    
    if (!gatewayConfig) {
        throw new Error('Failed to load gateway config from config service');
    }
    
    console.log('Successfully loaded gateway config from config service');
    
    port = gatewayConfig.port;
    customerServices = [
        gatewayConfig.backendCustomerService1,
        gatewayConfig.backendCustomerService2,
        gatewayConfig.backendCustomerService3
    ];
    productServices = [
        gatewayConfig.backendProductService1,
        gatewayConfig.backendProductService2,
        gatewayConfig.backendProductService3
    ];
    orderServices = [
        gatewayConfig.backendOrderService1,
        gatewayConfig.backendOrderService2,
        gatewayConfig.backendOrderService3
    ];
}

await loadGatewayConfig();

const customerGateway = new Gateway(customerServices);
const productGateway = new Gateway(productServices);
const orderGateway = new Gateway(orderServices);
let server;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.status(200).json({ 
        message: 'TFU5 ADA2 API Gateway',
        customerServices: customerServices,
        productServices: productServices,
        orderServices: orderServices
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

        const orderHealth = await new Promise((resolve) => {
            const mockRes = {
                status: (code) => ({
                    json: (data) => resolve({ code, data })
                })
            };
            orderGateway.healthCheck(req, mockRes);
        });

        const overallStatus = customerHealth.code === 200 && productHealth.code === 200 && orderHealth.code === 200 ? 200 : 503;
        
        res.status(overallStatus).json({
            status: overallStatus === 200 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: {
                customers: customerHealth.data,
                products: productHealth.data,
                orders: orderHealth.data
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

app.use('/api/customers', customerGateway.createProxyConFallback('/api/customers', 'customers'));
app.use('/api/products', productGateway.createProxyConFallback('/api/products', 'products'));
app.use('/api/orders', orderGateway.createProxyConFallback('/api/orders', 'orders'));

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
            console.log(`Order services: ${orderServices.join(', ')}`);
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
