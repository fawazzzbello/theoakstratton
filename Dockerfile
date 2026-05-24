# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React frontend with verbose output
RUN echo "Building React frontend..." && npm run build && echo "Build complete" && ls -la dist/

# Production stage
FROM node:18-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Verify dist folder exists and has content
RUN echo "Verifying dist folder..." && ls -la dist/ && du -sh dist/

# Copy server and other necessary files
COPY server.js .
COPY database/ ./database/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application with logging
CMD ["node", "server.js"]

