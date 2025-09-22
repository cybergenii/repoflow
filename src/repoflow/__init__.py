"""
RepoFlow - A comprehensive GitHub repository management tool
"""

__version__ = "1.0.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

from .cli import main
from .github_service import GitHubService
from .git_service import GitService
from .config import Config

__all__ = [
    "main",
    "GitHubService", 
    "GitService",
    "Config"
]
