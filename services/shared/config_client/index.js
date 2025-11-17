import axios from 'axios';

export class ConfigClient {
    static instances = new Map();

    constructor(configServiceUrl, cacheTimeout = 300000) {
        this.configUrl = configServiceUrl;
        this.cacheTimeout = cacheTimeout;
        this.cachedConfig = new Map();
        this.axiosInstance = axios.create({
            baseURL: configServiceUrl,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static getInstance(configServiceUrl, cacheTimeout) {
        const url = configServiceUrl || process.env.CONFIG_SERVICE_URL || 'http://config-service:4000';
        const cache = cacheTimeout || parseInt(process.env.CONFIG_CACHE_TIMEOUT || '300000', 10);
        
        if (!ConfigClient.instances.has(url)) {
            ConfigClient.instances.set(url, new ConfigClient(url, cache));
        }
        return ConfigClient.instances.get(url);
    }

    async getServiceConfig(service) {
        // Check cache first
        if (this.cachedConfig.has(service)) {
            return this.cachedConfig.get(service);
        }

        try {
            const response = await this.axiosInstance.get(`/config/${service}`);
            const config = response.data;
            
            this.cachedConfig.set(service, config);
            
            setTimeout(() => {
                this.cachedConfig.delete(service);
            }, this.cacheTimeout);

            return config;
        } catch (error) {
            console.error(`Failed to fetch configuration for ${service}:`, error.message);
            throw new Error(`Configuration service unavailable for ${service}`);
        }
    }

    async getValue(service, key) {
        try {
            const config = await this.getServiceConfig(service);
            return config[key];
        } catch (error) {
            console.error(`Failed to fetch configuration ${service}.${key}:`, error.message);
            throw error;
        }
    }

    async healthCheck() {
        try {
            const response = await this.axiosInstance.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('Configuration service health check failed:', error.message);
            return false;
        }
    }

    clearCache() {
        this.cachedConfig.clear();
    }

    clearServiceCache(service) {
        this.cachedConfig.delete(service);
    }
}
