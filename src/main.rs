use clap::{Parser, Subcommand};
use anyhow::Result;
use std::path::PathBuf;

mod github;
mod git;
mod config;
mod ui;

#[derive(Parser)]
#[command(name = "repoflow")]
#[command(about = "A comprehensive GitHub repository management tool")]
#[command(version = "1.0.0")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Configure RepoFlow settings
    Config {
        /// GitHub personal access token
        #[arg(short, long)]
        token: Option<String>,
        /// GitHub username
        #[arg(short, long)]
        username: Option<String>,
        /// Git email address
        #[arg(short, long)]
        email: Option<String>,
        /// Git user name
        #[arg(short, long)]
        name: Option<String>,
    },
    /// Create a new GitHub repository
    Create {
        /// Repository name
        name: String,
        /// Repository description
        #[arg(short, long)]
        description: Option<String>,
        /// Create private repository
        #[arg(short, long)]
        private: bool,
        /// Target directory
        #[arg(long)]
        dir: Option<PathBuf>,
    },
    /// Push changes to GitHub repository
    Push {
        /// Repository name or URL
        #[arg(short, long)]
        repo: Option<String>,
        /// Commit message
        #[arg(short, long)]
        message: Option<String>,
        /// Commit date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
        #[arg(short, long)]
        date: Option<String>,
        /// Branch name
        #[arg(short, long)]
        branch: Option<String>,
        /// Create multiple commits
        #[arg(long)]
        multiple: Option<u32>,
        /// Spread commits over hours
        #[arg(long)]
        spread: Option<u32>,
        /// Enable backdating
        #[arg(long)]
        backdate: bool,
        /// Force commit even if no changes
        #[arg(long)]
        force: bool,
        /// Target directory
        #[arg(long)]
        dir: Option<PathBuf>,
    },
    /// Show repository status
    Status {
        /// Target directory
        #[arg(long)]
        dir: Option<PathBuf>,
    },
    /// Run RepoFlow in interactive mode
    Interactive,
    /// Start the web UI server
    Ui {
        /// Port number
        #[arg(short, long, default_value = "3000")]
        port: u16,
        /// Host address
        #[arg(long, default_value = "localhost")]
        host: String,
        /// Open browser automatically
        #[arg(long)]
        open: bool,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Config { token, username, email, name } => {
            config::configure(token, username, email, name).await?;
        }
        Commands::Create { name, description, private, dir } => {
            github::create_repository(name, description, private, dir).await?;
        }
        Commands::Push { repo, message, date, branch, multiple, spread, backdate, force, dir } => {
            git::push_changes(repo, message, date, branch, multiple, spread, backdate, force, dir).await?;
        }
        Commands::Status { dir } => {
            git::show_status(dir).await?;
        }
        Commands::Interactive => {
            interactive_mode().await?;
        }
        Commands::Ui { port, host, open } => {
            ui::start_server(port, host, open).await?;
        }
    }
    
    Ok(())
}

async fn interactive_mode() -> Result<()> {
    use dialoguer::{theme::ColorfulTheme, Select, Input, Confirm};
    
    println!("🚀 Welcome to RepoFlow Interactive Mode!");
    
    loop {
        let choices = vec![
            "Create new repository",
            "Push changes", 
            "Check status",
            "Configure settings",
            "Exit"
        ];
        
        let selection = Select::with_theme(&ColorfulTheme::default())
            .with_prompt("What would you like to do?")
            .items(&choices)
            .default(0)
            .interact()?;
        
        match selection {
            0 => {
                let name: String = Input::with_theme(&ColorfulTheme::default())
                    .with_prompt("Repository name")
                    .interact_text()?;
                
                let description: String = Input::with_theme(&ColorfulTheme::default())
                    .with_prompt("Description (optional)")
                    .allow_empty(true)
                    .interact_text()?;
                
                let private = Confirm::with_theme(&ColorfulTheme::default())
                    .with_prompt("Private repository?")
                    .default(false)
                    .interact()?;
                
                github::create_repository(name, Some(description), private, None).await?;
            }
            1 => {
                let message: String = Input::with_theme(&ColorfulTheme::default())
                    .with_prompt("Commit message (optional)")
                    .allow_empty(true)
                    .interact_text()?;
                
                git::push_changes(None, Some(message), None, None, None, None, false, false, None).await?;
            }
            2 => {
                git::show_status(None).await?;
            }
            3 => {
                let token: String = Input::with_theme(&ColorfulTheme::default())
                    .with_prompt("GitHub token")
                    .interact_text()?;
                
                config::configure(Some(token), None, None, None).await?;
            }
            4 => {
                println!("👋 Goodbye!");
                break;
            }
            _ => unreachable!(),
        }
    }
    
    Ok(())
}
