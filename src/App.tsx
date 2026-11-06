import React, { useState } from 'react'
import './App.css'

export interface GitHubRepoData {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  subscribers_count: number
  html_url: string
  updated_at: string
  created_at: string
  pushed_at: string
  language: string | null
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
}

export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Remove trailing slashes and .git
  const cleanInput = trimmed.replace(/\/+$/, '').replace(/\.git$/, '')

  // Extract from URL (e.g. https://github.com/owner/repo or github.com/owner/repo)
  const urlMatch = cleanInput.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/i)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }

  // Check direct owner/repo format
  const parts = cleanInput.split('/')
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] }
  }

  return null
}

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = parseGitHubRepo(repoUrl)
    if (!parsed) {
      setError('Please enter a valid GitHub repository URL or format (e.g. owner/repo)')
      return
    }

    const { owner, repo } = parsed
    setLoading(true)

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)

      if (response.status === 404) {
        setError(`Repository "${owner}/${repo}" was not found on GitHub.`)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `GitHub API error (Status ${response.status})`
        setError(message)
        return
      }

      const data: GitHubRepoData = await response.json()
      console.log('GitHub Repo Data:', data)
    } catch (err: unknown) {
      console.error('Fetch error:', err)
      setError('Network error: Unable to connect to GitHub API. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo-badge">
          <span className="radar-ping"></span>
          GitRadar
        </div>
        <p className="tagline">Instant visual breakdown and health check for any GitHub repository</p>
      </header>

      <form className="search-form" onSubmit={handleAnalyze}>
        <div className="input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Paste GitHub repository URL (e.g. facebook/react or https://github.com/facebook/react)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="analyze-btn" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default App
