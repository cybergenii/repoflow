import { GitHubConfig, ScriptResult } from '../types';
export declare class GitHubService {
    private client;
    constructor(config?: GitHubConfig);
    createRepository(name: string, isPrivate?: boolean): Promise<string>;
    getUsername(): Promise<string>;
    getRepository(owner: string, repo: string): Promise<ScriptResult>;
    getUserInfo(): Promise<ScriptResult>;
    validateToken(): Promise<boolean>;
    extractRepoInfo(url: string): {
        owner: string;
        repo: string;
    } | null;
    getUserRepositories(): Promise<any[]>;
    deleteRepository(owner: string, repo: string): Promise<void>;
    updateRepository(owner: string, repo: string, updates: {
        name?: string;
        description?: string;
        private?: boolean;
    }): Promise<any>;
}
//# sourceMappingURL=github.d.ts.map