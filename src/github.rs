use anyhow::Result;
use reqwest::Client;
use serde_json::json;
use std::path::PathBuf;

pub async fn create_repository(
    name: String,
    description: Option<String>,
    private: bool,
    dir: Option<PathBuf>,
) -> Result<()> {
    let client = Client::new();
    
    // Get GitHub token from environment or config
    let token = std::env::var("GITHUB_TOKEN")
        .or_else(|_| {
            // Try to read from config file
            let config_path = dirs::home_dir()
                .unwrap_or_else(|| PathBuf::from("."))
                .join(".repoflow")
                .join("config.json");
            
            if config_path.exists() {
                let config: serde_json::Value = serde_json::from_str(
                    &std::fs::read_to_string(config_path)?
                )?;
                Ok(config["github"]["token"].as_str().unwrap_or("").to_string())
            } else {
                Err(std::env::VarError::NotPresent)
            }
        })?;

    if token.is_empty() {
        return Err(anyhow::anyhow!("GitHub token not found. Please configure it first."));
    }

    let url = "https://api.github.com/user/repos";
    let payload = json!({
        "name": name,
        "description": description.unwrap_or_default(),
        "private": private,
        "auto_init": true
    });

    let response = client
        .post(url)
        .header("Authorization", format!("token {}", token))
        .header("Accept", "application/vnd.github.v3+json")
        .header("User-Agent", "RepoFlow/1.0.0")
        .json(&payload)
        .send()
        .await?;

    if response.status().is_success() {
        let repo: serde_json::Value = response.json().await?;
        println!("✅ Repository created successfully!");
        println!("   Name: {}", repo["name"]);
        println!("   URL: {}", repo["html_url"]);
        println!("   Clone URL: {}", repo["clone_url"]);
    } else {
        let error: serde_json::Value = response.json().await?;
        return Err(anyhow::anyhow!(
            "Failed to create repository: {}",
            error["message"].as_str().unwrap_or("Unknown error")
        ));
    }

    Ok(())
}
