import subprocess
import os
from typing import Dict, Any, List, Optional

class GitService:
    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
    
    def init_repository(self, branch: str = "main") -> bool:
        """Initialize a git repository"""
        try:
            subprocess.run(["git", "init"], cwd=self.working_dir, check=True)
            subprocess.run(["git", "branch", "-M", branch], cwd=self.working_dir, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def add_remote(self, name: str, url: str) -> bool:
        """Add a remote repository"""
        try:
            subprocess.run(["git", "remote", "add", name, url], cwd=self.working_dir, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def add_files(self, files: List[str] = None) -> bool:
        """Add files to git staging"""
        try:
            if files is None:
                files = ["-A"]
            subprocess.run(["git", "add"] + files, cwd=self.working_dir, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def commit(self, message: str, author: Optional[Dict[str, str]] = None) -> bool:
        """Create a commit"""
        try:
            if author:
                subprocess.run(["git", "config", "user.name", author["name"]], cwd=self.working_dir, check=True)
                subprocess.run(["git", "config", "user.email", author["email"]], cwd=self.working_dir, check=True)
            
            subprocess.run(["git", "commit", "-m", message], cwd=self.working_dir, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def push(self, branch: str = "main", force: bool = False) -> bool:
        """Push changes to remote"""
        try:
            cmd = ["git", "push", "origin", branch]
            if force:
                cmd.append("--force")
            subprocess.run(cmd, cwd=self.working_dir, check=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get repository status"""
        try:
            result = subprocess.run(["git", "status", "--porcelain"], cwd=self.working_dir, 
                                  capture_output=True, text=True, check=True)
            return {
                "has_changes": len(result.stdout.strip()) > 0,
                "staged_files": len([line for line in result.stdout.split('\n') if line.startswith('A')])
            }
        except subprocess.CalledProcessError:
            return {"has_changes": False, "staged_files": 0}
