import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface CommitInfo {
  hash: string
  message: string
  author: string
  date: string
  committerDate: string
}

interface GitHubRepo {
  name: string
  fullName: string
  htmlUrl: string
  private: boolean
  description: string
  updatedAt: string
}

const Repository: React.FC = () => {
  const [commits, setCommits] = useState<CommitInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [showEditRepo, setShowEditRepo] = useState(false)
  const [editingRepo, setEditingRepo] = useState<GitHubRepo | null>(null)
  const [editRepoForm, setEditRepoForm] = useState({
    name: '',
    description: '',
    private: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [reposPerPage] = useState(5)

  const fetchCommits = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/commits?count=20')
      if (response.data.success) {
        setCommits(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch commits:', error)
    } finally {
      setLoading(false)
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

  const deleteRepository = async (repo: GitHubRepo) => {
    if (!confirm(`Are you sure you want to delete "${repo.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await axios.delete(`/api/github/repos/${repo.fullName}`)
      if (response.data.success) {
        alert('Repository deleted successfully!')
        fetchGithubRepos()
      } else {
        alert('Failed to delete repository: ' + response.data.error)
      }
    } catch (error: any) {
      console.error('Failed to delete repository:', error)
      alert('Failed to delete repository: ' + (error.response?.data?.error || error.message))
    }
  }

  const editRepository = (repo: GitHubRepo) => {
    setEditingRepo(repo)
    setEditRepoForm({
      name: repo.name,
      description: repo.description || '',
      private: repo.private
    })
    setShowEditRepo(true)
  }

  const updateRepository = async () => {
    if (!editingRepo) return

    try {
      const response = await axios.patch(`/api/github/repos/${editingRepo.fullName}`, {
        newName: editRepoForm.name,
        description: editRepoForm.description,
        private: editRepoForm.private
      })
      
      if (response.data.success) {
        alert('Repository updated successfully!')
        setShowEditRepo(false)
        setEditingRepo(null)
        fetchGithubRepos()
      } else {
        alert('Failed to update repository: ' + response.data.error)
      }
    } catch (error: any) {
      console.error('Failed to update repository:', error)
      alert('Failed to update repository: ' + (error.response?.data?.error || error.message))
    }
  }

  // Pagination logic
  const indexOfLastRepo = currentPage * reposPerPage
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage
  const currentRepos = githubRepos.slice(indexOfFirstRepo, indexOfLastRepo)
  const totalPages = Math.ceil(githubRepos.length / reposPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  useEffect(() => {
    fetchCommits()
    fetchGithubRepos()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Repository Management</h2>
        <p className="text-gray-600">View and manage your repository commits and history</p>
      </div>

      {/* Repository List */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Your Repositories</h3>
          <button
            onClick={fetchGithubRepos}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {githubRepos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No repositories found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentRepos.map((repo) => (
              <div key={repo.fullName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                      <h4 className="font-medium text-gray-900 truncate">{repo.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded self-start ${
                        repo.private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{repo.description || 'No description'}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs text-gray-400 space-y-1 sm:space-y-0">
                      <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View on GitHub
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    <button
                      onClick={() => editRepository(repo)}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRepository(repo)}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Showing {indexOfFirstRepo + 1} to {Math.min(indexOfLastRepo, githubRepos.length)} of {githubRepos.length} repositories
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex justify-center space-x-1 overflow-x-auto">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Commits</h3>
          <button
            onClick={fetchCommits}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {commits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No commits found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <div key={commit.hash} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{commit.message}</p>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{commit.author}</span>
                      <span>{new Date(commit.date).toLocaleString()}</span>
                      <span className="font-mono text-xs">{commit.hash.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Repository Modal */}
      {showEditRepo && editingRepo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:w-96 shadow-lg rounded-md bg-white m-4 sm:m-0">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Repository</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateRepository(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repository Name</label>
                  <input
                    type="text"
                    required
                    value={editRepoForm.name}
                    onChange={(e) => setEditRepoForm({ ...editRepoForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="my-awesome-repo"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editRepoForm.description}
                    onChange={(e) => setEditRepoForm({ ...editRepoForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="A brief description of your repository"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editRepoForm.private}
                      onChange={(e) => setEditRepoForm({ ...editRepoForm, private: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Private repository</span>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditRepo(false)
                      setEditingRepo(null)
                    }}
                    className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    Update Repository
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

export default Repository
