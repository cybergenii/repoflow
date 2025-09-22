use anyhow::Result;
use warp::Filter;
use std::net::SocketAddr;

pub async fn start_server(port: u16, host: String, open: bool) -> Result<()> {
    let addr: SocketAddr = format!("{}:{}", host, port).parse()?;
    
    println!("🚀 RepoFlow UI server starting...");
    println!("   URL: http://{}:{}", host, port);
    
    if open {
        let url = format!("http://{}:{}", host, port);
        if let Err(e) = open::that(&url) {
            eprintln!("Warning: Failed to open browser: {}", e);
        }
    }
    
    // Serve static files from ui/dist directory
    let static_files = warp::fs::dir("ui/dist");
    
    // API routes
    let api_routes = warp::path("api")
        .and(
            warp::path("status")
                .and(warp::get())
                .and_then(handle_status)
                .or(warp::path("commits")
                    .and(warp::get())
                    .and_then(handle_commits))
                .or(warp::path("create-repo")
                    .and(warp::post())
                    .and(warp::body::json())
                    .and_then(handle_create_repo))
                .or(warp::path("commit")
                    .and(warp::post())
                    .and(warp::body::json())
                    .and_then(handle_commit))
                .or(warp::path("push")
                    .and(warp::post())
                    .and(warp::body::json())
                    .and_then(handle_push))
                .or(warp::path("validate-token")
                    .and(warp::post())
                    .and(warp::body::json())
                    .and_then(handle_validate_token))
        );
    
    // Serve UI for all other routes
    let ui_routes = warp::any()
        .and(warp::fs::file("ui/dist/index.html"));
    
    let routes = api_routes
        .or(static_files)
        .or(ui_routes)
        .with(warp::cors().allow_any_origin().allow_headers(vec!["content-type"]).allow_methods(vec!["GET", "POST", "PUT", "DELETE"]));
    
    warp::serve(routes).run(addr).await;
    
    Ok(())
}

async fn handle_status() -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement git status check
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "data": {
            "has_changes": false,
            "staged_files": 0
        }
    })))
}

async fn handle_commits() -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement git commits list
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "data": []
    })))
}

async fn handle_create_repo(_body: serde_json::Value) -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement repository creation
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "message": "Repository creation not implemented in Rust version yet"
    })))
}

async fn handle_commit(_body: serde_json::Value) -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement commit creation
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "message": "Commit creation not implemented in Rust version yet"
    })))
}

async fn handle_push(_body: serde_json::Value) -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement push
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "message": "Push not implemented in Rust version yet"
    })))
}

async fn handle_validate_token(_body: serde_json::Value) -> Result<impl warp::Reply, warp::Rejection> {
    // TODO: Implement token validation
    Ok(warp::reply::json(&serde_json::json!({
        "success": true,
        "valid": false
    })))
}
