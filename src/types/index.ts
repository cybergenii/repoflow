export interface RepoConfig {
  name: string;
  url?: string;
  private?: boolean;
  description?: string;
  branch?: string;
}

export interface CommitOptions {
  message?: string;
  date?: string;
  author?: {
    name: string;
    email: string;
  } | undefined;
  multiple?: number;
  spread?: number; // hours
  backdate?: boolean;
  force?: boolean;
}

export interface PushOptions {
  branch?: string;
  force?: boolean;
  upstream?: boolean;
}

export interface GitHubConfig {
  token: string;
  username?: string;
  email?: string;
}

export interface RepoFlowConfig {
  github: GitHubConfig;
  defaultBranch?: string;
  defaultAuthor?: {
    name: string;
    email: string;
  };
}

export interface ScriptResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface RepoStatus {
  name: string;
  url: string;
  branch: string;
  lastCommit?: string;
  unpushedCommits: number;
  hasChanges: boolean;
  stagedFiles: number;
  staged: string[];
  modified: string[];
  untracked: string[];
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  committerDate: string;
}

export interface UIOptions {
  port?: number;
  host?: string;
  open?: boolean;
}

export interface CLICommand {
  command: string;
  description: string;
  options: CLIOption[];
  action: (args: any) => Promise<void>;
}

export interface CLIOption {
  flags: string;
  description: string;
  required?: boolean;
  default?: any;
  type?: 'string' | 'number' | 'boolean' | 'array';
}
