import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { CommitInfo, CommitOptions, RepoStatus } from '../types';

const execAsync = promisify(exec);

export class GitService {
  private workingDir: string;

  constructor(workingDir?: string) {
    this.workingDir = workingDir || process.cwd();
  }

  // New methods for enhanced CLI
  async init(): Promise<void> {
    await this.runCommand('git init');
  }

  async addRemote(name: string, url: string): Promise<void> {
    await this.runCommand(`git remote add ${name} ${url}`);
  }

  async addAll(): Promise<void> {
    await this.runCommand('git add -A');
  }

  async setUser(name: string, email: string): Promise<void> {
    await this.runCommand(`git config user.name "${name}"`);
    await this.runCommand(`git config user.email "${email}"`);
  }

  async push(remote: string, branch: string, options: { force?: boolean; token?: string; setUpstream?: boolean } = {}): Promise<void> {
    // If token is provided, temporarily update the remote URL with authentication
    let originalUrl = '';
    if (options.token) {
      try {
        const { stdout } = await this.runCommand(`git remote get-url ${remote}`);
        originalUrl = stdout.trim();
        
        // Add token to URL for authentication
        const authenticatedUrl = this.addTokenToUrl(originalUrl, options.token);
        await this.runCommand(`git remote set-url ${remote} "${authenticatedUrl}"`);
      } catch (error) {
        // If getting/setting URL fails, proceed without token authentication
      }
    }
    
    try {
      let command = `git push`;
      
      // Add -u flag to set upstream if needed (first push)
      if (options.setUpstream) {
        command += ' -u';
      }
      
      command += ` ${remote} ${branch}`;
      
    if (options.force) {
      command += ' --force';
    }
      
    await this.runCommand(command);
    } finally {
      // Restore original URL if we modified it
      if (originalUrl) {
        await this.runCommand(`git remote set-url ${remote} "${originalUrl}"`).catch(() => {});
      }
    }
  }

  private addTokenToUrl(url: string, token: string): string {
    // Handle HTTPS URLs
    if (url.startsWith('https://github.com/')) {
      return url.replace('https://github.com/', `https://${token}@github.com/`);
    }
    // Handle git@ URLs - convert to HTTPS with token
    if (url.startsWith('git@github.com:')) {
      const path = url.replace('git@github.com:', '');
      return `https://${token}@github.com/${path}`;
    }
    return url;
  }

  async getRemotes(): Promise<Record<string, string>> {
    try {
      const { stdout } = await this.runCommand('git remote -v');
      const remotes: Record<string, string> = {};
      
      stdout.split('\n').forEach(line => {
        const match = line.match(/^(\w+)\s+(.+?)\s+\(fetch\)$/);
        if (match && match[1] && match[2]) {
          remotes[match[1]] = match[2];
        }
      });
      
      return remotes;
    } catch {
      return {};
    }
  }

