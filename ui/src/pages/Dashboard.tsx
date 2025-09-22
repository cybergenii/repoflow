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
}

const Dashboard: React.FC = () => {
  const [showCreateRepo, setShowCreateRepo] = useState(false)
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null)
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    private: false
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

  const createRepository = async () => {
    try {
      const response = await axios.post('/api/create-repo', newRepo)
      if (response.data.success) {
        alert('Repository created successfully!')
        setShowCreateRepo(false)
        setNewRepo({ name: '', description: '', private: false })
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
        options: {
          branch: 'main',
          force: false
        }
      })
      if (response.data.success) {
        alert('Changes pushed successfully!')
        checkStatus()
      } else {
        alert('Failed to push changes: ' + response.data.message)
      }
    } catch (error) {
      console.error('Failed to push changes:', error)
      alert('Failed to push changes')
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-600">Manage your GitHub repositories with ease</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h3 className="text-lg font-medium text-gray-900">Push Changes</h3>
              <p className="text-sm text-gray-500">Commit and push your changes</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={pushChanges}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Push Changes
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Repository Status</h3>
              <p className="text-sm text-gray-500">Check current repository status</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={checkStatus}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>

      {/* Repository Status Card */}
      {repoStatus && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Repository Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{repoStatus.name}</div>
              <div className="text-sm text-gray-500">Repository Name</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{repoStatus.branch}</div>
              <div className="text-sm text-gray-500">Current Branch</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{repoStatus.unpushed_commits}</div>
              <div className="text-sm text-gray-500">Unpushed Commits</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${repoStatus.has_changes ? 'text-red-600' : 'text-gray-600'}`}>
                {repoStatus.has_changes ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-500">Has Changes</div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}

export default Dashboard
