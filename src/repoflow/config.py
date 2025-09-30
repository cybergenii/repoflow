import os
import json
from pathlib import Path
from typing import Dict, Any

class Config:
    def __init__(self):
        self.config_dir = Path.home() / ".repoflow"
        self.config_file = self.config_dir / "config.json"
    
    def load(self) -> Dict[str, Any]:
        """Load configuration from file"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
        
        # Return default config
        return {
            "github": {
                "token": os.environ.get("GITHUB_TOKEN", ""),
                "username": os.environ.get("GITHUB_USERNAME", ""),
                "email": os.environ.get("GITHUB_EMAIL", "")
            },
            "default_author": {
                "name": os.environ.get("GIT_USER_NAME", ""),
                "email": os.environ.get("GIT_USER_EMAIL", "")
            }
        }
    
    def save(self, config: Dict[str, Any]) -> bool:
        """Save configuration to file"""
        try:
            self.config_dir.mkdir(exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            return True
        except IOError:
            return False
