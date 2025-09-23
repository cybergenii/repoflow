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

const Dashboard: React.FC = () => {
  const [showCreateRepo, setShowCreateRepo] = useState(false)
  const [showAdvancedPush, setShowAdvancedPush] = useState(false)
  const [showDirectorySelect, setShowDirectorySelect] = useState(false)
  const [showRepoSelect, setShowRepoSelect] = useState(false)
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
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
    force: false
  })

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
      const response = await axios.post('/api/auto-push', {
        directory: selectedDirectory || undefined,
        repo: selectedRepo?.full_name || undefined,
        options: pushOptions
      })
      if (response.data.success) {
        alert('Auto-push completed successfully!')
        checkStatus()
        setShowAdvancedPush(false)
      } else {
        alert('Failed to auto-push: ' + response.data.message)
      }
    } catch (error) {
      console.error('Failed to auto-push:', error)
      alert('Failed to auto-push')
    }
  }

  const selectDirectory = async () => {
    try {
      // This would typically open a directory picker
      // For now, we'll use a prompt
      const directory = prompt('Enter directory path:')
      if (directory) {
        setSelectedDirectory(directory)
        setShowDirectorySelect(false)
      }
    } catch (error) {
      console.error('Failed to select directory:', error)
    }
  }

  useEffect(() => {
    checkStatus()
    fetchGithubRepos()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-600">Advanced GitHub repository management with commit graph manipulation</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <h3 className="text-lg font-medium text-gray-900">Create Repository</h3>
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
              <h3 className="text-lg font-medium text-gray-900">Advanced Push</h3>
              <p className="text-sm text-gray-500">Push with commit manipulation</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowAdvancedPush(true)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Advanced Push
            </button>
          </div>
        </div>

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
              <h3 className="text-lg font-medium text-gray-900">Select Directory</h3>
              <p className="text-sm text-gray-500">Choose source directory</p>
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
              <h3 className="text-lg font-medium text-gray-900">Select Repository</h3>
              <p className="text-sm text-gray-500">Choose GitHub repository</p>
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
                {selectedDirectory || 'Current directory'}
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Push Options</h3>
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
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pushOptions.backdate}
                      onChange={(e) => setPushOptions({ ...pushOptions, backdate: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable backdating</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pushOptions.force}
                      onChange={(e) => setPushOptions({ ...pushOptions, force: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Force push</span>
                  </label>
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
                <input
                  type="text"
                  value={selectedDirectory}
                  onChange={(e) => setSelectedDirectory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter directory path or leave empty for current"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDirectorySelect(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={selectDirectory}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Select Directory
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