FROM node:20-alpine

WORKDIR /usr/src/app

# Copy shared modules first
COPY services/shared ./services/shared

# Copy gateway service files
COPY services/gateway_service/package.json ./
COPY services/gateway_service/package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev

# Copy gateway source code
COPY services/gateway_service ./

EXPOSE 8080

CMD ["node", "index.js"]
