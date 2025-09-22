#!/usr/bin/env node

import cors from 'cors';
import express from 'express';
import path from 'path';
import { GitService } from './services/git';
import { GitHubService } from './services/github';
import { UIOptions } from './types';
import { loadConfig } from './utils/config';

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
    const config = await loadConfig();
    const github = new GitHubService(config.github);
    const result = await github.createRepository(req.body);
    res.json(result);
  } catch (error: any) {
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
  
  app.listen(Number(port), host, () => {
    console.log(`🚀 RepoFlow UI server running at http://${host}:${port}`);
    
    if (options.open) {
      const { exec } = require('child_process');
      const url = `http://${host}:${port}`;
      
      const start = process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' : 'xdg-open';
      
      exec(`${start} ${url}`);
    }
  });
}

if (require.main === module) {
  startUIServer();
}
