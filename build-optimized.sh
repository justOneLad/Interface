#!/bin/bash

# Build script optimized for memory-constrained environments
# This script disables TypeScript checking and increases Node memory limit

echo "🚀 Starting optimized build process..."
echo ""
echo "Configuration:"
echo "  - TypeScript checking: DISABLED"
echo "  - ESLint: DISABLED"
echo "  - Node memory limit: 3072 MB"
echo ""

# Export environment variables
export NODE_ENV=production
export DISABLE_TYPECHECK=true
export GENERATE_SOURCEMAP=false
export NODE_OPTIONS="--max-old-space-size=3072"

# Run the build
echo "Running build..."
yarn build

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "Build output is in the 'build' directory"
else
    echo ""
    echo "❌ Build failed"
    echo ""
    echo "Try running with more memory:"
    echo "  NODE_OPTIONS='--max-old-space-size=4096' yarn build"
    exit 1
fi