  async isRepository(): Promise<boolean> {
    try {
      await this.runCommand('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }

  async initRepository(branch: string = 'main'): Promise<void> {
    await this.runCommand('git init');
    await this.runCommand(`git branch -M ${branch}`);
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await this.runCommand('git branch --show-current');
      return stdout.trim() || 'main';
    } catch {
      return 'main';
    }
  }

  async hasUpstream(branch: string): Promise<boolean> {
    try {
      await this.runCommand(`git rev-parse --abbrev-ref ${branch}@{upstream}`);
      return true;
    } catch {
      return false;
    }
  }

  async setRemoteUrl(name: string, url: string): Promise<void> {
    await this.runCommand(`git remote set-url ${name} ${url}`);
  }

  async addFiles(files: string[] = ['-A']): Promise<void> {
    const filesStr = files.join(' ');
    await this.runCommand(`git add ${filesStr}`);
  }

  async commit(options: CommitOptions): Promise<void> {
    const { message, date, author, multiple, spread, force } = options;
    
    if (!message) {
      throw new Error('Commit message is required');
    }

    // Set author if provided
    if (author) {
      await this.runCommand(`git config user.name "${author.name}"`);
      await this.runCommand(`git config user.email "${author.email}"`);
    }

    // Handle multiple commits
    if (multiple && multiple > 1) {
      await this.createMultipleCommits(message, multiple, spread || 0, date);
      return;
    }

        // Set commit date if provided
        if (date) {
          process.env['GIT_AUTHOR_DATE'] = date;
          process.env['GIT_COMMITTER_DATE'] = date;
        }

    try {
      if (force) {
        await this.runCommand(`git commit --allow-empty -m "${message}"`);
      } else {
        await this.runCommand(`git commit -m "${message}"`);
      }
        } finally {
          // Clean up environment variables
          delete process.env['GIT_AUTHOR_DATE'];
          delete process.env['GIT_COMMITTER_DATE'];
        }
  }


  async getStatus(): Promise<RepoStatus> {
    try {
      const { stdout: statusOutput } = await this.runCommand('git status --porcelain');
      const { stdout: branchOutput } = await this.runCommand('git branch --show-current');
      const { stdout: remoteUrl } = await this.runCommand('git remote get-url origin');
      
      const lines = statusOutput.split('\n').filter(line => line.trim());
      const staged = lines.filter(line => line.startsWith('A')).map(line => line.substring(3));
      const modified = lines.filter(line => line.startsWith('M')).map(line => line.substring(3));
      const untracked = lines.filter(line => line.startsWith('??')).map(line => line.substring(3));
      
      const stagedFiles = staged.length;
      const hasChanges = lines.length > 0;
      
      // Get last commit info
      let lastCommit = '';
      try {
        const { stdout: commitOutput } = await this.runCommand('git log -1 --format="%h"');
        lastCommit = commitOutput.trim();
      } catch {
        // No commits yet
      }

      // Get unpushed commits count
      let unpushedCommits = 0;
      try {
        const { stdout: unpushedOutput } = await this.runCommand(`git rev-list --count origin/${branchOutput.trim()}..${branchOutput.trim()}`);
        unpushedCommits = parseInt(unpushedOutput.trim()) || 0;
      } catch {
        // No upstream or no commits
      }

      return {
        name: this.extractRepoName(remoteUrl),
        url: remoteUrl.trim(),
        branch: branchOutput.trim(),
        lastCommit,
        unpushedCommits,
        hasChanges,
        stagedFiles,
        staged,
        modified,
        untracked
      };
    } catch (error) {
      throw new Error(`Failed to get repository status: ${error}`);
    }
  }

  async getCommits(count: number = 10): Promise<CommitInfo[]> {
    try {
      const { stdout } = await this.runCommand(
        `git log -${count} --format="%H|%s|%an|%ci|%ai" --no-pager`
      );
      
      return stdout.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [hash, message, author, date, committerDate] = line.split('|');
          return {
            hash: hash || '',
            message: message || '',
            author: author || '',
            date: date || '',
            committerDate: committerDate || ''
          };
        });
    } catch (error) {
      throw new Error(`Failed to get commits: ${error}`);
    }
  }

  private async createMultipleCommits(
    baseMessage: string, 
    count: number, 
    spreadHours: number, 
    startDate?: string
  ): Promise<void> {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - (spreadHours * 60 * 60 * 1000));
    
    const timeStep = spreadHours > 0 ? (spreadHours * 60 * 60 * 1000) / count : 0;
    
