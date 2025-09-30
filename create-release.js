#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2] || 'v1.0.0';

console.log(`🚀 Creating release ${version}...\n`);

// Step 1: Build everything
console.log('📦 Building all packages...');
execSync('npm run build', { stdio: 'inherit' });
execSync('cd ui && npm run build', { stdio: 'inherit' });
execSync('node build.js', { stdio: 'inherit' });

// Step 2: Build Python package
console.log('🐍 Building Python package...');
execSync('python -m pip install --upgrade pip build twine', { stdio: 'inherit' });
execSync('python -m build', { stdio: 'inherit' });

// Step 3: Build Rust package
console.log('🦀 Building Rust package...');
execSync('cargo build --release', { stdio: 'inherit' });

// Step 4: Create release directory
const releaseDir = `release-${version}`;
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true });
}
fs.mkdirSync(releaseDir, { recursive: true });

// Step 5: Copy executables
console.log('📋 Copying executables...');
const platforms = [
  { name: 'win32', arch: 'x64', ext: '.exe' },
  { name: 'linux', arch: 'x64', ext: '' },
  { name: 'darwin', arch: 'x64', ext: '' },
  { name: 'darwin', arch: 'arm64', ext: '' }
];

platforms.forEach(platform => {
  const outputName = `repoflow-${platform.name}-${platform.arch}${platform.ext}`;
  const sourcePath = `dist-packages/${outputName}`;
  const destPath = `${releaseDir}/${outputName}`;
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${outputName}`);
  } else {
    console.log(`❌ Missing: ${outputName}`);
  }
});

// Step 6: Copy install scripts
const installScripts = [
  'install-windows.bat',
  'install-linux.sh',
  'install-macos.sh',
  'README.md'
];

installScripts.forEach(script => {
  const sourcePath = `dist-packages/${script}`;
  const destPath = `${releaseDir}/${script}`;
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${script}`);
  }
});

// Step 7: Copy Python packages
console.log('🐍 Copying Python packages...');
const pythonFiles = fs.readdirSync('dist').filter(file => 
  file.endsWith('.whl') || file.endsWith('.tar.gz')
);

