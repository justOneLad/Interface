# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# IPFS deployment stage
FROM alpine:latest AS ipfs-deploy

# Install dependencies
RUN apk add --no-cache curl jq

# Install IPFS Kubo
RUN wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz && \
    tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz && \
    cd kubo && \
    sh install.sh && \
    rm -rf /kubo_v0.24.0_linux-amd64.tar.gz /kubo

# Copy build artifacts from builder
COPY --from=builder /app/build /app/build

WORKDIR /app

# Create deployment script
RUN echo '#!/bin/sh' > /deploy.sh && \
    echo 'ipfs init' >> /deploy.sh && \
    echo 'ipfs daemon &' >> /deploy.sh && \
    echo 'sleep 5' >> /deploy.sh && \
    echo 'IPFS_HASH=$(ipfs add -r /app/build | tail -n 1 | awk "{print \$2}")' >> /deploy.sh && \
    echo 'echo "Deployed to IPFS with hash: $IPFS_HASH"' >> /deploy.sh && \
    echo 'echo "Access via: https://ipfs.io/ipfs/$IPFS_HASH"' >> /deploy.sh && \
    echo 'echo "Or: https://gateway.pinata.cloud/ipfs/$IPFS_HASH"' >> /deploy.sh && \
    echo 'echo "$IPFS_HASH" > /app/ipfs-hash.txt' >> /deploy.sh && \
    chmod +x /deploy.sh

CMD ["/deploy.sh"]
