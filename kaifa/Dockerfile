# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy the source files
COPY src ./src

# Expose the port the app will run on
EXPOSE 4000

# Start the app
CMD ["node", "src/server.js"]