    for (let i = 0; i < count; i++) {
      const commitDate = new Date(start.getTime() + (i * timeStep));
      const isoDate = commitDate.toISOString();
      
      const message = i === 0 ? baseMessage : `${baseMessage} (part ${i + 1}/${count})`;
      
      // Add all changes before each commit to ensure there's something to commit
      await this.addAll();
      
          process.env['GIT_AUTHOR_DATE'] = isoDate;
          process.env['GIT_COMMITTER_DATE'] = isoDate;
      
      try {
        await this.runCommand(`git commit --allow-empty -m "${message}"`);
      } finally {
        delete process.env['GIT_AUTHOR_DATE'];
        delete process.env['GIT_COMMITTER_DATE'];
      }
    }
  }

  private async runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    // Try different shell configurations for better compatibility
    const shellOptions = this.getShellOptions();
    
    for (let i = 0; i < shellOptions.length; i++) {
      const shellConfig = shellOptions[i];
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: this.workingDir,
          ...shellConfig,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      return { stdout, stderr };
    } catch (error: any) {
        // If this is the last option, try spawn as fallback
        if (i === shellOptions.length - 1) {
          try {
            return await this.runCommandWithSpawn(command);
          } catch (spawnError: any) {
            const isTermux = process.env['TERMUX_VERSION'] || 
                            process.env['PREFIX']?.includes('com.termux') ||
                            process.cwd().includes('com.termux');
            
            let errorMessage = `Command failed: ${command}\nError: ${error.message}`;
            
            if (isTermux) {
              errorMessage += `\n\nTermux Environment Detected:\n`;
              errorMessage += `- TERMUX_VERSION: ${process.env['TERMUX_VERSION'] || 'not set'}\n`;
              errorMessage += `- PREFIX: ${process.env['PREFIX'] || 'not set'}\n`;
              errorMessage += `- Working Directory: ${this.workingDir}\n`;
              errorMessage += `- Platform: ${process.platform}\n`;
              errorMessage += `\nTroubleshooting:\n`;
              errorMessage += `1. Make sure git is installed: pkg install git\n`;
              errorMessage += `2. Check if shell is available: which bash\n`;
              errorMessage += `3. Try running: git --version\n`;
              errorMessage += `4. Spawn fallback also failed: ${spawnError.message}\n`;
            }
            
            throw new Error(errorMessage);
          }
        }
        // Continue to next shell option
        continue;
      }
    }
    
    throw new Error(`Command failed: ${command}\nError: No suitable shell found`);
  }

  private async runCommandWithSpawn(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const isTermux = process.env['TERMUX_VERSION'] || 
                      process.env['PREFIX']?.includes('com.termux') ||
                      process.cwd().includes('com.termux');
      
      // For Termux, try to use bash directly
      const shell = isTermux ? 'bash' : (process.platform === 'win32' ? 'cmd.exe' : 'sh');
      const args = isTermux ? ['-c', command] : (process.platform === 'win32' ? ['/c', command] : ['-c', command]);
      
      const child = spawn(shell, args, {
        cwd: this.workingDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${command}\nStderr: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`Spawn failed: ${error.message}`));
      });
    });
  }

  private getShellOptions(): Array<{ shell?: string }> {
    const options: Array<{ shell?: string }> = [];
    
    // Check if we're in Termux (Android) - multiple detection methods
    const isTermux = process.env['TERMUX_VERSION'] || 
                     process.env['PREFIX']?.includes('com.termux') ||
                     process.cwd().includes('com.termux');
    
    if (isTermux) {
      // Try Termux-specific shells first
      options.push({ shell: '/data/data/com.termux/files/usr/bin/bash' });
      options.push({ shell: '/data/data/com.termux/files/usr/bin/sh' });
      options.push({ shell: '/system/bin/sh' });
      options.push({ shell: 'bash' });
      options.push({ shell: 'sh' });
    }
    
    // Platform-specific options
    if (process.platform === 'win32') {
      options.push({ shell: 'cmd.exe' });
      options.push({ shell: 'powershell.exe' });
    } else {
      // Unix-like systems
      if (process.env['SHELL']) {
        options.push({ shell: process.env['SHELL'] });
      }
      options.push({ shell: '/bin/bash' });
      options.push({ shell: '/bin/sh' });
    }
    
    // Fallback: let Node.js auto-detect (no shell specified)
    options.push({});
    
    return options;
  }

  private extractRepoName(url: string): string {
    const match = url.match(/github\.com\/[^\/]+\/([^\/]+?)(?:\.git)?$/);
    return match?.[1] || 'unknown';
  }
}
