import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import { CommitChart, CommitWeek } from './components/CommitChart'
import { TopContributors, Contributor } from './components/TopContributors'
import { RecentCommits, GitHubCommitItem } from './components/RecentCommits'
import { SkeletonDashboard } from './components/SkeletonDashboard'
import { ErrorAlert, AppError } from './components/ErrorAlert'

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
      reason:
        daysSinceLastPush === 0
          ? 'Updated today with active maintainers'
          : `Updated ${daysSinceLastPush}d ago with high activity`
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
  const [error, setError] = useState<AppError | null>(null)
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(null)

  // Commit Activity State
  const [commitActivity, setCommitActivity] = useState<CommitWeek[] | null>(null)
  const [commitActivityLoading, setCommitActivityLoading] = useState(false)
  const [commitActivityNotice, setCommitActivityNotice] = useState<string | null>(null)

  // Top Contributors State
  const [contributors, setContributors] = useState<Contributor[] | null>(null)
  const [contributorsLoading, setContributorsLoading] = useState(false)
  const [contributorsError, setContributorsError] = useState<string | null>(null)

  // Recent Commits Feed State
  const [recentCommits, setRecentCommits] = useState<GitHubCommitItem[] | null>(null)
  const [recentCommitsLoading, setRecentCommitsLoading] = useState(false)
  const [recentCommitsError, setRecentCommitsError] = useState<string | null>(null)

  // Feature 9: Shareable Link State
  const [copied, setCopied] = useState(false)

  const fetchCommitActivity = async (owner: string, repo: string, signal?: AbortSignal) => {
    setCommitActivityLoading(true)
    setCommitActivityNotice(null)

    try {
      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
          }
        }
      )

      if (commitRes.status === 202) {
        setCommitActivityNotice(
          'GitHub is currently compiling commit statistics for this repository. Please re-analyze in a moment.'
        )
        setCommitActivity(null)
        return
      }

      if (!commitRes.ok) {
        setCommitActivityNotice('Could not retrieve commit activity history at this time.')
        setCommitActivity(null)
        return
      }

      const commitData = await commitRes.json()
      if (Array.isArray(commitData) && commitData.length > 0) {
        setCommitActivity(commitData)
      } else {
        setCommitActivityNotice(
          'GitHub is currently calculating commit activity for this repo. Please check back shortly.'
        )
        setCommitActivity(null)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.warn('Commit activity fetch error:', err)
      setCommitActivityNotice('Unable to load commit activity due to network limits.')
    } finally {
      setCommitActivityLoading(false)
    }
  }

  const fetchContributors = async (owner: string, repo: string, signal?: AbortSignal) => {
    setContributorsLoading(true)
    setContributorsError(null)

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=5`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
          }
        }
      )

      if (!res.ok) {
        setContributorsError('Could not load contributors at this time.')
        setContributors(null)
        return
      }

      const data = await res.json()
      if (Array.isArray(data)) {
        setContributors(data)
      } else {
        setContributors([])
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.warn('Contributors fetch error:', err)
      setContributorsError('Failed to fetch contributors.')
    } finally {
      setContributorsLoading(false)
    }
  }

  const fetchRecentCommits = async (owner: string, repo: string, signal?: AbortSignal) => {
    setRecentCommitsLoading(true)
    setRecentCommitsError(null)

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
          }
        }
      )

      if (!res.ok) {
        setRecentCommitsError('Could not load recent commits at this time.')
        setRecentCommits(null)
        return
      }

      const data = await res.json()
      if (Array.isArray(data)) {
        setRecentCommits(data)
      } else {
        setRecentCommits([])
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.warn('Recent commits fetch error:', err)
      setRecentCommitsError('Failed to fetch recent commits.')
    } finally {
      setRecentCommitsLoading(false)
    }
  }

  const analyzeRepo = useCallback(async (input: string, syncUrl = true) => {
    setError(null)

    const parsed = parseGitHubRepo(input)
    if (!parsed) {
      setError({
        type: 'INVALID_FORMAT',
        title: 'Incorrect Repository URL Format',
        message:
          'Please enter a valid GitHub repository URL (e.g. https://github.com/facebook/react) or shorthand format (e.g. facebook/react).'
      })
      return
    }

    const { owner, repo } = parsed
    const fullRepoPath = `${owner}/${repo}`

    if (syncUrl) {
      const url = new URL(window.location.href)
      url.searchParams.set('repo', fullRepoPath)
      window.history.pushState({}, '', url.toString())
    }

    setLoading(true)
    setRepoData(null)
    setCommitActivity(null)
    setCommitActivityNotice(null)
    setContributors(null)
    setContributorsError(null)
    setRecentCommits(null)
    setRecentCommitsError(null)

    // Feature 10: Timeout Controller (12 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 12000)

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
        }
      })
      clearTimeout(timeoutId)

      // Rate limit hit (403 or 429)
      if (
        response.status === 403 ||
        response.status === 429 ||
        response.headers.get('x-ratelimit-remaining') === '0'
      ) {
        const resetHeader = response.headers.get('x-ratelimit-reset')
        let resetNotice = 'Please wait a short while and try again.'
        if (resetHeader) {
          const resetMinutes = Math.max(
            1,
            Math.round((parseInt(resetHeader, 10) * 1000 - Date.now()) / (1000 * 60))
          )
          resetNotice = `Limit resets in approximately ${resetMinutes} minute${resetMinutes === 1 ? '' : 's'}.`
        }

        setError({
          type: 'RATE_LIMIT',
          title: 'GitHub API Rate Limit Reached',
          message: `GitHub limits unauthenticated API requests to 60 calls per hour. ${resetNotice}`
        })
        setRepoData(null)
        setLoading(false)
        return
      }

      // 404 Not Found
      if (response.status === 404) {
        setError({
          type: 'NOT_FOUND',
          title: 'Repository Not Found',
          message: `The repository "${owner}/${repo}" does not exist on GitHub or might be set to private. Please check the spelling.`
        })
        setRepoData(null)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || `GitHub returned HTTP error status ${response.status}.`
        setError({
          type: 'UNKNOWN',
          title: 'Unable to Load Repository',
          message
        })
        setRepoData(null)
        setLoading(false)
        return
      }

      const data: GitHubRepoData = await response.json()
      console.log('GitHub Repo Data:', data)
      setRepoData(data)
      setLoading(false)

      fetchCommitActivity(owner, repo)
      fetchContributors(owner, repo)
      fetchRecentCommits(owner, repo)
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        setError({
          type: 'TIMEOUT',
          title: 'Request Timed Out',
          message:
            'GitHub took too long to respond (>12 seconds). This is usually due to a slow network connection or GitHub API latency.'
        })
      } else {
        console.error('Fetch error:', err)
        setError({
          type: 'NETWORK_ERROR',
          title: 'Connection Error',
          message:
            'Unable to communicate with the GitHub API. Please check your internet connection and try again.'
        })
      }
      setRepoData(null)
      setLoading(false)
    }
  }, [])

  // Feature 9: Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const repoParam = params.get('repo')
    if (repoParam) {
      setRepoUrl(repoParam)
      analyzeRepo(repoParam, false)
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search)
      const currentRepo = updatedParams.get('repo')
      if (currentRepo) {
        setRepoUrl(currentRepo)
        analyzeRepo(currentRepo, false)
      } else {
        setRepoData(null)
        setRepoUrl('')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [analyzeRepo])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    analyzeRepo(repoUrl, true)
  }

  const handleRetry = () => {
    if (repoUrl) {
      analyzeRepo(repoUrl, false)
    }
  }

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const healthScore = repoData ? calculateHealthScore(repoData) : null

  return (
    <div className="container">
      <header className={`header ${repoData || loading ? 'header-compact' : ''}`}>
        <div className="logo-badge">
          <span className="radar-ping"></span>
          GitRadar
        </div>
        <p className="tagline">Instant visual breakdown and health check for any GitHub repository</p>
      </header>

      <form className="search-form" onSubmit={handleFormSubmit}>
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

        {/* Quick Example Buttons */}
        <div className="quick-examples">
          <span className="examples-label">Examples:</span>
          {['facebook/react', 'microsoft/vscode', 'torvalds/linux'].map((example) => (
            <button
              key={example}
              type="button"
              className="example-btn"
              onClick={() => {
                setRepoUrl(example)
              }}
              title={`Load ${example}`}
            >
              <code>{example}</code>
            </button>
          ))}
        </div>
      </form>

      {/* Hero Feature Highlights (Shown on Home screen) */}
      {!repoData && !loading && !error && (
        <section className="hero-features" aria-label="GitRadar features">
          <div className="feature-highlight-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <svg
                className="feature-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="feature-text">
              <h3 className="feature-title">Health Score</h3>
              <p className="feature-desc">0–100 algorithmic codebase vitality rating</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <svg
                className="feature-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="12" y1="20" x2="12" y2="10" />
              </svg>
            </div>
            <div className="feature-text">
              <h3 className="feature-title">Commit Activity</h3>
              <p className="feature-desc">52-week visual commit velocity chart</p>
            </div>
          </div>

          <div className="feature-highlight-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <svg
                className="feature-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="feature-text">
              <h3 className="feature-title">Top Contributors</h3>
              <p className="feature-desc">Core author rankings & contribution volume</p>
            </div>
          </div>
        </section>
      )}

      {/* Feature 10: Rich Error Alert with Try Again action */}
      {error && !loading && (
        <ErrorAlert error={error} onRetry={handleRetry} />
      )}

      {/* Feature 10: Comprehensive Pulsing Skeleton Loading State */}
      {loading && <SkeletonDashboard />}

      {/* Results View */}
      {!loading && repoData && healthScore && (
        <main className="results-container">
          <div className="repo-header">
            <div className="repo-header-top">
              <h2 className="repo-title">
                <a href={repoData.html_url} target="_blank" rel="noopener noreferrer">
                  {repoData.full_name}
                </a>
              </h2>

              {/* Feature 9: Copy Link Button */}
              <button
                type="button"
                className={`copy-link-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
                title="Copy shareable link to this analysis"
              >
                {copied ? (
                  <>
                    <span className="copy-icon">✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span className="copy-icon">🔗</span>
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

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

          {/* Feature 6: Commit Activity Chart */}
          <CommitChart
            data={commitActivity}
            isLoading={commitActivityLoading}
            notice={commitActivityNotice}
          />

          {/* Feature 7: Top Contributors */}
          <TopContributors
            contributors={contributors}
            isLoading={contributorsLoading}
            error={contributorsError}
          />

          {/* Feature 8: Recent Commits Feed */}
          <RecentCommits
            commits={recentCommits}
            isLoading={recentCommitsLoading}
            error={recentCommitsError}
          />
        </main>
      )}
    </div>
  )
}

export default App
