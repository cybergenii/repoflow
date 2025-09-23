#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { GitService } from './services/git';
import { GitHubService } from './services/github';
import { ConfigService } from './utils/config';

const program = new Command();
const gitService = new GitService();
const configService = new ConfigService();

// Load package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

program
  .name('repoflow-js')
  .description('Advanced GitHub Repository Manager with Commit Graph Manipulation')
  .version(packageJson.version);

// Auto-push command with all advanced features
program
  .command('auto')
  .description('Automatically detect directory, create repo if needed, and push with advanced features')
  .option('-d, --dir <directory>', 'Target directory (default: current directory)')
  .option('-r, --repo <name_or_url>', 'Repository name or full URL')
  .option('-m, --message <message>', 'Commit message (auto-generated if not provided)')
  .option('-t, --date <date>', 'Commit date (format: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)')
  .option('-p, --private', 'Create private repository (only for new repos)')
  .option('-f, --force', 'Force commit even if no changes detected')
  .option('--backdate', 'Enable advanced backdating for commit graph manipulation')
  .option('--multiple <count>', 'Create multiple commits for better graph presence', '1')
  .option('--spread <hours>', 'Spread multiple commits over specified hours', '0')
  .option('--open', 'Open browser automatically after push')
  .action(async (options) => {
    try {
      await handleAutoPush(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Enhanced create command
program
  .command('create')
  .description('Create a new repository with advanced options')
  .argument('<name>', 'Repository name')
  .option('-p, --private', 'Create private repository')
  .option('-d, --dir <directory>', 'Target directory (default: current directory)')
  .option('-m, --message <message>', 'Initial commit message')
  .option('-t, --date <date>', 'Commit date')
  .option('--backdate', 'Enable backdating')
  .option('--multiple <count>', 'Create multiple commits', '1')
  .option('--spread <hours>', 'Spread commits over hours', '0')
  .action(async (name, options) => {
    try {
      await handleCreate(name, options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Enhanced push command
program
  .command('push')
  .description('Push changes with advanced commit manipulation')
  .option('-d, --dir <directory>', 'Target directory (default: current directory)')
  .option('-m, --message <message>', 'Commit message')
  .option('-t, --date <date>', 'Commit date')
  .option('--backdate', 'Enable backdating')
  .option('--multiple <count>', 'Create multiple commits', '1')
  .option('--spread <hours>', 'Spread commits over hours', '0')
  .option('--force', 'Force push')
  .action(async (options) => {
    try {
      await handlePush(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Status command with enhanced info
program
  .command('status')
  .description('Show detailed repository status and commit graph info')
  .option('-d, --dir <directory>', 'Target directory (default: current directory)')
  .action(async (options) => {
    try {
      await handleStatus(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Interactive command
program
  .command('interactive')
  .description('Interactive mode for guided repository management')
  .action(async () => {
    try {
      await handleInteractive();
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure RepoFlow settings')
  .option('--token <token>', 'Set GitHub token')
  .option('--username <username>', 'Set GitHub username')
  .option('--email <email>', 'Set email address')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    try {
      await handleConfig(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// UI command
program
  .command('ui')
  .description('Start the web UI server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-h, --host <host>', 'Host address', 'localhost')
  .option('--open', 'Open browser automatically')
  .action(async (options) => {
    try {
      await handleUI(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Kill server command
program
  .command('kill')
  .description('Kill the UI server process')
  .option('-p, --port <port>', 'Port of the server to kill', '3000')
  .option('-a, --all', 'Kill all RepoFlow UI servers')
  .action(async (options) => {
    try {
      await handleKill(options);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// Helper function to convert date to Git format
function convertToGitDate(inputDate: string): string {
  if (!inputDate) {
    return new Date().toISOString();
  }
  
  // Add time if only date is provided
  if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    inputDate = `${inputDate} 12:00:00`;
  }
  
  try {
    const date = new Date(inputDate);
    return date.toISOString();
  } catch {
    console.warn('⚠️ Date parsing failed, using current time');
    return new Date().toISOString();
  }
}

// Helper function to generate commit message
function generateAutoCommitMessage(dir: string): string {
  const projectName = path.basename(dir);
  return `🚀 Update ${projectName} project`;
}

// Helper function to create multiple backdated commits
async function createBackdatedCommits(
  baseDate: string,
  commitCount: number,
  spreadHours: number,
  baseMessage: string,
  gitService: GitService
): Promise<void> {
  console.log(`🕰️ Creating ${commitCount} backdated commits over ${spreadHours} hours`);
  
  const baseTimestamp = new Date(baseDate).getTime();
  const spreadMs = spreadHours * 60 * 60 * 1000;
  
  for (let i = 1; i <= commitCount; i++) {
    const hourOffset = (i * spreadMs) / commitCount;
    const commitTimestamp = baseTimestamp + hourOffset;
    const commitDate = new Date(commitTimestamp).toISOString();
    
    const message = `${baseMessage} (part ${i}/${commitCount})`;
    
    console.log(`📝 Creating commit ${i} at ${commitDate}`);
    
    try {
      await gitService.commit({ message, date: commitDate });
      console.log(`✅ Backdated commit ${i} created`);
    } catch (error) {
      console.error(`❌ Failed to create backdated commit ${i}:`, error);
      throw error;
    }
    
    // Small delay to avoid issues
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main auto-push handler
async function handleAutoPush(options: any) {
  const targetDir = options.dir || process.cwd();
  const repoInput = options.repo;
  const commitMessage = options.message;
  const commitDate = options.date;
  const isPrivate = options.private || false;
  const forceCommit = options.force || false;
  const multipleCommits = parseInt(options.multiple) || 1;
  const spreadHours = parseInt(options.spread) || 0;
  
  console.log('🚀 Starting auto-push with advanced features');
  console.log(`📁 Target directory: ${targetDir}`);
  
  // Change to target directory
  if (targetDir !== process.cwd()) {
    process.chdir(targetDir);
  }
  
  // Check if directory has git
  const hasGit = fs.existsSync(path.join(targetDir, '.git'));
  
  let repoUrl: string;
  let repoName: string;
  
  if (repoInput) {
    if (repoInput.startsWith('http')) {
      // It's a full URL - use existing repository
      repoUrl = repoInput;
      repoName = path.basename(repoUrl, '.git');
      console.log(`📁 Using existing repository: ${repoUrl}`);
    } else {
      // It's just a name - create new repository
      repoName = repoInput;
      console.log(`🔨 Creating repository: ${repoName}`);
      
      try {
        const githubService = new GitHubService();
        repoUrl = await githubService.createRepository(repoName, isPrivate);
        console.log(`✅ Repository created: ${repoUrl}`);
      } catch (error) {
        console.error('❌ Failed to create repository:', error);
        throw error;
      }
    }
  } else {
    // Auto-detect or create repository
    repoName = path.basename(targetDir);
    console.log(`🔍 Auto-detecting repository: ${repoName}`);
    
    try {
      const githubService = new GitHubService();
      repoUrl = await githubService.createRepository(repoName, isPrivate);
      console.log(`✅ Repository created: ${repoUrl}`);
    } catch (error) {
      console.error('❌ Failed to create repository:', error);
      throw error;
    }
  }
  
  // Initialize git if needed
  if (!hasGit) {
    console.log('📁 Initializing git repository...');
    await gitService.init();
    await gitService.addRemote('origin', repoUrl);
  }
  
  // Configure git
  const config = await configService.loadConfig();
  await gitService.setUser(config.username, config.email);
  
  // Check status and add files
  console.log('📊 Checking repository status...');
  const status = await gitService.getStatus();
  
  if (status.staged.length === 0 && !forceCommit) {
    console.log('ℹ️ No changes to commit');
    console.log('💡 Use --force (-f) flag to create an empty commit');
    return;
  }
  
  // Add all files
  console.log('📝 Adding all files to git...');
  await gitService.addAll();
  
  // Generate commit message if not provided
  const finalMessage = commitMessage || generateAutoCommitMessage(targetDir);
  console.log(`📝 Commit message: ${finalMessage}`);
  
  // Handle multiple commits or single commit
  if (multipleCommits > 1) {
    console.log(`🔄 Creating ${multipleCommits} commits for better graph presence`);
    
    // First, commit the actual changes
    if (status.staged.length > 0) {
      const gitDate = convertToGitDate(commitDate || new Date().toISOString());
      await gitService.commit({ message: finalMessage, date: gitDate });
    }
    
    // Then create additional backdated commits
    if (spreadHours > 0) {
      await createBackdatedCommits(
        commitDate || new Date().toISOString(),
        multipleCommits - 1,
        spreadHours,
        finalMessage,
        gitService
      );
    }
  } else {
    // Single commit with proper dating
    const gitDate = convertToGitDate(commitDate || new Date().toISOString());
    await gitService.commit({ message: finalMessage, date: gitDate });
  }
  
  console.log('✅ Commit(s) created successfully');
  
  // Show commit details
  console.log('📋 Recent commits:');
  const commits = await gitService.getCommits(5);
  commits.forEach(commit => {
    console.log(`  ${commit.hash} - ${commit.message} (${commit.date})`);
  });
  
  // Push changes
  console.log('🚀 Pushing to remote...');
  try {
    await gitService.push('origin', 'main');
    console.log('✅ Push successful!');
  } catch (error) {
    console.error('❌ Push failed:', error);
    throw error;
  }
  
  console.log('🎉 Operation completed successfully!');
  console.log(`🌐 Repository: ${repoUrl}`);
  
  if (options.open) {
    const open = require('open');
    await open(repoUrl);
  }
}

// Create command handler
async function handleCreate(name: string, options: any) {
  const targetDir = options.dir || process.cwd();
  const isPrivate = options.private || false;
  const commitMessage = options.message;
  const commitDate = options.date;
  const multipleCommits = parseInt(options.multiple) || 1;
  const spreadHours = parseInt(options.spread) || 0;
  
  console.log(`🔨 Creating repository: ${name}`);
  
  try {
    const githubService = new GitHubService();
    const repoUrl = await githubService.createRepository(name, isPrivate);
    console.log(`✅ Repository created: ${repoUrl}`);
    
    // Initialize git in target directory
    if (targetDir !== process.cwd()) {
      process.chdir(targetDir);
    }
    
    await gitService.init();
    await gitService.addRemote('origin', repoUrl);
    
    // Configure git
    const config = await configService.loadConfig();
    await gitService.setUser(config.username, config.email);
    
    // Add all files
    await gitService.addAll();
    
    // Create initial commit
    const message = commitMessage || `🎉 Initial commit for ${name} project`;
    const gitDate = convertToGitDate(commitDate || new Date().toISOString());
    
    await gitService.commit({ message, date: gitDate });
    
    // Create additional commits if requested
    if (multipleCommits > 1 && spreadHours > 0) {
      await createBackdatedCommits(
        commitDate || new Date().toISOString(),
        multipleCommits - 1,
        spreadHours,
        message,
        gitService
      );
    }
    
    // Push to remote
    await gitService.push('origin', 'main');
    
    console.log('🎉 Repository created and pushed successfully!');
    console.log(`🌐 Repository: ${repoUrl}`);
    
  } catch (error) {
    console.error('❌ Failed to create repository:', error);
    throw error;
  }
}

// Push command handler
async function handlePush(options: any) {
  const targetDir = options.dir || process.cwd();
  const commitMessage = options.message;
  const commitDate = options.date;
  const multipleCommits = parseInt(options.multiple) || 1;
  const spreadHours = parseInt(options.spread) || 0;
  const forcePush = options.force || false;
  
  console.log('🚀 Pushing changes with advanced features');
  
  if (targetDir !== process.cwd()) {
    process.chdir(targetDir);
  }
  
  // Check if git repository exists
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.error('❌ Not a git repository. Use "repoflow-js create" first.');
    return;
  }
  
  // Check status
  const status = await gitService.getStatus();
  
  if (status.staged.length === 0) {
    console.log('ℹ️ No changes to commit');
    return;
  }
  
  // Add all files
  await gitService.addAll();
  
  // Generate commit message if not provided
  const finalMessage = commitMessage || generateAutoCommitMessage(process.cwd());
  
  // Handle multiple commits or single commit
  if (multipleCommits > 1) {
    console.log(`🔄 Creating ${multipleCommits} commits for better graph presence`);
    
    // First, commit the actual changes
    const gitDate = convertToGitDate(commitDate || new Date().toISOString());
    await gitService.commit({ message: finalMessage, date: gitDate });
    
    // Then create additional backdated commits
    if (spreadHours > 0) {
      await createBackdatedCommits(
        commitDate || new Date().toISOString(),
        multipleCommits - 1,
        spreadHours,
        finalMessage,
        gitService
      );
    }
  } else {
    // Single commit with proper dating
    const gitDate = convertToGitDate(commitDate || new Date().toISOString());
    await gitService.commit({ message: finalMessage, date: gitDate });
  }
  
  console.log('✅ Commit(s) created successfully');
  
  // Push changes
  try {
    if (forcePush) {
      await gitService.push('origin', 'main', { force: true });
    } else {
      await gitService.push('origin', 'main');
    }
    console.log('✅ Push successful!');
  } catch (error) {
    console.error('❌ Push failed:', error);
    throw error;
  }
}

// Status command handler
async function handleStatus(options: any) {
  const targetDir = options.dir || process.cwd();
  
  if (targetDir !== process.cwd()) {
    process.chdir(targetDir);
  }
  
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log('❌ Not a git repository');
    return;
  }
  
  console.log('📊 Repository Status:');
  console.log(`📁 Directory: ${process.cwd()}`);
  
  const status = await gitService.getStatus();
  console.log(`📝 Staged files: ${status.staged.length}`);
  console.log(`📝 Modified files: ${status.modified.length}`);
  console.log(`📝 Untracked files: ${status.untracked.length}`);
  
  console.log('\n📋 Recent commits:');
  const commits = await gitService.getCommits(10);
  commits.forEach(commit => {
    console.log(`  ${commit.hash} - ${commit.message} (${commit.date})`);
  });
  
  console.log('\n🌐 Remote repositories:');
  const remotes = await gitService.getRemotes();
  Object.entries(remotes).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
}

// Interactive command handler
async function handleInteractive() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🎯 RepoFlow Interactive Mode');
  console.log('This will guide you through repository management step by step.\n');
  
  try {
    // Get target directory
    const targetDir = await new Promise<string>((resolve) => {
      rl.question('📁 Target directory (current): ', (answer: string) => {
        resolve(answer.trim() || process.cwd());
      });
    });
    
    // Get repository name/URL
    const repoInput = await new Promise<string>((resolve) => {
      rl.question('🔗 Repository name or URL: ', (answer: string) => {
        resolve(answer.trim());
      });
    });
    
    // Get commit message
    const commitMessage = await new Promise<string>((resolve) => {
      rl.question('📝 Commit message (auto-generated if empty): ', (answer: string) => {
        resolve(answer.trim());
      });
    });
    
    // Get commit date
    const commitDate = await new Promise<string>((resolve) => {
      rl.question('📅 Commit date (YYYY-MM-DD or empty for now): ', (answer: string) => {
        resolve(answer.trim());
      });
    });
    
    // Get private flag
    const isPrivate = await new Promise<boolean>((resolve) => {
      rl.question('🔒 Private repository? (y/N): ', (answer: string) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
    
    // Get multiple commits
    const multipleCommits = await new Promise<number>((resolve) => {
      rl.question('🔄 Number of commits (1): ', (answer: string) => {
        const num = parseInt(answer.trim()) || 1;
        resolve(num);
      });
    });
    
    // Get spread hours
    const spreadHours = await new Promise<number>((resolve) => {
      rl.question('⏰ Spread commits over hours (0): ', (answer: string) => {
        const num = parseInt(answer.trim()) || 0;
        resolve(num);
      });
    });
    
    rl.close();
    
    // Execute the auto-push
    await handleAutoPush({
      dir: targetDir,
      repo: repoInput,
      message: commitMessage,
      date: commitDate,
      private: isPrivate,
      multiple: multipleCommits.toString(),
      spread: spreadHours.toString()
    });
    
  } catch (error) {
    console.error('❌ Interactive mode failed:', error);
    rl.close();
  }
}

// Config command handler
async function handleConfig(options: any) {
  if (options.show) {
    const config = await configService.loadConfig();
    console.log('📋 Current Configuration:');
    console.log(`  Username: ${config.username}`);
    console.log(`  Email: ${config.email}`);
    console.log(`  Token: ${config.token ? '***' + config.token.slice(-4) : 'Not set'}`);
    return;
  }
  
  if (options.token) {
    await configService.saveConfig({ token: options.token });
    console.log('✅ GitHub token saved');
  }
  
  if (options.username) {
    await configService.saveConfig({ username: options.username });
    console.log('✅ Username saved');
  }
  
  if (options.email) {
    await configService.saveConfig({ email: options.email });
    console.log('✅ Email saved');
  }
  
  if (!options.token && !options.username && !options.email) {
    console.log('Use --help to see available options');
  }
}

// UI command handler
async function handleUI(options: any) {
  const { startUIServer } = await import('./ui-server');
  
  console.log(`🚀 Starting RepoFlow UI server on ${options.host}:${options.port}`);
  
  if (options.open) {
    const open = require('open');
    setTimeout(() => {
      open(`http://${options.host}:${options.port}`);
    }, 2000);
  }
  
  await startUIServer(options.port);
}

// Kill server command handler
async function handleKill(options: any) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    if (options.all) {
      console.log('🔍 Looking for all RepoFlow UI servers...');
      
      // Find all Node.js processes running repoflow UI
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const lines = stdout.split('\n').filter((line: string) => line.includes('node.exe'));
      
      let killedCount = 0;
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          const pid = parts[1].replace(/"/g, '');
          try {
            // Check if this process is running repoflow UI
            const { stdout: cmdline } = await execAsync(`wmic process where processid=${pid} get commandline /format:list`);
            if (cmdline.includes('repoflow') && cmdline.includes('ui')) {
              await execAsync(`taskkill /PID ${pid} /F`);
              console.log(`✅ Killed RepoFlow UI server (PID: ${pid})`);
              killedCount++;
            }
          } catch (err) {
            // Process might have already ended
          }
        }
      }
      
      if (killedCount === 0) {
        console.log('ℹ️  No RepoFlow UI servers found running');
      } else {
        console.log(`🎉 Killed ${killedCount} RepoFlow UI server(s)`);
      }
    } else {
      console.log(`🔍 Looking for RepoFlow UI server on port ${options.port}...`);
      
      // Find process using the specific port
      const { stdout } = await execAsync(`netstat -ano | findstr :${options.port}`);
      const lines = stdout.split('\n').filter((line: string) => line.includes(`:${options.port}`));
      
      if (lines.length === 0) {
        console.log(`ℹ️  No process found using port ${options.port}`);
        return;
      }
      
      // Extract PID from netstat output
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(parseInt(pid))) {
            pids.add(pid);
          }
        }
      }
      
      let killedCount = 0;
      for (const pid of pids) {
        try {
          // Verify it's a Node.js process running repoflow
          const { stdout: cmdline } = await execAsync(`wmic process where processid=${pid} get commandline /format:list`);
          if (cmdline.includes('repoflow') && cmdline.includes('ui')) {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`✅ Killed RepoFlow UI server on port ${options.port} (PID: ${pid})`);
            killedCount++;
          }
        } catch (err) {
          // Process might have already ended or not be repoflow
        }
      }
      
      if (killedCount === 0) {
        console.log(`ℹ️  No RepoFlow UI server found on port ${options.port}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error killing server:', error.message);
    throw error;
  }
}

// Parse command line arguments
program.parse();
