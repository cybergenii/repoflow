import { CommitInfo, CommitOptions, PushOptions, RepoStatus } from '../types';
export declare class GitService {
    private workingDir;
    constructor(workingDir: string);
    initRepository(branch?: string): Promise<void>;
    addRemote(name: string, url: string): Promise<void>;
    setRemoteUrl(name: string, url: string): Promise<void>;
    addFiles(files?: string[]): Promise<void>;
    commit(options: CommitOptions): Promise<void>;
    push(options: PushOptions): Promise<void>;
    getStatus(): Promise<RepoStatus>;
    getCommits(count?: number): Promise<CommitInfo[]>;
    private createMultipleCommits;
    private runCommand;
    private extractRepoName;
}
//# sourceMappingURL=git.d.ts.map