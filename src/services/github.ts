import axios, { AxiosInstance } from 'axios';
import { GitHubConfig, ScriptResult } from '../types';

export class GitHubService {
  private client: AxiosInstance;

  constructor(config?: GitHubConfig) {
    const token = config?.token || process.env['GITHUB_TOKEN'] || process.env['TOKEN'];
    if (!token) {
      throw new Error('GitHub token is required');
    }
    
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RepoFlow/1.0.0'
      }
    });
  }

  // New method for enhanced CLI
  async createRepository(name: string, isPrivate: boolean = false): Promise<string> {
    try {
      const response = await this.client.post('/user/repos', {
        name,
        private: isPrivate,
        auto_init: false
      });

      return response.data.clone_url;
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already exists')) {
        // Repository already exists, return constructed URL
        const username = await this.getUsername();
        return `https://github.com/${username}/${name}.git`;
      }
      throw new Error(`Failed to create repository: ${error.response?.data?.message || error.message}`);
    }
  }

  async getUsername(): Promise<string> {
    try {
      const response = await this.client.get('/user');
      return response.data.login;
    } catch (error) {
      throw new Error('Failed to get GitHub username');
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

  async getUserRepositories(): Promise<any[]> {
    try {
      const response = await this.client.get('/user/repos?sort=updated&per_page=100');
      return response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        updatedAt: repo.updated_at,
        language: repo.language
      }));
    } catch (error: any) {
      console.error('Failed to fetch user repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }
}
