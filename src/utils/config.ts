import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { RepoFlowConfig } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.repoflow');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigService {
  async loadConfig(): Promise<{ username: string; email: string; token: string }> {
    try {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      return {
        username: config.github?.username || process.env['GITHUB_USERNAME'] || 'cybergenii',
        email: config.github?.email || process.env['GITHUB_EMAIL'] || 'cybersgenii@gmail.com',
        token: config.github?.token || process.env['GITHUB_TOKEN'] || process.env['TOKEN'] || ''
      };
    } catch (error) {
      // Return default config if file doesn't exist
      return {
        username: process.env['GITHUB_USERNAME'] || 'cybergenii',
        email: process.env['GITHUB_EMAIL'] || 'cybersgenii@gmail.com',
        token: process.env['GITHUB_TOKEN'] || process.env['TOKEN'] || ''
      };
    }
  }

  async saveConfig(updates: Partial<{ username: string; email: string; token: string }>): Promise<void> {
    try {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
      const currentConfig = await this.loadConfig();
      const newConfig = { ...currentConfig, ...updates };
      
      const config = {
        github: {
          token: newConfig.token,
          username: newConfig.username,
          email: newConfig.email
        },
        defaultBranch: 'main'
      };
      
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }
}

export async function loadConfig(): Promise<RepoFlowConfig> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default config if file doesn't exist
    return {
      github: {
        token: process.env['GITHUB_TOKEN'] || '',
        username: process.env['GITHUB_USERNAME'] || '',
        email: process.env['GITHUB_EMAIL'] || ''
      },
      defaultBranch: 'main',
      defaultAuthor: {
        name: process.env['GIT_USER_NAME'] || '',
        email: process.env['GIT_USER_EMAIL'] || ''
      }
    };
  }
}

export async function saveConfig(config: RepoFlowConfig): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error}`);
  }
}

export async function getConfigPath(): Promise<string> {
  return CONFIG_FILE;
}
