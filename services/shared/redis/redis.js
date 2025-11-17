import { createClient } from "redis";

export class RedisCache {
    static instance;

    constructor(redis_config) {
        const url = redis_config.REDIS_URL || "redis://redis:6379"
        this.client = createClient({ url });
        this.client.on("error", (err) => console.error("Redis Client Error", err));

        RedisCache.instance = this
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
            console.log("Connected to Redis");
        }
    }

    static getInstance() {
        if (!RedisCache.instance) {
            throw "Class hasn't been initialized yet."
        }
        return RedisCache.instance;
    }

    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key, value, lifetime = 3600) {
        await this.client.setEx(key, lifetime, JSON.stringify(value));
    }

    async del(key) {
        await this.client.del(key);
    }

    async enqueue(queueName, data) {
        await this.client.rPush(queueName, JSON.stringify(data));
    }

    async dequeueBlocking(queueName, timeout = 0) {
        const result = await this.client.blPop(queueName, timeout);
        if (!result) return null;
        return JSON.parse(result.element);
    }
}
