import { GitHubConfig, RepoConfig, ScriptResult } from '../types';
export declare class GitHubService {
    private client;
    constructor(config: GitHubConfig);
    createRepository(repoConfig: RepoConfig): Promise<ScriptResult>;
    getRepository(owner: string, repo: string): Promise<ScriptResult>;
    getUserInfo(): Promise<ScriptResult>;
    validateToken(): Promise<boolean>;
    extractRepoInfo(url: string): {
        owner: string;
        repo: string;
    } | null;
}
//# sourceMappingURL=github.d.ts.map