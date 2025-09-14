# -------- Stage 1: Build --------
FROM node:latest AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Add build argument and environment variable for Vite
ARG VITE_STREAM_API_KEY
ENV VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY

RUN npm run build

# Production stage
FROM nginx:alpine

# Add our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]