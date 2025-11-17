import axios from 'axios';

export class HealthMonitor {
    constructor(backendServices) {
        this.startTime = Date.now();
        this.backendServices = backendServices;
        this.httpClient = axios.create({
            timeout: 5000
        });
    }

    async checkHealth() {
        const serviceChecks = await this.checkBackendServices();
        const memoryCheck = this.checkMemory();

        const serviceStatuses = Object.values(serviceChecks);
        const upServices = serviceStatuses.filter(s => s.status === 'up').length;
        const totalServices = serviceStatuses.length;

        let overallStatus;
        const memoryThresholdHealthy = 80;
        const memoryThresholdDegraded = 90;
        
        if (upServices === totalServices && memoryCheck.percentage < memoryThresholdHealthy) {
            overallStatus = 'healthy';
        } else if (upServices > 0 && memoryCheck.percentage < memoryThresholdDegraded) {
            overallStatus = 'degraded';
        } else {
            overallStatus = 'unhealthy';
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            services: serviceChecks,
            memory: memoryCheck,
            container: process.env.HOSTNAME
        };
    }

    async checkBackendServices() {
        const checks = {};

        for (const serviceUrl of this.backendServices) {
            try {
                const startTime = Date.now();
                const response = await this.httpClient.get(`${serviceUrl}/api`);
                const responseTime = Date.now() - startTime;

                checks[serviceUrl] = {
                    status: response.status === 200 ? 'up' : 'down',
                    responseTime,
                    instance: response.data?.container
                };
            } catch (error) {
                checks[serviceUrl] = {
                    status: 'down'
                };
            }
        }

        return checks;
    }

    checkMemory() {
        const usage = process.memoryUsage();
        const rss = usage.rss;
        
        const maxMemory = 512 * 1024 * 1024;
        const percentage = (rss / maxMemory) * 100;
        
        const clampedPercentage = Math.min(percentage, 100);

        return {
            used: Math.round(rss / 1024 / 1024),
            total: Math.round(maxMemory / 1024 / 1024),
            percentage: Math.round(clampedPercentage * 100) / 100
        };
    }
}
