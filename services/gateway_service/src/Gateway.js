import axios from 'axios';
import { CircuitBreaker } from './CircuitBreaker.js';
import { Retry } from './Retry.js';
import { HealthMonitor } from './HealthMonitor.js';

export class Gateway {
    constructor(backendServices) {
        this.backendServices = backendServices;
        this.circuitBreakers = new Map();
        this.retry = new Retry({
            maxAttempts: 2,
            initialDelay: 500,
            maxDelay: 1000,
            backoffMultiplier: 2
        });
        this.healthMonitor = new HealthMonitor(backendServices);
    }

    getCircuitBreaker(key) {
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, new CircuitBreaker({
                failureThreshold: 5,
                resetTimeout: 60000
            }));
        }
        return this.circuitBreakers.get(key);
    }

    async healthCheck(_req, res) {
        try {
            const health = await this.healthMonitor.checkHealth();
            const statusCode = health.status === 'healthy' ? 200 : 
                             health.status === 'degraded' ? 200 : 503;
            res.status(statusCode).json(health);
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    createProxyConFallback(path, serviceKey) {
        const circuitBreaker = this.getCircuitBreaker(serviceKey);

        return async (req, res, next) => {
            let lastError = null;
            let triedServices = 0;

            for (const serviceUrl of this.backendServices) {
                const circuitState = circuitBreaker.getState();
                if (circuitState === 'OPEN' && triedServices === 0) {
                    lastError = new Error('Circuit breaker is OPEN');
                    break;
                }

                try {
                    await circuitBreaker.execute(async () => {
                        await this.retry.execute(async () => {
                            const targetUrl = `${serviceUrl}${req.originalUrl}`;

                            try {
                                const response = await axios({
                                    method: req.method,
                                    url: targetUrl,
                                    data: req.body,
                                    headers: {
                                        ...req.headers,
                                        host: new URL(serviceUrl).host
                                    },
                                    timeout: 2000,
                                    validateStatus: () => true
                                });

                                if (!res.headersSent) {
                                    res.status(response.status).json(response.data);
                                }
                            } catch (error) {
                                const message = error.message || 'Unknown error';
                                throw new Error(`Service unavailable: ${message}`);
                            }
                        }, (attempt, error) => {
                            console.log(`Retry attempt ${attempt} for ${serviceUrl}${req.path}: ${error.message}`);
                        });
                    });

                    break;
                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));
                    triedServices++;
                    continue;
                }
            }

            if (triedServices === this.backendServices.length && res.headersSent === false) {
                if (lastError instanceof Error && lastError.message === 'Circuit breaker is OPEN') {
                    res.status(503).json({
                        error: 'Service temporarily unavailable',
                        circuitState: 'OPEN'
                    });
                } else {
                    res.status(503).json({
                        error: 'All backend services unavailable',
                        message: lastError?.message || 'Unknown error'
                    });
                }
            }
        };
    }
}
