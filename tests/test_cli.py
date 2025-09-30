import pytest
from click.testing import CliRunner
from repoflow.cli import cli

def test_cli_help():
    """Test that CLI shows help message."""
    runner = CliRunner()
    result = runner.invoke(cli, ['--help'])
    assert result.exit_code == 0
    assert 'RepoFlow' in result.output

def test_cli_version():
    """Test that CLI shows version."""
    runner = CliRunner()
    result = runner.invoke(cli, ['--version'])
    assert result.exit_code == 0
    assert '1.0.0' in result.output

def test_cli_config_command():
    """Test that config command exists."""
    runner = CliRunner()
    result = runner.invoke(cli, ['config', '--help'])
    assert result.exit_code == 0
    assert 'Configure RepoFlow settings' in result.output

def test_cli_create_command():
    """Test that create command exists."""
    runner = CliRunner()
    result = runner.invoke(cli, ['create', '--help'])
    assert result.exit_code == 0
    assert 'Create a new GitHub repository' in result.output
