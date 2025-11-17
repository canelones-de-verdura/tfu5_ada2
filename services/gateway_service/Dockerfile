FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache wget

COPY services/shared ../shared

RUN cd ../shared/config_client && npm ci --omit=dev

# Copy gateway service files
COPY services/gateway_service/package.json ./
COPY services/gateway_service/package-lock.json* ./

RUN npm ci --omit=dev

# Copy gateway source code
COPY services/gateway_service ./

EXPOSE 8080

CMD ["node", "index.js"]
