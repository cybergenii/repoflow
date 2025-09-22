"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const axios_1 = __importDefault(require("axios"));
class GitHubService {
    constructor(config) {
        this.client = axios_1.default.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'RepoFlow/1.0.0'
            }
        });
    }
    async createRepository(repoConfig) {
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
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to create repository: ${error.response?.data?.message || error.message}`,
                error: error.message
            };
        }
    }
    async getRepository(owner, repo) {
        try {
            const response = await this.client.get(`/repos/${owner}/${repo}`);
            return {
                success: true,
                message: `Repository '${owner}/${repo}' found`,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Repository '${owner}/${repo}' not found or inaccessible`,
                error: error.message
            };
        }
    }
    async getUserInfo() {
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
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get user information',
                error: error.message
            };
        }
    }
    async validateToken() {
        try {
            await this.client.get('/user');
            return true;
        }
        catch {
            return false;
        }
    }
    extractRepoInfo(url) {
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
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.js.map