import axios, { AxiosInstance } from 'axios';
import { GitHubConfig, RepoConfig, ScriptResult } from '../types';

export class GitHubService {
  private client: AxiosInstance;

  constructor(config: GitHubConfig) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RepoFlow/1.0.0'
      }
    });
  }

  async createRepository(repoConfig: RepoConfig): Promise<ScriptResult> {
    try {
      const response = await this.client.post('/user/repos', {
        name: repoConfig.name,
        description: repoConfig.description || '',
        private: repoConfig.private || false,
        auto_init: false
      });

      return {
        success: true,
        message: `Repository '${repoConfig.name}' created successfully`,
        data: {
          cloneUrl: response.data.clone_url,
          sshUrl: response.data.ssh_url,
          htmlUrl: response.data.html_url
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to create repository: ${error.response?.data?.message || error.message}`,
        error: error.message
      };
    }
  }

  async getRepository(owner: string, repo: string): Promise<ScriptResult> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      
      return {
        success: true,
        message: `Repository '${owner}/${repo}' found`,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Repository '${owner}/${repo}' not found or inaccessible`,
        error: error.message
      };
    }
  }

  async getUserInfo(): Promise<ScriptResult> {
    try {
      const response = await this.client.get('/user');
      
      return {
        success: true,
        message: 'User information retrieved',
        data: {
          username: response.data.login,
          name: response.data.name,
          email: response.data.email,
          avatar: response.data.avatar_url
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get user information',
        error: error.message
      };
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.client.get('/user');
      return true;
    } catch {
      return false;
    }
  }

  extractRepoInfo(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
    if (match) {
      return {
        owner: match[1] || '',
        repo: match[2] || ''
      };
    }
    return null;
  }
}
