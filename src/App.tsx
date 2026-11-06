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

export interface HealthScoreResult {
  score: number
  status: 'Healthy' | 'Needs Attention' | 'Inactive'
  colorClass: 'score-green' | 'score-amber' | 'score-red'
  daysSinceLastPush: number
  reason: string
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

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function calculateHealthScore(repo: GitHubRepoData): HealthScoreResult {
  let score = 100
  const lastActiveDate = new Date(repo.pushed_at || repo.updated_at)
  const daysSinceLastPush = Math.max(
    0,
    Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  // 1. Recency Penalty (Max -70)
  if (daysSinceLastPush > 730) {
    score -= 70 // 2+ years untouched
  } else if (daysSinceLastPush > 365) {
    score -= 50 // 1+ year untouched
  } else if (daysSinceLastPush > 180) {
    score -= 35 // 6+ months
  } else if (daysSinceLastPush > 90) {
    score -= 20 // 3+ months
  } else if (daysSinceLastPush > 30) {
    score -= 10 // 1 month
  }

  // 2. Open Issues Penalty
  if (repo.open_issues_count > 500 && daysSinceLastPush > 60) {
    score -= 15
  } else if (repo.open_issues_count > 200 && daysSinceLastPush > 30) {
    score -= 10
  } else if (repo.open_issues_count > 100 && daysSinceLastPush > 14) {
    score -= 5
  }

  // 3. Popularity / Community Bonus (up to +15)
  if (repo.stargazers_count > 10000) {
    score += 15
  } else if (repo.stargazers_count > 1000) {
    score += 10
  } else if (repo.stargazers_count > 100) {
    score += 5
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)))

  if (finalScore >= 80) {
    return {
      score: finalScore,
      status: 'Healthy',
      colorClass: 'score-green',
      daysSinceLastPush,
      reason: daysSinceLastPush === 0 ? 'Updated today with active maintainers' : `Updated ${daysSinceLastPush}d ago with high activity`
    }
  } else if (finalScore >= 50) {
    return {
      score: finalScore,
      status: 'Needs Attention',
      colorClass: 'score-amber',
      daysSinceLastPush,
      reason: `Moderate activity, last updated ${daysSinceLastPush} days ago`
    }
  } else {
    return {
      score: finalScore,
      status: 'Inactive',
      colorClass: 'score-red',
      daysSinceLastPush,
      reason: `Stale repository, last activity was ${daysSinceLastPush} days ago`
    }
  }
}

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(null)

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
        setRepoData(null)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `GitHub API error (Status ${response.status})`
        setError(message)
        setRepoData(null)
        return
      }

      const data: GitHubRepoData = await response.json()
      console.log('GitHub Repo Data:', data)
      setRepoData(data)
    } catch (err: unknown) {
      console.error('Fetch error:', err)
      setError('Network error: Unable to connect to GitHub API. Please check your internet connection.')
      setRepoData(null)
    } finally {
      setLoading(false)
    }
  }

  const healthScore = repoData ? calculateHealthScore(repoData) : null

  return (
    <div className="container">
      <header className={`header ${repoData ? 'header-compact' : ''}`}>
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

      {repoData && healthScore && (
        <main className="results-container">
          <div className="repo-header">
            <h2 className="repo-title">
              <a href={repoData.html_url} target="_blank" rel="noopener noreferrer">
                {repoData.full_name}
              </a>
            </h2>
            <p className="repo-description">
              {repoData.description || 'No description provided for this repository.'}
            </p>
          </div>

          {/* Feature 5: Repo Health Score Banner */}
          <section className="health-score-card">
            <div className="health-score-left">
              <span className="health-score-title">Repository Health Score</span>
              <p className="health-score-subtitle">{healthScore.reason}</p>
            </div>
            <div className="health-score-right">
              <div className={`health-score-number ${healthScore.colorClass}`}>
                {healthScore.score}
                <span className="score-max">/100</span>
              </div>
              <span className={`health-status-badge ${healthScore.colorClass}`}>
                {healthScore.status}
              </span>
            </div>
          </section>

          {/* Feature 4: Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{formatNumber(repoData.stargazers_count)}</span>
              <span className="stat-label">Stars</span>
            </div>

            <div className="stat-card">
              <span className="stat-value">{formatNumber(repoData.forks_count)}</span>
              <span className="stat-label">Forks</span>
            </div>

            <div className="stat-card">
              <span className="stat-value">{formatNumber(repoData.open_issues_count)}</span>
              <span className="stat-label">Open Issues</span>
            </div>

            <div className="stat-card">
              <span className="stat-value">{formatNumber(repoData.subscribers_count)}</span>
              <span className="stat-label">Watchers</span>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
