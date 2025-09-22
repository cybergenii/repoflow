"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GitService {
    constructor(workingDir) {
        this.workingDir = workingDir || process.cwd();
    }
    // New methods for enhanced CLI
    async init() {
        await this.runCommand('git init');
    }
    async addRemote(name, url) {
        await this.runCommand(`git remote add ${name} ${url}`);
    }
    async addAll() {
        await this.runCommand('git add -A');
    }
    async setUser(name, email) {
        await this.runCommand(`git config user.name "${name}"`);
        await this.runCommand(`git config user.email "${email}"`);
    }
    async push(remote, branch, options = {}) {
        let command = `git push ${remote} ${branch}`;
        if (options.force) {
            command += ' --force';
        }
        await this.runCommand(command);
    }
    async getRemotes() {
        try {
            const { stdout } = await this.runCommand('git remote -v');
            const remotes = {};
            stdout.split('\n').forEach(line => {
                const match = line.match(/^(\w+)\s+(.+?)\s+\(fetch\)$/);
                if (match && match[1] && match[2]) {
                    remotes[match[1]] = match[2];
                }
            });
            return remotes;
        }
        catch {
            return {};
        }
    }
    async initRepository(branch = 'main') {
        await this.runCommand('git init');
        await this.runCommand(`git branch -M ${branch}`);
    }
    async setRemoteUrl(name, url) {
        await this.runCommand(`git remote set-url ${name} ${url}`);
    }
    async addFiles(files = ['-A']) {
        const filesStr = files.join(' ');
        await this.runCommand(`git add ${filesStr}`);
    }
    async commit(options) {
        const { message, date, author, multiple, spread, force } = options;
        if (!message) {
            throw new Error('Commit message is required');
        }
        // Set author if provided
        if (author) {
            await this.runCommand(`git config user.name "${author.name}"`);
            await this.runCommand(`git config user.email "${author.email}"`);
        }
        // Handle multiple commits
        if (multiple && multiple > 1) {
            await this.createMultipleCommits(message, multiple, spread || 0, date);
            return;
        }
        // Set commit date if provided
        if (date) {
            process.env['GIT_AUTHOR_DATE'] = date;
            process.env['GIT_COMMITTER_DATE'] = date;
        }
        try {
            if (force) {
                await this.runCommand(`git commit --allow-empty -m "${message}"`);
            }
            else {
                await this.runCommand(`git commit -m "${message}"`);
            }
        }
        finally {
            // Clean up environment variables
            delete process.env['GIT_AUTHOR_DATE'];
            delete process.env['GIT_COMMITTER_DATE'];
        }
    }
    async getStatus() {
        try {
            const { stdout: statusOutput } = await this.runCommand('git status --porcelain');
            const { stdout: branchOutput } = await this.runCommand('git branch --show-current');
            const { stdout: remoteUrl } = await this.runCommand('git remote get-url origin');
            const lines = statusOutput.split('\n').filter(line => line.trim());
            const staged = lines.filter(line => line.startsWith('A')).map(line => line.substring(3));
            const modified = lines.filter(line => line.startsWith('M')).map(line => line.substring(3));
            const untracked = lines.filter(line => line.startsWith('??')).map(line => line.substring(3));
            const stagedFiles = staged.length;
            const hasChanges = lines.length > 0;
            // Get last commit info
            let lastCommit = '';
            try {
                const { stdout: commitOutput } = await this.runCommand('git log -1 --format="%h"');
                lastCommit = commitOutput.trim();
            }
            catch {
                // No commits yet
            }
            // Get unpushed commits count
            let unpushedCommits = 0;
            try {
                const { stdout: unpushedOutput } = await this.runCommand(`git rev-list --count origin/${branchOutput.trim()}..${branchOutput.trim()}`);
                unpushedCommits = parseInt(unpushedOutput.trim()) || 0;
            }
            catch {
                // No upstream or no commits
            }
            return {
                name: this.extractRepoName(remoteUrl),
                url: remoteUrl.trim(),
                branch: branchOutput.trim(),
                lastCommit,
                unpushedCommits,
                hasChanges,
                stagedFiles,
                staged,
                modified,
                untracked
            };
        }
        catch (error) {
            throw new Error(`Failed to get repository status: ${error}`);
        }
    }
    async getCommits(count = 10) {
        try {
            const { stdout } = await this.runCommand(`git log -${count} --format="%H|%s|%an|%ci|%ai" --no-pager`);
            return stdout.split('\n')
                .filter(line => line.trim())
                .map(line => {
                const [hash, message, author, date, committerDate] = line.split('|');
                return {
                    hash: hash || '',
                    message: message || '',
                    author: author || '',
                    date: date || '',
                    committerDate: committerDate || ''
                };
            });
        }
        catch (error) {
            throw new Error(`Failed to get commits: ${error}`);
        }
    }
    async createMultipleCommits(baseMessage, count, spreadHours, startDate) {
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getTime() - (spreadHours * 60 * 60 * 1000));
        const timeStep = spreadHours > 0 ? (spreadHours * 60 * 60 * 1000) / count : 0;
        for (let i = 0; i < count; i++) {
            const commitDate = new Date(start.getTime() + (i * timeStep));
            const isoDate = commitDate.toISOString();
            const message = i === 0 ? baseMessage : `${baseMessage} (part ${i + 1}/${count})`;
            process.env['GIT_AUTHOR_DATE'] = isoDate;
            process.env['GIT_COMMITTER_DATE'] = isoDate;
            try {
                await this.runCommand(`git commit --allow-empty -m "${message}"`);
            }
            finally {
                delete process.env['GIT_AUTHOR_DATE'];
                delete process.env['GIT_COMMITTER_DATE'];
            }
        }
    }
    async runCommand(command) {
        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: this.workingDir,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            return { stdout, stderr };
        }
        catch (error) {
            throw new Error(`Command failed: ${command}\nError: ${error.message}`);
        }
    }
    extractRepoName(url) {
        const match = url.match(/github\.com\/[^\/]+\/([^\/]+?)(?:\.git)?$/);
        return match?.[1] || 'unknown';
    }
}
exports.GitService = GitService;
//# sourceMappingURL=git.js.map