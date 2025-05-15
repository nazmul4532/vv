# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy source files
COPY src ./src

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]

