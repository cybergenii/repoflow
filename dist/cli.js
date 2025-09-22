#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const git_1 = require("./services/git");
const github_1 = require("./services/github");
const commit_messages_1 = require("./utils/commit-messages");
const config_1 = require("./utils/config");
const program = new commander_1.Command();
exports.program = program;
const fs_1 = require("fs");
const path_1 = require("path");
const packageJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../package.json'), 'utf-8'));
program
    .name('repoflow')
    .description('A comprehensive GitHub repository management tool')
    .version(packageJson.version);
// Configure command
program
    .command('config')
    .description('Configure RepoFlow settings')
    .option('-t, --token <token>', 'GitHub personal access token')
    .option('-u, --username <username>', 'GitHub username')
    .option('-e, --email <email>', 'Git email address')
    .option('-n, --name <name>', 'Git user name')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Configuring RepoFlow...').start();
    try {
        const config = {
            github: {
                token: options.token || process.env['GITHUB_TOKEN'] || '',
                username: options.username,
                email: options.email
            },
            defaultAuthor: {
                name: options.name || '',
                email: options.email || ''
            }
        };
        await (0, config_1.saveConfig)(config);
        spinner.succeed('Configuration saved successfully!');
    }
    catch (error) {
        spinner.fail(`Configuration failed: ${error}`);
        process.exit(1);
    }
});
// Create repository command
program
    .command('create <name>')
    .description('Create a new GitHub repository')
    .option('-d, --description <description>', 'Repository description')
    .option('-p, --private', 'Create private repository')
    .option('--dir <directory>', 'Target directory (default: current)')
    .action(async (name, options) => {
    const spinner = (0, ora_1.default)('Creating repository...').start();
    try {
        const config = await (0, config_1.loadConfig)();
        const github = new github_1.GitHubService(config.github);
        const repoConfig = {
            name,
            description: options.description,
            private: options.private
        };
        const result = await github.createRepository(repoConfig);
        if (result.success) {
            spinner.succeed(`Repository created: ${result.data.htmlUrl}`);
            // Initialize local repository if directory is specified
            if (options.dir) {
                const git = new git_1.GitService(options.dir);
                await git.initRepository();
                await git.addRemote('origin', result.data.cloneUrl);
                console.log(chalk_1.default.green(`Local repository initialized in ${options.dir}`));
            }
        }
        else {
            spinner.fail(result.message);
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(`Failed to create repository: ${error}`);
        process.exit(1);
    }
});
// Push command
program
    .command('push')
    .description('Push changes to GitHub repository')
    .option('-r, --repo <repo>', 'Repository name or URL')
    .option('-m, --message <message>', 'Commit message')
    .option('-d, --date <date>', 'Commit date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)')
    .option('-b, --branch <branch>', 'Branch name (default: main)')
    .option('--multiple <count>', 'Create multiple commits', parseInt)
    .option('--spread <hours>', 'Spread commits over hours', parseInt)
    .option('--backdate', 'Enable backdating')
    .option('--force', 'Force commit even if no changes')
    .option('--dir <directory>', 'Target directory (default: current)')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Pushing changes...').start();
    try {
        const config = await (0, config_1.loadConfig)();
        const git = new git_1.GitService(options.dir || process.cwd());
        // Generate commit message if not provided
        const message = options.message || await (0, commit_messages_1.generateCommitMessage)(options.dir || process.cwd());
        const commitOptions = {
            message,
            date: options.date || undefined,
            author: config.defaultAuthor || undefined,
            multiple: options.multiple || undefined,
            spread: options.spread || undefined,
            backdate: options.backdate || undefined,
            force: options.force || undefined
        };
        // Add and commit changes
        await git.addFiles();
        await git.commit(commitOptions);
        // Push changes
        const pushOptions = {
            branch: options.branch,
            force: options.backdate || (options.multiple && options.multiple > 1)
        };
        await git.push(pushOptions);
        spinner.succeed('Changes pushed successfully!');
    }
    catch (error) {
        spinner.fail(`Push failed: ${error}`);
        process.exit(1);
    }
});
// Status command
program
    .command('status')
    .description('Show repository status')
    .option('--dir <directory>', 'Target directory (default: current)')
    .action(async (options) => {
    try {
        const git = new git_1.GitService(options.dir || process.cwd());
        const status = await git.getStatus();
        console.log(chalk_1.default.blue('\n📊 Repository Status'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(`Name: ${chalk_1.default.white(status.name)}`);
        console.log(`URL: ${chalk_1.default.blue(status.url)}`);
        console.log(`Branch: ${chalk_1.default.green(status.branch)}`);
        console.log(`Last Commit: ${chalk_1.default.yellow(status.lastCommit || 'None')}`);
        console.log(`Unpushed Commits: ${chalk_1.default.cyan(status.unpushedCommits)}`);
        console.log(`Has Changes: ${status.hasChanges ? chalk_1.default.red('Yes') : chalk_1.default.green('No')}`);
        console.log(`Staged Files: ${chalk_1.default.magenta(status.stagedFiles)}`);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Failed to get status: ${error}`));
        process.exit(1);
    }
});
// Interactive mode
program
    .command('interactive')
    .alias('i')
    .description('Run RepoFlow in interactive mode')
    .action(async () => {
    console.log(chalk_1.default.blue('🚀 Welcome to RepoFlow Interactive Mode!'));
    try {
        const config = await (0, config_1.loadConfig)();
        if (!config.github.token) {
            console.log(chalk_1.default.yellow('⚠️  No GitHub token found. Please configure first.'));
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'token',
                    message: 'Enter your GitHub personal access token:',
                    validate: (input) => input.length > 0 || 'Token is required'
                }
            ]);
            config.github.token = answers.token;
            await (0, config_1.saveConfig)(config);
        }
        const { action } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: 'Create new repository', value: 'create' },
                    { name: 'Push changes', value: 'push' },
                    { name: 'Check status', value: 'status' },
                    { name: 'Configure settings', value: 'config' },
                    { name: 'Exit', value: 'exit' }
                ]
            }
        ]);
        if (action === 'exit') {
            console.log(chalk_1.default.green('👋 Goodbye!'));
            return;
        }
        // Execute the selected action
        const args = process.argv.slice(0, 2);
        args.push(action);
        process.argv = args;
        await program.parseAsync();
    }
    catch (error) {
        console.error(chalk_1.default.red(`Interactive mode failed: ${error}`));
        process.exit(1);
    }
});
// Start UI server
program
    .command('ui')
    .description('Start the web UI server')
    .option('-p, --port <port>', 'Port number (default: 3000)', '3000')
    .option('-h, --host <host>', 'Host address (default: localhost)', 'localhost')
    .option('--open', 'Open browser automatically')
    .action(async (options) => {
    const { startUIServer } = await Promise.resolve().then(() => __importStar(require('./ui-server')));
    await startUIServer({
        port: parseInt(options.port),
        host: options.host,
        open: options.open
    });
});
// Error handling
program.on('command:*', () => {
    console.error(chalk_1.default.red(`Invalid command: ${program.args.join(' ')}`));
    console.log(chalk_1.default.yellow('See --help for available commands.'));
    process.exit(1);
});
// Parse command line arguments
if (require.main === module) {
    program.parse();
}
//# sourceMappingURL=cli.js.map