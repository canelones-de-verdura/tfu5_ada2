import express from 'express'
import router from './presentation/router.js';

import { ConfigClient } from "shared-config-client";
import { DatabaseConnection } from "shared-db";
import { RedisCache } from "shared-redis"

async function startServer() {
    const config = ConfigClient.getInstance();

    const db_config = await config.getServiceConfig("database_orders");
    const db = new DatabaseConnection(db_config)

    const redis_config = await config.getServiceConfig("redis");
    const redis = new RedisCache(redis_config)
    await redis.connect();

    const app = express()
    const port = 3002

    app.disable("x-powered-by");
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy',
            service: 'order-service',
            timestamp: new Date().toISOString(),
            container: process.env.HOSTNAME || process.env.INSTANCE_ID
        });
    });

    app.use("/api/orders", router);

    app.listen(port, () => {
        console.log(`Service listening on port ${port}`)
    })
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

