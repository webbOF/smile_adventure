# Use Node 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 3000
EXPOSE 3000

# Set environment variables to disable fast refresh issues
ENV FAST_REFRESH=false
ENV WDS_SOCKET_PORT=0

# Start the development server
CMD ["npm", "start"]
