FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

COPY services/shared ../shared

RUN cd ../shared/config_client && npm ci --omit=dev && \
    cd ../db && npm ci --omit=dev && \
    cd ../redis && npm ci --omit=dev

COPY services/order_service/package*.json ./

RUN npm ci --omit=dev

COPY services/order_service .

EXPOSE 3002

CMD ["npm", "start"]
