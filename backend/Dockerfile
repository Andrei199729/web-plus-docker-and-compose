FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build \
    && rm -rf ./src/ \
    && rm -rf node ./node_modules/

FROM node:16-alpine as backend
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm i pm2 -g
COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./
EXPOSE 4000
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]