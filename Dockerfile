# ==============================================================================
# Multi-Stage Production Dockerfile for Angular Front-End Application
# ==============================================================================

# Stage 1: Build the Angular distribution
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Copy project source files
COPY . .

# Build for production with optimizations
RUN npm run build -- --configuration production

# Stage 2: Serve using Nginx
FROM nginx:alpine AS runtime

# Copy custom Nginx configuration with SPA routing and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production artifacts from build stage
COPY --from=build /app/dist/azure-test-front/browser /usr/share/nginx/html

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
