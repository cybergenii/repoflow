use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    
    let args: Vec<String> = std::env::args().collect();
    let port = args.get(1)
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(3000);
    let host = args.get(2)
        .cloned()
        .unwrap_or_else(|| "localhost".to_string());
    let open = args.contains(&"--open".to_string());
    
    repoflow::ui::start_server(port, host, open).await?;
    
    Ok(())
}
