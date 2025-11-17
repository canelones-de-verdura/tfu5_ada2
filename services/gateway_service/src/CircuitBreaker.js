export const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN'
};

export class CircuitBreaker {
    constructor(options = {}) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.failureThreshold = options.failureThreshold ?? 5;
        this.resetTimeout = options.resetTimeout ?? 60000;
        this.monitoringPeriod = options.monitoringPeriod ?? 60000;
    }

    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }

    shouldAttemptReset() {
        if (!this.lastFailureTime) {
            return true;
        }
        return Date.now() - this.lastFailureTime >= this.resetTimeout;
    }

    getState() {
        return this.state;
    }
    
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
    }
}
