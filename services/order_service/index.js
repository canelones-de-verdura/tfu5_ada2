import express from 'express'
import router from './presentation/router.js';

import { ConfigClient } from "shared-config-client";
import { DatabaseConnection } from "shared-db";
import { RedisCache } from "shared-redis"

const config = ConfigClient.getInstance();

const db_config = config.getServiceConfig("database");
const db = new DatabaseConnection(db_config)

const redis_config = config.getServiceConfig("redis");
const redis = new RedisCache(redis_config)

const app = express()
const port = 3000

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(port, () => {
    console.log(`Service listening on port ${port}`)
})

