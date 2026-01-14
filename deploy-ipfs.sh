#!/bin/bash

# QuackSwap IPFS Deployment Script
set -e

echo "Building QuackSwap interface..."
docker-compose build

echo "Building application..."
docker-compose run --rm build

echo "Deploying to IPFS..."
docker-compose run --rm ipfs-deploy

echo "Deployment complete!"
echo "Check ipfs-hash.txt for the IPFS hash"
