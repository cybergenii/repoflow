#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { GitService } from './services/git';
import { GitHubService } from './services/github';
import { CommitOptions, PushOptions, RepoConfig, RepoFlowConfig } from './types';
import { generateCommitMessage } from './utils/commit-messages';
import { loadConfig, saveConfig } from './utils/config';

const program = new Command();

program
  .name('repoflow')
  .description('A comprehensive GitHub repository management tool')
  .version('1.0.0');

// Configure command
program
  .command('config')
  .description('Configure RepoFlow settings')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-u, --username <username>', 'GitHub username')
  .option('-e, --email <email>', 'Git email address')
  .option('-n, --name <name>', 'Git user name')
  .action(async (options) => {
    const spinner = ora('Configuring RepoFlow...').start();
    
    try {
      const config: RepoFlowConfig = {
        github: {
          token: options.token || process.env.GITHUB_TOKEN || '',
          username: options.username,
          email: options.email
        },
        defaultAuthor: {
          name: options.name || '',
          email: options.email || ''
        }
      };

      await saveConfig(config);
      spinner.succeed('Configuration saved successfully!');
    } catch (error) {
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
    const spinner = ora('Creating repository...').start();
    
    try {
      const config = await loadConfig();
      const github = new GitHubService(config.github);
      
      const repoConfig: RepoConfig = {
        name,
        description: options.description,
        private: options.private
      };

      const result = await github.createRepository(repoConfig);
      
      if (result.success) {
        spinner.succeed(`Repository created: ${result.data.htmlUrl}`);
        
        // Initialize local repository if directory is specified
        if (options.dir) {
          const git = new GitService(options.dir);
          await git.initRepository();
          await git.addRemote('origin', result.data.cloneUrl);
          console.log(chalk.green(`Local repository initialized in ${options.dir}`));
        }
      } else {
        spinner.fail(result.message);
        process.exit(1);
      }
    } catch (error) {
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
    const spinner = ora('Pushing changes...').start();
    
    try {
      const config = await loadConfig();
      const github = new GitHubService(config.github);
      const git = new GitService(options.dir || process.cwd());
      
      // Generate commit message if not provided
      const message = options.message || await generateCommitMessage(options.dir || process.cwd());
      
      const commitOptions: CommitOptions = {
        message,
        date: options.date,
        author: config.defaultAuthor,
        multiple: options.multiple,
        spread: options.spread,
        backdate: options.backdate,
        force: options.force
      };

      // Add and commit changes
      await git.addFiles();
      await git.commit(commitOptions);
      
      // Push changes
      const pushOptions: PushOptions = {
        branch: options.branch,
        force: options.backdate || (options.multiple && options.multiple > 1)
      };
      
      await git.push(pushOptions);
      
      spinner.succeed('Changes pushed successfully!');
    } catch (error) {
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
      const git = new GitService(options.dir || process.cwd());
      const status = await git.getStatus();
      
      console.log(chalk.blue('\n📊 Repository Status'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`Name: ${chalk.white(status.name)}`);
      console.log(`URL: ${chalk.blue(status.url)}`);
      console.log(`Branch: ${chalk.green(status.branch)}`);
      console.log(`Last Commit: ${chalk.yellow(status.lastCommit || 'None')}`);
      console.log(`Unpushed Commits: ${chalk.cyan(status.unpushedCommits)}`);
      console.log(`Has Changes: ${status.hasChanges ? chalk.red('Yes') : chalk.green('No')}`);
      console.log(`Staged Files: ${chalk.magenta(status.stagedFiles)}`);
    } catch (error) {
      console.error(chalk.red(`Failed to get status: ${error}`));
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Run RepoFlow in interactive mode')
  .action(async () => {
    console.log(chalk.blue('🚀 Welcome to RepoFlow Interactive Mode!'));
    
    try {
      const config = await loadConfig();
      
      if (!config.github.token) {
        console.log(chalk.yellow('⚠️  No GitHub token found. Please configure first.'));
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'token',
            message: 'Enter your GitHub personal access token:',
            validate: (input) => input.length > 0 || 'Token is required'
          }
        ]);
        
        config.github.token = answers.token;
        await saveConfig(config);
      }
      
      const { action } = await inquirer.prompt([
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
        console.log(chalk.green('👋 Goodbye!'));
        return;
      }
      
      // Execute the selected action
      const args = process.argv.slice(0, 2);
      args.push(action);
      process.argv = args;
      
      await program.parseAsync();
    } catch (error) {
      console.error(chalk.red(`Interactive mode failed: ${error}`));
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
    const { startUIServer } = await import('./ui-server');
    await startUIServer({
      port: parseInt(options.port),
      host: options.host,
      open: options.open
    });
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for available commands.'));
  process.exit(1);
});

// Parse command line arguments
if (require.main === module) {
  program.parse();
}

export { program };
