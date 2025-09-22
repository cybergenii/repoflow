#!/bin/bash

echo "🚀 RepoFlow Release Creator"
echo "=========================="

if [ -z "$1" ]; then
    echo "Usage: ./create-release.sh [version]"
    echo "Example: ./create-release.sh v1.0.0"
    echo ""
    echo "If no version is provided, v1.0.0 will be used."
    read -p "Enter version (or press Enter for v1.0.0): " version
    if [ -z "$version" ]; then
        version="v1.0.0"
    fi
else
    version="$1"
fi

echo ""
echo "Creating release $version..."
echo ""

node create-release.js "$version"

echo ""
echo "✅ Release creation complete!"
echo "📁 Check the release-$version folder for files"
echo ""
