#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = [
  { name: 'win32', arch: 'x64', ext: '.exe' },
  { name: 'linux', arch: 'x64', ext: '' },
  { name: 'darwin', arch: 'x64', ext: '' },
  { name: 'darwin', arch: 'arm64', ext: '' }
];

console.log('🚀 Building RepoFlow for all platforms...\n');

// Build TypeScript
console.log('📦 Building TypeScript...');
execSync('npm run build', { stdio: 'inherit' });

// Build UI
console.log('🎨 Building React UI...');
execSync('cd ui && npm install && npm run build', { stdio: 'inherit' });

// Build executables with pkg
console.log('🔨 Building executables...');
platforms.forEach(platform => {
  const target = `node18-${platform.name}-${platform.arch}`;
  const outputName = `repoflow-${platform.name}-${platform.arch}${platform.ext}`;
  
  console.log(`Building for ${platform.name}-${platform.arch}...`);
  
  try {
    execSync(`npx pkg dist/cli.js --targets ${target} --output dist/${outputName}`, { stdio: 'inherit' });
    console.log(`✅ Built: dist/${outputName}`);
  } catch (error) {
    console.error(`❌ Failed to build for ${platform.name}-${platform.arch}:`, error.message);
  }
});

// Create distribution packages
console.log('📦 Creating distribution packages...');

const distDir = 'dist-packages';
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy executables
platforms.forEach(platform => {
  const outputName = `repoflow-${platform.name}-${platform.arch}${platform.ext}`;
  const sourcePath = `dist/${outputName}`;
  const destPath = `${distDir}/${outputName}`;
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`📋 Copied: ${outputName}`);
  }
});

// Create install scripts
const installScripts = {
  'install-windows.bat': `@echo off
echo Installing RepoFlow...
copy repoflow-win32-x64.exe %USERPROFILE%\\AppData\\Local\\Microsoft\\WindowsApps\\repoflow.exe
echo RepoFlow installed successfully!
echo You can now use 'repoflow' command from anywhere.
pause`,

  'install-linux.sh': `#!/bin/bash
echo "Installing RepoFlow..."
sudo cp repoflow-linux-x64 /usr/local/bin/repoflow
sudo chmod +x /usr/local/bin/repoflow
echo "RepoFlow installed successfully!"
echo "You can now use 'repoflow' command from anywhere."`,

  'install-macos.sh': `#!/bin/bash
echo "Installing RepoFlow..."
sudo cp repoflow-darwin-x64 /usr/local/bin/repoflow
sudo chmod +x /usr/local/bin/repoflow
echo "RepoFlow installed successfully!"
echo "You can now use 'repoflow' command from anywhere."`
};

Object.entries(installScripts).forEach(([filename, content]) => {
  fs.writeFileSync(`${distDir}/${filename}`, content);
  if (filename.endsWith('.sh')) {
    fs.chmodSync(`${distDir}/${filename}`, '755');
  }
  console.log(`📋 Created: ${filename}`);
});

// Create README for distribution
const distReadme = `# RepoFlow Distribution

This package contains pre-built executables for RepoFlow.

## Installation

### Windows
Run \`install-windows.bat\` as administrator

### Linux
Run \`./install-linux.sh\`

### macOS
Run \`./install-macos.sh\`

## Manual Installation

Copy the appropriate executable for your platform to a directory in your PATH:

- Windows: \`repoflow-win32-x64.exe\`
- Linux: \`repoflow-linux-x64\`
- macOS Intel: \`repoflow-darwin-x64\`
- macOS Apple Silicon: \`repoflow-darwin-arm64\`

## Usage

After installation, you can use RepoFlow from anywhere:

\`\`\`bash
repoflow --help
repoflow ui
\`\`\`

## Web UI

Start the web interface:
\`\`\`bash
repoflow ui
\`\`\`

Then open http://localhost:3000 in your browser.
`;

fs.writeFileSync(`${distDir}/README.md`, distReadme);

console.log('\n🎉 Build completed successfully!');
console.log(`📁 Distribution packages created in: ${distDir}/`);
console.log('\n📋 Available executables:');
platforms.forEach(platform => {
  const outputName = `repoflow-${platform.name}-${platform.arch}${platform.ext}`;
  if (fs.existsSync(`dist/${outputName}`)) {
    console.log(`  ✅ ${outputName}`);
  } else {
    console.log(`  ❌ ${outputName} (failed)`);
  }
});
