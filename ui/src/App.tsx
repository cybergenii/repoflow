import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Repository from './pages/Repository'
import Settings from './pages/Settings'

function App() {
  const location = useLocation()
  const [userConfig, setUserConfig] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout? This will clear all saved configuration.')) {
      return
    }

    try {
      const response = await axios.post('/api/logout')
      if (response.data.success) {
        setUserConfig(null)
        alert('Successfully logged out!')
        window.location.reload()
      }
    } catch (error) {
      alert('Failed to logout')
    }
  }

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await axios.get('/api/config')
        if (response.data.success) {
          setUserConfig(response.data.data)
        }
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }
    loadConfig()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">RepoFlow</h1>
              <span className="ml-2 text-sm text-gray-500 hidden sm:inline">v1.0.0</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/repo"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/repo' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Repository
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/settings' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Settings
              </Link>
              {userConfig && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 hidden lg:inline">Logged in as {userConfig.username}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {userConfig && (
                <span className="text-sm text-gray-600 truncate max-w-24">
                  {userConfig.username}
                </span>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/repo"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/repo' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Repository
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/settings' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
                {userConfig && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-3 py-2">
                      <p className="text-sm text-gray-600">Logged in as</p>
                      <p className="text-sm font-medium text-gray-900">{userConfig.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repo" element={<Repository />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
