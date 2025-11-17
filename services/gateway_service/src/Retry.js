export class Retry {
    constructor(options = {}) {
        this.maxAttempts = options.maxAttempts ?? 3;
        this.initialDelay = options.initialDelay ?? 1000;
        this.maxDelay = options.maxDelay ?? 10000;
        this.backoffMultiplier = options.backoffMultiplier ?? 2;
        this.retryableErrors = options.retryableErrors ?? [];
    }

    async execute(operation, onRetry) {
        let lastError = null;
        let delay = this.initialDelay;

        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt === this.maxAttempts) {
                    throw lastError;
                }

                if (!this.isRetryable(lastError)) {
                    throw lastError;
                }

                if (onRetry) {
                    onRetry(attempt, lastError);
                }

                await this.sleep(delay);
                delay = Math.min(delay * this.backoffMultiplier, this.maxDelay);
            }
        }

        throw lastError || new Error('Retry failed');
    }

    isRetryable(error) {
        if (this.retryableErrors.length === 0) {
            return true;
        }

        const errorMessage = error.message.toLowerCase();
        return this.retryableErrors.some(pattern =>
            errorMessage.includes(pattern.toLowerCase())
        );
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
