# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build arguments
ARG VITE_BASE_URL
ARG VITE_APP_URL

# Create .env for Vite build
RUN echo "VITE_BASE_URL=${VITE_BASE_URL}" > .env && \
    echo "VITE_APP_URL=${VITE_APP_URL}" >> .env

# Copy source code
COPY . .

# Build application
RUN npm run build

# ---------- Production Stage ----------
FROM httpd:2.4-alpine

# Enable mod_rewrite for React Router
RUN sed -i \
    -e 's/^#LoadModule rewrite_module/LoadModule rewrite_module/' \
    /usr/local/apache2/conf/httpd.conf

# Copy built application
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/

# Copy Apache configuration
COPY apache-app.conf /usr/local/apache2/conf/extra/app-vhost.conf

# Include custom configuration
RUN echo "Include conf/extra/app-vhost.conf" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 80