import React from 'react'

export interface GitHubCommitItem {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
    html_url: string
  } | null
}

interface RecentCommitsProps {
  commits: GitHubCommitItem[] | null
  isLoading: boolean
  error: string | null
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))

  if (diffInSeconds < 60) return 'just now'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 30) return `${diffInDays} days ago`

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`
}

export function truncateCommitMessage(message: string, maxLength = 80): string {
  // Take first line of multi-line commit message
  const firstLine = message.split('\n')[0].trim()
  if (firstLine.length <= maxLength) {
    return firstLine
  }
  return `${firstLine.substring(0, maxLength).trim()}...`
}

export const RecentCommits: React.FC<RecentCommitsProps> = ({
  commits,
  isLoading,
  error
}) => {
  return (
    <section className="commits-section">
      <div className="section-header">
        <h3 className="section-title">Recent Commits</h3>
        {commits && commits.length > 0 && (
          <span className="commits-badge">Latest {commits.length} changes</span>
        )}
      </div>

      {isLoading && (
        <div className="commits-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="commit-row skeleton-row">
              <div className="skeleton-circle-small"></div>
              <div className="commit-meta-skeleton">
                <div className="skeleton-line" style={{ width: '60%' }}></div>
                <div className="skeleton-line" style={{ width: '30%', marginTop: '0.4rem' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="commits-placeholder">
          <p className="placeholder-text">{error}</p>
        </div>
      )}

      {!isLoading && !error && commits && commits.length === 0 && (
        <div className="commits-placeholder">
          <p className="placeholder-text">No recent commits found for this repository.</p>
        </div>
      )}

      {!isLoading && !error && commits && commits.length > 0 && (
        <div className="commits-list">
          {commits.map((item) => {
            const authorName = item.author?.login || item.commit.author.name || 'Unknown'
            const avatarUrl =
              item.author?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=21262d&color=f0f6fc`
            const timeAgo = formatRelativeTime(item.commit.author.date)
            const displayMessage = truncateCommitMessage(item.commit.message, 80)
            const shortSha = item.sha.substring(0, 7)

            return (
              <a
                key={item.sha}
                href={item.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="commit-row"
                title={`Open commit ${shortSha} on GitHub`}
              >
                <div className="commit-author-avatar-wrap">
                  <img
                    src={avatarUrl}
                    alt={`${authorName}'s avatar`}
                    className="commit-author-avatar"
                    loading="lazy"
                  />
                </div>

                <div className="commit-details">
                  <p className="commit-message">{displayMessage}</p>
                  <div className="commit-subtext">
                    <span className="commit-author-name">{authorName}</span>
                    <span className="dot-separator">•</span>
                    <span className="commit-time">{timeAgo}</span>
                  </div>
                </div>

                <div className="commit-sha-badge">
                  <code>{shortSha}</code>
                  <span className="external-arrow">↗</span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}

