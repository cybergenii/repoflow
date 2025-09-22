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
    }): Promise<void>;
    getRemotes(): Promise<Record<string, string>>;
    initRepository(branch?: string): Promise<void>;
    setRemoteUrl(name: string, url: string): Promise<void>;
    addFiles(files?: string[]): Promise<void>;
    commit(options: CommitOptions): Promise<void>;
    getStatus(): Promise<RepoStatus>;
    getCommits(count?: number): Promise<CommitInfo[]>;
    private createMultipleCommits;
    private runCommand;
    private extractRepoName;
}
//# sourceMappingURL=git.d.ts.map