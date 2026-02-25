# Use Node.js 20 as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port Hugging Face Spaces expects (7860)
EXPOSE 7860

# Set environment variable for the port
ENV PORT=7860

# Run the app
CMD ["npm", "start"]
