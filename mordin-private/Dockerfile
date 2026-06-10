# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Set up build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_BASE_URL
ARG VITE_PUBLIC_APP_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL

RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files to Nginx public directory under /private/ directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html/private

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
