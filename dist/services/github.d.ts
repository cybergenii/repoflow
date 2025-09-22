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
}
//# sourceMappingURL=github.d.ts.map