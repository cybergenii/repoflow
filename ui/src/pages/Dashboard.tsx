import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface RepoStatus {
  name: string
  url: string
  branch: string
  lastCommit?: string
  unpushed_commits: number
  has_changes: boolean
  staged_files: number
  staged: string[]
  modified: string[]
  untracked: string[]
}

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  private: boolean
  description: string
  updated_at: string
}

interface UserConfig {
  username: string
  email: string
  token: string
}

const Dashboard: React.FC = () => {
  const [showCreateRepo, setShowCreateRepo] = useState(false)
  const [showAdvancedPush, setShowAdvancedPush] = useState(false)
  
  // Debug: Log when showAdvancedPush changes
  React.useEffect(() => {
    console.log('showAdvancedPush state changed:', showAdvancedPush);
  }, [showAdvancedPush]);
  const [showDirectorySelect, setShowDirectorySelect] = useState(false)
  const [showRepoSelect, setShowRepoSelect] = useState(false)
  const [showConfigSetup, setShowConfigSetup] = useState(false)
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
  const [selectedDirectory, setSelectedDirectory] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    private: false
  })
  const [pushOptions, setPushOptions] = useState({
    message: '',
    date: '',
    multiple: 1,
    spread: 0,
    backdate: false,
    force: false,
    repoName: '',
    isPrivate: false
  })
  const [configForm, setConfigForm] = useState({
    token: '',
    username: '',
    email: ''
  })

  const checkConfig = async () => {
    try {
      const response = await axios.get('/api/config')
      if (response.data.success) {
        setUserConfig(response.data.data)
        if (!response.data.data.token) {
          setShowConfigSetup(true)
        }
      } else {
        setShowConfigSetup(true)
      }
    } catch (error) {
      console.error('Failed to get config:', error)
      setShowConfigSetup(true)
    }
  }

  const checkStatus = async () => {
    try {
      const response = await axios.get('/api/status')
      if (response.data.success) {
        setRepoStatus(response.data.data)
      }
    } catch (error) {
      console.error('Failed to get status:', error)
    }
  }

  const fetchGithubRepos = async () => {
    try {
      const response = await axios.get('/api/github/repos')
      if (response.data.success) {
        setGithubRepos(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error)
    }
  }

  const saveConfig = async () => {
    try {
      const response = await axios.post('/api/config', configForm)
      if (response.data.success) {
        setUserConfig(configForm)
        setShowConfigSetup(false)
        alert('Configuration saved successfully!')
      } else {
        alert('Failed to save configuration: ' + response.data.message)
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration')
    }
  }

  const createRepository = async () => {
    try {
      const response = await axios.post('/api/create-repo', newRepo)
      if (response.data.success) {
        alert('Repository created successfully!')
        setShowCreateRepo(false)
        setNewRepo({ name: '', description: '', private: false })
        fetchGithubRepos()
      } else {
        alert('Failed to create repository: ' + response.data.message)
      }
    } catch (error) {
      console.error('Failed to create repository:', error)
      alert('Failed to create repository')
    }
  }

  const pushChanges = async () => {
    try {
      const response = await axios.post('/api/push', {
        directory: selectedDirectory || undefined,
        options: {
          message: pushOptions.message || undefined,
          date: pushOptions.date || undefined,
          multiple: pushOptions.multiple,
          spread: pushOptions.spread,
          backdate: pushOptions.backdate,
          force: pushOptions.force
        }
      })
      if (response.data.success) {
        alert('Changes pushed successfully!')
        checkStatus()
        setShowAdvancedPush(false)
      } else {
        alert('Failed to push changes: ' + response.data.message)
      }
    } catch (error) {
      console.error('Failed to push changes:', error)
      alert('Failed to push changes')
    }
  }

  const autoPush = async () => {
    try {
      if (!selectedDirectory) {
        alert('Please select a directory first')
        return
      }

      const response = await axios.post('/api/auto-push', {
        directory: selectedDirectory,
        repoName: pushOptions.repoName || selectedRepo?.name,
        commitMessage: pushOptions.message || 'Update project',
        date: pushOptions.date || new Date().toISOString(),
        multipleCommits: pushOptions.multiple,
        spreadHours: pushOptions.spread,
        isPrivate: pushOptions.isPrivate
      })
      
      if (response.data.success) {
        alert(`Auto-push completed successfully! Created ${response.data.data.commitsCreated} commits.`)
        if (response.data.data.repoUrl) {
          alert(`Repository: ${response.data.data.repoUrl}`)
        }
        checkStatus()
        setShowAdvancedPush(false)
      } else {
        alert('Failed to auto-push: ' + response.data.error)
      }
    } catch (error: any) {
      console.error('Failed to auto-push:', error)
      alert('Failed to auto-push: ' + (error.response?.data?.error || error.message))
    }
  }

  const getGithubRepos = async () => {
    try {
      const response = await axios.get('/api/github/repos')
      if (response.data.success) {
        setGithubRepos(response.data.data)
      } else {
        alert('Failed to fetch repositories: ' + response.data.error)
      }
    } catch (error: any) {
      console.error('Failed to fetch repositories:', error)
      alert('Failed to fetch repositories: ' + (error.response?.data?.error || error.message))
    }
  }

  const selectDirectory = () => {
    // Create a file input for directory selection
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    input.onchange = (e: any) => {
      const files = e.target.files
      if (files && files.length > 0) {
        // Get the directory path from the first file
        const firstFile = files[0]
        const path = firstFile.webkitRelativePath
        const directory = path.substring(0, path.indexOf('/'))
        setSelectedDirectory(directory)
        setShowDirectorySelect(false)
      }
    }
    input.click()
  }

  useEffect(() => {
    checkConfig()
    checkStatus()
    fetchGithubRepos()
  }, [])

  // Show configuration setup if no token
  if (showConfigSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to RepoFlow</h1>
            <p className="text-gray-600 mt-2">Configure your GitHub credentials to get started</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Personal Access Token</label>
              <input
                type="password"
                value={configForm.token}
                onChange={(e) => setConfigForm({ ...configForm, token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Get your token from GitHub Settings
                </a>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Username</label>
              <input
                type="text"
                value={configForm.username}
                onChange={(e) => setConfigForm({ ...configForm, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={configForm.email}
                onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@example.com"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={saveConfig}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Configuration
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Need help? Check out our{' '}
              <a href="https://github.com/cybergenii/repoflow#readme" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                documentation
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">RepoFlow Dashboard</h2>
            <p className="text-gray-600">Advanced GitHub repository management with commit graph manipulation</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Logged in as</div>
            <div className="font-medium text-gray-900">{userConfig?.username}</div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Important: Directory Selection Required</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>All RepoFlow features require a source directory to work with. This directory should contain your project files that you want to manage with Git and push to GitHub.</p>
              <p className="mt-1"><strong>Select a directory first</strong> to enable all features below.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">1. Select Directory</h3>
              <p className="text-sm text-gray-500">Choose your project source directory</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowDirectorySelect(true)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              {selectedDirectory ? 'Change Directory' : 'Select Directory'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">2. Select Repository</h3>
              <p className="text-sm text-gray-500">Choose or create GitHub repository</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowRepoSelect(true)}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              {selectedRepo ? selectedRepo.name : 'Select Repository'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">3. Advanced Push</h3>
              <p className="text-sm text-gray-500">Push with commit manipulation</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                console.log('Advanced Push clicked, selectedDirectory:', selectedDirectory);
                setShowAdvancedPush(true);
                getGithubRepos(); // Load repositories when modal opens
              }}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                selectedDirectory 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!selectedDirectory}
            >
              Advanced Push {!selectedDirectory && '(Select directory first)'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">4. Create Repository</h3>
              <p className="text-sm text-gray-500">Start a new GitHub repository</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowCreateRepo(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Repo
            </button>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Status Card */}
        {repoStatus && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Repository Status</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Repository Name</div>
                  <div className="text-lg font-semibold text-blue-600">{repoStatus.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Current Branch</div>
                  <div className="text-lg font-semibold text-green-600">{repoStatus.branch}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Unpushed Commits</div>
                  <div className="text-lg font-semibold text-orange-600">{repoStatus.unpushed_commits}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Staged Files</div>
                  <div className="text-lg font-semibold text-purple-600">{repoStatus.staged_files}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Has Changes</div>
                <div className={`text-lg font-semibold ${repoStatus.has_changes ? 'text-red-600' : 'text-gray-600'}`}>
                  {repoStatus.has_changes ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Options */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Options</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Source Directory</div>
              <div className="text-sm font-medium text-gray-900">
                {selectedDirectory || 'Not selected (required)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Target Repository</div>
              <div className="text-sm font-medium text-gray-900">
                {selectedRepo ? selectedRepo.full_name : 'Auto-detect'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Push Options</div>
              <div className="text-sm font-medium text-gray-900">
                {pushOptions.multiple > 1 ? `${pushOptions.multiple} commits` : 'Single commit'}
                {pushOptions.spread > 0 && ` over ${pushOptions.spread}h`}
                {pushOptions.backdate && ' (backdated)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documentation & Scripts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://github.com/cybergenii/repoflow#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Main Documentation</h4>
            <p className="text-sm text-gray-500 mt-1">Complete usage guide and API reference</p>
          </a>
          <a
            href="https://github.com/cybergenii/repoflow/blob/main/adv.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Advanced Script (adv.sh)</h4>
            <p className="text-sm text-gray-500 mt-1">Original bash script with all features</p>
          </a>
          <a
            href="https://github.com/cybergenii/repoflow/blob/main/TERMINAL_USAGE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Terminal Usage</h4>
            <p className="text-sm text-gray-500 mt-1">Command-line interface examples</p>
          </a>
        </div>
      </div>

      {/* Create Repository Modal */}
      {showCreateRepo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Repository</h3>
              <form onSubmit={(e) => { e.preventDefault(); createRepository(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repository Name</label>
                  <input
                    type="text"
                    required
                    value={newRepo.name}
                    onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="my-awesome-repo"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={newRepo.description}
                    onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="A brief description of your repository"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRepo.private}
                      onChange={(e) => setNewRepo({ ...newRepo, private: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Private repository</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateRepo(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Create Repository
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Push Modal */}
      {showAdvancedPush && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Advanced Push Options</h3>
                <button
                  onClick={() => setShowAdvancedPush(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {/* Repository Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Repository</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedRepo?.fullName || ''}
                      onChange={(e) => {
                        const repo = githubRepos.find(r => r.fullName === e.target.value);
                        setSelectedRepo(repo || null);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a repository...</option>
                      {githubRepos.map((repo) => (
                        <option key={repo.fullName} value={repo.fullName}>
                          {repo.name} {repo.private ? '(Private)' : '(Public)'}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={getGithubRepos}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {/* New Repository Option */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or Create New Repository</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={pushOptions.repoName}
                        onChange={(e) => setPushOptions({ ...pushOptions, repoName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Repository name"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pushOptions.isPrivate}
                          onChange={(e) => setPushOptions({ ...pushOptions, isPrivate: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Private repository</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Commit Options */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Commit Options</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commit Message</label>
                      <input
                        type="text"
                        value={pushOptions.message}
                        onChange={(e) => setPushOptions({ ...pushOptions, message: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commit Date</label>
                      <input
                        type="datetime-local"
                        value={pushOptions.date}
                        onChange={(e) => setPushOptions({ ...pushOptions, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Multiple Commits</label>
                        <input
                          type="number"
                          min="1"
                          value={pushOptions.multiple}
                          onChange={(e) => setPushOptions({ ...pushOptions, multiple: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spread Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={pushOptions.spread}
                          onChange={(e) => setPushOptions({ ...pushOptions, spread: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAdvancedPush(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={pushChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Push Changes
                </button>
                <button
                  onClick={autoPush}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Auto Push
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directory Selection Modal */}
      {showDirectorySelect && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Directory</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Choose the directory containing your project files. This directory will be used for all Git operations.
                </p>
                <button
                  onClick={selectDirectory}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Browse for Directory
                </button>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDirectorySelect(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repository Selection Modal */}
      {showRepoSelect && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Repository</h3>
              <div className="max-h-96 overflow-y-auto">
                {githubRepos.map((repo) => (
                  <div
                    key={repo.full_name}
                    onClick={() => {
                      setSelectedRepo(repo)
                      setShowRepoSelect(false)
                    }}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedRepo?.full_name === repo.full_name ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{repo.name}</h4>
                        <p className="text-sm text-gray-500">{repo.description || 'No description'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            repo.private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {repo.private ? 'Private' : 'Public'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRepoSelect(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedRepo(null)
                    setShowRepoSelect(false)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Auto-detect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard