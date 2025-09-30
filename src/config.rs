use anyhow::Result;
use serde_json::{json, Value};
use std::path::PathBuf;

pub async fn configure(
    token: Option<String>,
    username: Option<String>,
    email: Option<String>,
    name: Option<String>,
) -> Result<()> {
    let config_dir = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".repoflow");
    
    std::fs::create_dir_all(&config_dir)?;
    
    let config_file = config_dir.join("config.json");
    
    // Load existing config or create new one
    let mut config: Value = if config_file.exists() {
        let content = std::fs::read_to_string(&config_file)?;
        serde_json::from_str(&content)?
    } else {
        json!({
            "github": {
                "token": "",
                "username": "",
                "email": ""
            },
            "default_author": {
                "name": "",
                "email": ""
            }
        })
    };
    
    // Update config with provided values
    if let Some(token) = token {
        config["github"]["token"] = json!(token);
    }
    
    if let Some(username) = username {
        config["github"]["username"] = json!(username);
    }
    
    if let Some(email) = email {
        config["github"]["email"] = json!(email);
        config["default_author"]["email"] = json!(email);
    }
    
    if let Some(name) = name {
        config["default_author"]["name"] = json!(name);
    }
    
    // Save config
    let config_str = serde_json::to_string_pretty(&config)?;
    std::fs::write(&config_file, config_str)?;
    
    println!("✅ Configuration saved successfully!");
    println!("   Config file: {}", config_file.display());
    
    Ok(())
}
