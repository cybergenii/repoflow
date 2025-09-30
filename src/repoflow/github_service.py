import requests
from typing import Dict, Any, Optional

class GitHubService:
    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {config.get('token', '')}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoFlow/1.0.0"
        }
    
    def create_repository(self, repo_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new GitHub repository"""
        url = f"{self.base_url}/user/repos"
        data = {
            "name": repo_config["name"],
            "description": repo_config.get("description", ""),
            "private": repo_config.get("private", False)
        }
        
        try:
            response = requests.post(url, json=data, headers=self.headers)
            response.raise_for_status()
            return {
                "success": True,
                "data": response.json(),
                "message": "Repository created successfully"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "message": f"Failed to create repository: {str(e)}"
            }
    
    def validate_token(self) -> bool:
        """Validate GitHub token"""
        try:
            response = requests.get(f"{self.base_url}/user", headers=self.headers)
            return response.status_code == 200
        except:
            return False
