# ==========================================
# STAGE 1: Build React + Vite Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments (default to relative /api for seamless reverse proxying)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code and configs
COPY . .

# Compile TypeScript and build production bundle into /app/dist
RUN npm run build

# ==========================================
# STAGE 2: High-Performance Nginx Web Server
# ==========================================
FROM nginx:alpine AS runner

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration (reverse proxy + SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check probe against local Nginx endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
