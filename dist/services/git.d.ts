import { CommitInfo, CommitOptions, RepoStatus } from '../types';
export declare class GitService {
    private workingDir;
    constructor(workingDir?: string);
    init(): Promise<void>;
    addRemote(name: string, url: string): Promise<void>;
    addAll(): Promise<void>;
    setUser(name: string, email: string): Promise<void>;
    push(remote: string, branch: string, options?: {
        force?: boolean;
        token?: string;
        setUpstream?: boolean;
    }): Promise<void>;
    private addTokenToUrl;
    getRemotes(): Promise<Record<string, string>>;
    isRepository(): Promise<boolean>;
    initRepository(branch?: string): Promise<void>;
    getCurrentBranch(): Promise<string>;
    hasUpstream(branch: string): Promise<boolean>;
    setRemoteUrl(name: string, url: string): Promise<void>;
    addFiles(files?: string[]): Promise<void>;
    commit(options: CommitOptions): Promise<void>;
    getStatus(): Promise<RepoStatus>;
    getCommits(count?: number): Promise<CommitInfo[]>;
    private createMultipleCommits;
    private runCommand;
    private runCommandWithSpawn;
    private getShellOptions;
    private extractRepoName;
}
//# sourceMappingURL=git.d.ts.map