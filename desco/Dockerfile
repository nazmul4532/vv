# Dockerfile for desco-service
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]

