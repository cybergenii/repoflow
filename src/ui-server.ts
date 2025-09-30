#!/usr/bin/env node

import cors from 'cors';
import express from 'express';
import path from 'path';
import { GitService } from './services/git';
import { GitHubService } from './services/github';
import { UIOptions } from './types';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../ui/dist')));

// API Routes
app.get('/api/status', async (req, res) => {
  try {
    const git = new GitService((req.query['dir'] as string) || process.cwd());
    const status = await git.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/commits', async (req, res) => {
  try {
    const git = new GitService((req.query['dir'] as string) || process.cwd());
    const count = parseInt((req.query['count'] as string) || '10') || 10;
    const commits = await git.getCommits(count);
    res.json({ success: true, data: commits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/create-repo', async (req, res) => {
  try {
    console.log('Creating repository with data:', req.body);
    
    // Load config to get GitHub token
    const configService = new (await import('./utils/config')).ConfigService();
    const config = await configService.loadConfig();
    
    if (!config.token) {
      res.status(400).json({ 
        success: false, 
        error: 'GitHub token not configured. Please configure your token first.' 
      });
      return;
    }
    
    const github = new GitHubService({ token: config.token });
    const repoUrl = await github.createRepository(req.body.name, req.body.private);
    console.log('Repository created successfully:', repoUrl);
    res.json({ success: true, data: { cloneUrl: repoUrl, htmlUrl: repoUrl.replace('.git', '') } });
  } catch (error: any) {
    console.error('Failed to create repository:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/config', async (_req, res) => {
  try {
    const configService = new (await import('./utils/config')).ConfigService();
    const config = await configService.loadConfig();
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const configService = new (await import('./utils/config')).ConfigService();
    await configService.saveConfig(req.body);
    res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/github/repos', async (_req, res) => {
  try {
    // Load config to get GitHub token
    const configService = new (await import('./utils/config')).ConfigService();
    const config = await configService.loadConfig();
    
    if (!config.token) {
      res.status(400).json({ 
        success: false, 
        error: 'GitHub token not configured. Please configure your token first.' 
      });
      return;
    }
    
    const github = new GitHubService({ token: config.token });
    const repos = await github.getUserRepositories();
    res.json({ success: true, data: repos });
  } catch (error: any) {
    console.error('Failed to fetch repositories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auto-push', async (req, res) => {
  try {
    const { directory, repoName, commitMessage, date, multipleCommits, spreadHours, isPrivate } = req.body;
    
    // Load config to get GitHub token
    const configService = new (await import('./utils/config')).ConfigService();
    const config = await configService.loadConfig();
    
    if (!config.token) {
      res.status(400).json({ 
        success: false, 
        error: 'GitHub token not configured. Please configure your token first.' 
      });
      return;
    }
    
    const github = new GitHubService({ token: config.token });
    const git = new GitService(directory || process.cwd());
    
    // Check if directory is a git repository
    const isGitRepo = await git.isRepository();
    let repoUrl = '';
    
    if (!isGitRepo) {
      // Create new repository
      repoUrl = await github.createRepository(repoName, isPrivate);
      await git.init();
      await git.addRemote('origin', repoUrl);
    } else {
      // Get existing remote URL
      const remotes = await git.getRemotes();
      repoUrl = remotes['origin'] || '';
    }
    
    // Set git user
    await git.setUser(config.username, config.email);
    
    // Add all files
    await git.addAll();
    
    // Create commits
    const commitCount = parseInt(multipleCommits) || 1;
    const spreadHrs = parseInt(spreadHours) || 0;
    
    for (let i = 0; i < commitCount; i++) {
      let commitDate = date;
      
      if (spreadHrs > 0 && i > 0) {
        const hoursToSubtract = (i * spreadHrs) / (commitCount - 1);
        const baseDate = new Date(date);
        baseDate.setHours(baseDate.getHours() - hoursToSubtract);
        commitDate = baseDate.toISOString();
      }
      
      const message = commitCount > 1 ? 
        `${commitMessage} (${i + 1}/${commitCount})` : 
        commitMessage;
      
      await git.commit({ 
        message, 
        date: commitDate 
      });
    }
    
    // Push to repository
    await git.push('origin', 'main');
    
    res.json({ 
      success: true, 
      message: 'Auto-push completed successfully',
      data: {
        repoUrl: repoUrl.replace('.git', ''),
        cloneUrl: repoUrl,
        commitsCreated: commitCount
      }
    });
  } catch (error: any) {
    console.error('Auto-push failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/commit', async (req, res) => {
  try {
    const { directory, options } = req.body;
    const git = new GitService(directory || process.cwd());
    
    await git.addFiles();
    await git.commit(options);
    
    res.json({ success: true, message: 'Commit created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/push', async (req, res) => {
  try {
    const { directory, options } = req.body;
    const git = new GitService(directory || process.cwd());
    
    await git.push('origin', 'main', options);
    
    res.json({ success: true, message: 'Push completed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    const github = new GitHubService({ token });
    const isValid = await github.validateToken();
    res.json({ success: true, valid: isValid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve UI
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../ui/dist/index.html'));
});

export async function startUIServer(options: UIOptions = {}): Promise<void> {
  const port = options.port || PORT;
  const host = options.host || 'localhost';
  
  return new Promise((resolve, reject) => {
    const server = app.listen(Number(port), host, () => {
      console.log(`🚀 RepoFlow UI server running at http://${host}:${port}`);
      
      if (options.open) {
        const { exec } = require('child_process');
        const url = `http://${host}:${port}`;
        
        const start = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';
        
        exec(`${start} ${url}`);
      }
      resolve();
    });
    
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Try a different port.`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        console.error('❌ Server error:', error);
        reject(error);
      }
    });
  });
}

if (require.main === module) {
  startUIServer();
}
