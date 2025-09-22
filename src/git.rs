use anyhow::Result;
use std::path::PathBuf;
use std::process::Command;
use tokio::process::Command as AsyncCommand;

pub async fn push_changes(
    repo: Option<String>,
    message: Option<String>,
    date: Option<String>,
    branch: Option<String>,
    multiple: Option<u32>,
    spread: Option<u32>,
    backdate: bool,
    force: bool,
    dir: Option<PathBuf>,
) -> Result<()> {
    let working_dir = dir.unwrap_or_else(|| std::env::current_dir().unwrap());
    
    // Generate commit message if not provided
    let commit_message = message.unwrap_or_else(|| {
        format!("Update repository - {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"))
    });

    // Add all files
    let status = AsyncCommand::new("git")
        .arg("add")
        .arg("-A")
        .current_dir(&working_dir)
        .status()
        .await?;

    if !status.success() {
        return Err(anyhow::anyhow!("Failed to add files to git"));
    }

    // Create commit(s)
    if let Some(count) = multiple {
        if count > 1 {
            create_multiple_commits(&working_dir, &commit_message, count, spread, &date).await?;
        } else {
            create_single_commit(&working_dir, &commit_message, &date, force).await?;
        }
    } else {
        create_single_commit(&working_dir, &commit_message, &date, force).await?;
    }

    // Push changes
    let branch_name = branch.unwrap_or_else(|| "main".to_string());
    let push_force = backdate || (multiple.is_some() && multiple.unwrap() > 1);
    
    let mut push_cmd = AsyncCommand::new("git");
    push_cmd.arg("push").arg("origin").arg(&branch_name);
    
    if push_force {
        push_cmd.arg("--force");
    }
    
    let status = push_cmd
        .current_dir(&working_dir)
        .status()
        .await?;

    if !status.success() {
        return Err(anyhow::anyhow!("Failed to push changes"));
    }

    println!("✅ Changes pushed successfully!");
    Ok(())
}

async fn create_single_commit(
    working_dir: &PathBuf,
    message: &str,
    date: &Option<String>,
    force: bool,
) -> Result<()> {
    let mut cmd = AsyncCommand::new("git");
    cmd.arg("commit").arg("-m").arg(message);
    
    if force {
        cmd.arg("--allow-empty");
    }
    
    if let Some(date_str) = date {
        cmd.env("GIT_AUTHOR_DATE", date_str);
        cmd.env("GIT_COMMITTER_DATE", date_str);
    }
    
    let status = cmd.current_dir(working_dir).status().await?;
    
    if !status.success() {
        return Err(anyhow::anyhow!("Failed to create commit"));
    }
    
    println!("✅ Commit created: {}", message);
    Ok(())
}

async fn create_multiple_commits(
    working_dir: &PathBuf,
    base_message: &str,
    count: u32,
    spread_hours: Option<u32>,
    start_date: &Option<String>,
) -> Result<()> {
    let now = chrono::Utc::now();
    let start = if let Some(date_str) = start_date {
        chrono::DateTime::parse_from_rfc3339(date_str)?.with_timezone(&chrono::Utc)
    } else {
        now - chrono::Duration::hours(spread_hours.unwrap_or(24) as i64)
    };
    
    let time_step = if let Some(hours) = spread_hours {
        chrono::Duration::hours(hours as i64) / count as i32
    } else {
        chrono::Duration::hours(1)
    };
    
    for i in 0..count {
        let commit_date = start + time_step * i as i32;
        let message = if i == 0 {
            base_message.to_string()
        } else {
            format!("{} (part {}/{})", base_message, i + 1, count)
        };
        
        let mut cmd = AsyncCommand::new("git");
        cmd.arg("commit")
            .arg("--allow-empty")
            .arg("-m")
            .arg(&message)
            .env("GIT_AUTHOR_DATE", commit_date.to_rfc3339())
            .env("GIT_COMMITTER_DATE", commit_date.to_rfc3339());
        
        let status = cmd.current_dir(working_dir).status().await?;
        
        if !status.success() {
            return Err(anyhow::anyhow!("Failed to create commit {}", i + 1));
        }
        
        println!("✅ Commit {} created: {}", i + 1, message);
    }
    
    Ok(())
}

pub async fn show_status(dir: Option<PathBuf>) -> Result<()> {
    let working_dir = dir.unwrap_or_else(|| std::env::current_dir().unwrap());
    
    let output = AsyncCommand::new("git")
        .arg("status")
        .arg("--porcelain")
        .current_dir(&working_dir)
        .output()
        .await?;
    
    if !output.status.success() {
        return Err(anyhow::anyhow!("Failed to get git status"));
    }
    
    let status_output = String::from_utf8_lossy(&output.stdout);
    
    if status_output.trim().is_empty() {
        println!("✅ Working directory is clean");
    } else {
        println!("📝 Repository status:");
        for line in status_output.lines() {
            if !line.trim().is_empty() {
                println!("   {}", line);
            }
        }
    }
    
    Ok(())
}
