#!/usr/bin/env python3
"""
RepoFlow CLI - Command line interface for GitHub repository management
"""

import click
import json
import os
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn

from .github_service import GitHubService
from .git_service import GitService
from .config import Config

console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """RepoFlow - A comprehensive GitHub repository management tool"""
    pass

@cli.command()
@click.option('--token', '-t', help='GitHub personal access token')
@click.option('--username', '-u', help='GitHub username')
@click.option('--email', '-e', help='Git email address')
@click.option('--name', '-n', help='Git user name')
def config(token, username, email, name):
    """Configure RepoFlow settings"""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Configuring RepoFlow...", total=None)
        
        try:
            config_data = {
                'github': {
                    'token': token or os.getenv('GITHUB_TOKEN', ''),
                    'username': username,
                    'email': email
                },
                'default_author': {
                    'name': name or '',
                    'email': email or ''
                }
            }
            
            config = Config()
            config.save(config_data)
            progress.update(task, description="[green]Configuration saved successfully!")
        except Exception as e:
            progress.update(task, description=f"[red]Configuration failed: {e}")
            raise click.ClickException(str(e))

@cli.command()
@click.argument('name')
@click.option('--description', '-d', help='Repository description')
@click.option('--private', '-p', is_flag=True, help='Create private repository')
@click.option('--dir', help='Target directory (default: current)')
def create(name, description, private, dir):
    """Create a new GitHub repository"""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Creating repository...", total=None)
        
        try:
            config = Config()
            config_data = config.load()
            github = GitHubService(config_data['github'])
            
            repo_config = {
                'name': name,
                'description': description,
                'private': private
            }
            
            result = github.create_repository(repo_config)
            
            if result['success']:
                progress.update(task, description=f"[green]Repository created: {result['data']['html_url']}")
                
                if dir:
                    git = GitService(dir)
                    git.init_repository()
                    git.add_remote('origin', result['data']['clone_url'])
                    console.print(f"[green]Local repository initialized in {dir}")
            else:
                progress.update(task, description=f"[red]{result['message']}")
                raise click.ClickException(result['message'])
        except Exception as e:
            progress.update(task, description=f"[red]Failed to create repository: {e}")
            raise click.ClickException(str(e))

@cli.command()
@click.option('--repo', '-r', help='Repository name or URL')
@click.option('--message', '-m', help='Commit message')
@click.option('--date', '-d', help='Commit date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)')
@click.option('--branch', '-b', help='Branch name (default: main)')
@click.option('--multiple', type=int, help='Create multiple commits')
@click.option('--spread', type=int, help='Spread commits over hours')
@click.option('--backdate', is_flag=True, help='Enable backdating')
@click.option('--force', is_flag=True, help='Force commit even if no changes')
@click.option('--dir', help='Target directory (default: current)')
def push(repo, message, date, branch, multiple, spread, backdate, force, dir):
    """Push changes to GitHub repository"""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Pushing changes...", total=None)
        
        try:
            config = Config()
            config_data = config.load()
            git = GitService(dir or os.getcwd())
            
            # Generate commit message if not provided
            if not message:
                message = git.generate_commit_message()
            
            commit_options = {
                'message': message,
                'date': date,
                'author': config_data.get('default_author'),
                'multiple': multiple,
                'spread': spread,
                'backdate': backdate,
                'force': force
            }
            
            # Add and commit changes
            git.add_files()
            git.commit(commit_options)
            
            # Push changes
            push_options = {
                'branch': branch,
                'force': backdate or (multiple and multiple > 1)
            }
            
            git.push(push_options)
            
            progress.update(task, description="[green]Changes pushed successfully!")
        except Exception as e:
            progress.update(task, description=f"[red]Push failed: {e}")
            raise click.ClickException(str(e))

@cli.command()
@click.option('--dir', help='Target directory (default: current)')
def status(dir):
    """Show repository status"""
    try:
        git = GitService(dir or os.getcwd())
        status = git.get_status()
        
        table = Table(title="📊 Repository Status")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="white")
        
        table.add_row("Name", status['name'])
        table.add_row("URL", status['url'])
        table.add_row("Branch", status['branch'])
        table.add_row("Last Commit", status.get('last_commit', 'None'))
        table.add_row("Unpushed Commits", str(status['unpushed_commits']))
        table.add_row("Has Changes", "Yes" if status['has_changes'] else "No")
        table.add_row("Staged Files", str(status['staged_files']))
        
        console.print(table)
    except Exception as e:
        console.print(f"[red]Failed to get status: {e}")
        raise click.ClickException(str(e))

@cli.command()
def interactive():
    """Run RepoFlow in interactive mode"""
    console.print("[blue]🚀 Welcome to RepoFlow Interactive Mode![/blue]")
    
    try:
        config = Config()
        config_data = config.load()
        
        if not config_data['github']['token']:
            console.print("[yellow]⚠️  No GitHub token found. Please configure first.[/yellow]")
            token = Prompt.ask("Enter your GitHub personal access token")
            config_data['github']['token'] = token
            config.save(config_data)
        
        while True:
            action = Prompt.ask(
                "What would you like to do?",
                choices=["create", "push", "status", "config", "exit"],
                default="exit"
            )
            
            if action == "exit":
                console.print("[green]👋 Goodbye![/green]")
                break
            elif action == "create":
                name = Prompt.ask("Repository name")
                description = Prompt.ask("Description (optional)", default="")
                private = Confirm.ask("Private repository?", default=False)
                create.callback(name, description, private, None)
            elif action == "push":
                message = Prompt.ask("Commit message (optional)", default="")
                push.callback(None, message, None, None, None, None, False, False, None)
            elif action == "status":
                status.callback(None)
            elif action == "config":
                config.callback(None, None, None, None)
                
    except Exception as e:
        console.print(f"[red]Interactive mode failed: {e}[/red]")
        raise click.ClickException(str(e))

def main():
    """Main entry point"""
    cli()

if __name__ == '__main__':
    main()