pythonFiles.forEach(file => {
  const sourcePath = `dist/${file}`;
  const destPath = `${releaseDir}/${file}`;
  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ Copied: ${file}`);
});

// Step 8: Copy Rust executable
console.log('🦀 Copying Rust executable...');
const rustExe = 'target/release/repoflow';
if (fs.existsSync(rustExe)) {
  fs.copyFileSync(rustExe, `${releaseDir}/repoflow-linux-x64-rust`);
  console.log('✅ Copied: repoflow-linux-x64-rust');
}

// Step 9: Create platform-specific packages
console.log('📦 Creating platform-specific packages...');

// Windows package
const windowsDir = `${releaseDir}/windows`;
fs.mkdirSync(windowsDir, { recursive: true });
fs.copyFileSync(`${releaseDir}/repoflow-win32-x64.exe`, `${windowsDir}/repoflow.exe`);
fs.copyFileSync(`${releaseDir}/install-windows.bat`, `${windowsDir}/install.bat`);
fs.copyFileSync(`${releaseDir}/README.md`, `${windowsDir}/README.md`);

execSync(`cd ${windowsDir} && zip -r ../repoflow-windows.zip .`, { stdio: 'inherit' });
console.log('✅ Created: repoflow-windows.zip');

// Linux package
const linuxDir = `${releaseDir}/linux`;
fs.mkdirSync(linuxDir, { recursive: true });
fs.copyFileSync(`${releaseDir}/repoflow-linux-x64`, `${linuxDir}/repoflow`);
fs.copyFileSync(`${releaseDir}/install-linux.sh`, `${linuxDir}/install.sh`);
fs.copyFileSync(`${releaseDir}/README.md`, `${linuxDir}/README.md`);

execSync(`cd ${linuxDir} && tar -czf ../repoflow-linux.tar.gz .`, { stdio: 'inherit' });
console.log('✅ Created: repoflow-linux.tar.gz');

// macOS package
const macosDir = `${releaseDir}/macos`;
fs.mkdirSync(macosDir, { recursive: true });
fs.copyFileSync(`${releaseDir}/repoflow-darwin-x64`, `${macosDir}/repoflow-intel`);
fs.copyFileSync(`${releaseDir}/repoflow-darwin-arm64`, `${macosDir}/repoflow-apple-silicon`);
fs.copyFileSync(`${releaseDir}/install-macos.sh`, `${macosDir}/install.sh`);
fs.copyFileSync(`${releaseDir}/README.md`, `${macosDir}/README.md`);

execSync(`cd ${macosDir} && tar -czf ../repoflow-macos.tar.gz .`, { stdio: 'inherit' });
console.log('✅ Created: repoflow-macos.tar.gz');

// Step 10: Create release notes
const releaseNotes = `# RepoFlow ${version}

## 🚀 What's New

- Complete React UI implementation
- Cross-platform executables
- Multiple package formats (NPM, PyPI, Rust)
- Comprehensive documentation
- Automated release process

## 📦 Downloads

### Platform-Specific Packages
- **repoflow-windows.zip** - Windows executables and installer
- **repoflow-linux.tar.gz** - Linux executable and installer  
- **repoflow-macos.tar.gz** - macOS executables and installer

### Individual Executables
- **repoflow-win32-x64.exe** - Windows 64-bit
- **repoflow-linux-x64** - Linux 64-bit
- **repoflow-darwin-x64** - macOS Intel
- **repoflow-darwin-arm64** - macOS Apple Silicon

### Package Managers
- **Python**: \`pip install repoflow\`
- **NPM**: \`npm install -g repoflow\`
- **Rust**: \`cargo install repoflow\`

## 🚀 Quick Start

### Windows
1. Download \`repoflow-windows.zip\`
2. Extract and run \`install.bat\` as administrator
3. Use \`repoflow\` command anywhere

### Linux
1. Download \`repoflow-linux.tar.gz\`
2. Extract and run \`./install.sh\`
3. Use \`repoflow\` command anywhere

### macOS
1. Download \`repoflow-macos.tar.gz\`
2. Extract and run \`./install.sh\`
3. Use \`repoflow\` command anywhere

## 🌐 Web UI
\`\`\`bash
repoflow ui --open
\`\`\`

## 📚 Documentation
- [README](https://github.com/cybergenii/repoflow#readme)
- [Terminal Usage Guide](https://github.com/cybergenii/repoflow/blob/main/TERMINAL_USAGE.md)

## 🔧 Features
- ✅ Repository Management
- ✅ Smart Commits
- ✅ Backdating
- ✅ Multiple Commits
- ✅ Cross-Platform Support
- ✅ React Web UI
- ✅ CLI Interface
- ✅ Interactive Mode
`;

fs.writeFileSync(`${releaseDir}/RELEASE_NOTES.md`, releaseNotes);

console.log(`\n🎉 Release ${version} created successfully!`);
console.log(`📁 Release files in: ${releaseDir}/`);
console.log(`\n📋 Next steps:`);
console.log(`1. Review the files in ${releaseDir}/`);
console.log(`2. Create a GitHub release:`);
console.log(`   - Go to https://github.com/cybergenii/repoflow/releases`);
console.log(`   - Click "Create a new release"`);
console.log(`   - Tag: ${version}`);
console.log(`   - Title: RepoFlow ${version}`);
console.log(`   - Upload files from ${releaseDir}/`);
console.log(`   - Copy content from ${releaseDir}/RELEASE_NOTES.md`);
console.log(`\n🚀 Or use GitHub CLI:`);
console.log(`   gh release create ${version} --title "RepoFlow ${version}" --notes-file ${releaseDir}/RELEASE_NOTES.md ${releaseDir}/*`);
