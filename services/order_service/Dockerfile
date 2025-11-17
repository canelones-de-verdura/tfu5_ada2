FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Copy shared modules to the correct relative path for npm install
COPY services/shared ../shared

# Install shared dependencies
RUN cd ../shared/config_client && npm ci --omit=dev && \
    cd ../db && npm ci --omit=dev && \
    cd ../redis && npm ci --omit=dev

COPY services/customer_service/package*.json ./

RUN npm ci --omit=dev

COPY services/customer_service .

EXPOSE 3000

CMD ["npm", "start"]
