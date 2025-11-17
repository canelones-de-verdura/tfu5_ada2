FROM node:20-slim

WORKDIR /app

# Copy shared dependencies first
COPY services/shared/config_client ./shared/config_client
COPY services/shared/db ./shared/db
COPY services/shared/redis ./shared/redis

# Install shared dependencies
RUN cd shared/config_client && npm ci --omit=dev && \
    cd ../db && npm ci --omit=dev && \
    cd ../redis && npm ci --omit=dev

# Copy customer service
COPY services/customer_service/package*.json ./

RUN npm ci --omit=dev

COPY services/customer_service .

EXPOSE 3000

CMD ["npm", "start"]
