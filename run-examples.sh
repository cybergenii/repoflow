#!/bin/bash

# RepoFlow Usage Examples
# This script demonstrates how to use RepoFlow after installation

echo "🚀 RepoFlow Usage Examples"
echo "=========================="
echo ""

# Check if repoflow is installed
if command -v repoflow &> /dev/null; then
    echo "✅ RepoFlow is installed and available"
    echo "Version: $(repoflow --version)"
    echo ""
else
    echo "❌ RepoFlow is not installed or not in PATH"
    echo "Please install it first:"
    echo "  npm install -g repoflow"
    echo "  pip install repoflow"
    echo "  cargo install repoflow"
    echo "  Or download from GitHub Releases"
    exit 1
fi

echo "📋 Available Commands:"
echo "======================"
repoflow --help
echo ""

echo "🔧 Configuration Examples:"
echo "=========================="
echo "# Configure with GitHub token"
echo "repoflow config --token YOUR_GITHUB_TOKEN --username yourusername --email your@email.com"
echo ""

echo "📁 Repository Management:"
echo "========================="
echo "# Create a new repository"
echo "repoflow create my-awesome-repo --description 'My awesome project' --private"
echo ""

echo "# Check repository status"
echo "repoflow status"
echo ""

echo "🔄 Push Changes:"
echo "================"
echo "# Basic push"
echo "repoflow push --message 'Add new features'"
echo ""

echo "# Multiple commits over time"
echo "repoflow push --message 'Project development' --multiple 10 --spread 72"
echo ""

echo "# Backdated commit"
echo "repoflow push --message 'Historical work' --date '2024-01-15'"
echo ""

echo "🌐 Web UI:"
echo "=========="
echo "# Start web interface"
echo "repoflow ui"
echo ""

echo "# Start on custom port"
echo "repoflow ui --port 8080"
echo ""

echo "# Start and open browser"
echo "repoflow ui --open"
echo ""

echo "🤖 Interactive Mode:"
echo "===================="
echo "# Run interactive mode"
echo "repoflow interactive"
echo ""

echo "📚 For more information:"
echo "======================="
echo "repoflow --help"
echo "repoflow create --help"
echo "repoflow push --help"
echo "repoflow ui --help"
echo ""

echo "🎉 Happy coding with RepoFlow!"
