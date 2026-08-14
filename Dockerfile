# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifest first to leverage layer cache
COPY package.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Build the application (client and server)
RUN npm run build:ssr

# Stage 2: Run the application
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Run as non-root user for security
USER node

# Expose the port the app runs on
EXPOSE 8081

# Run node directly so signals are forwarded correctly (node is PID 1)
CMD ["node", "server.js"]
