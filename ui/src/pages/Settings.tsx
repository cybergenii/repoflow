import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    token: '',
    username: '',
    email: '',
    name: ''
  })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const testToken = async () => {
    if (!settings.token) return
    
    setTesting(true)
    try {
      const response = await axios.post('/api/validate-token', { token: settings.token })
      setTokenValid(response.data.valid)
    } catch (error) {
      setTokenValid(false)
    } finally {
      setTesting(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save to the backend
      localStorage.setItem('repoflow-settings', JSON.stringify(settings))
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('repoflow-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">Configure your GitHub credentials and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">GitHub Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={settings.token}
                onChange={(e) => setSettings({ ...settings, token: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <button
                onClick={testToken}
                disabled={testing || !settings.token}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test'}
              </button>
            </div>
            {tokenValid !== null && (
              <p className={`mt-1 text-sm ${tokenValid ? 'text-green-600' : 'text-red-600'}`}>
                {tokenValid ? '✅ Token is valid' : '❌ Token is invalid'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Username
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cybergenii"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Git Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Git User Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">About RepoFlow</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Version: 1.0.0</p>
          <p>License: MIT</p>
          <p>Repository: <a href="https://github.com/cybergenii/repoflow" className="text-blue-600 hover:underline">GitHub</a></p>
        </div>
      </div>
    </div>
  )
}

export default Settings
