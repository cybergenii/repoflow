import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface CommitInfo {
  hash: string
  message: string
  author: string
  date: string
  committerDate: string
}

const Repository: React.FC = () => {
  const [commits, setCommits] = useState<CommitInfo[]>([])
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    fetchCommits()
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Repository Management</h2>
        <p className="text-gray-600">View and manage your repository commits and history</p>
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
    </div>
  )
}

export default Repository
