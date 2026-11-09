import React from 'react'

export interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

interface TopContributorsProps {
  contributors: Contributor[] | null
  isLoading: boolean
  error: string | null
}

export const TopContributors: React.FC<TopContributorsProps> = ({
  contributors,
  isLoading,
  error
}) => {
  return (
    <section className="contributors-section">
      <div className="section-header">
        <h3 className="section-title">Top Contributors</h3>
        {contributors && contributors.length > 0 && (
          <span className="contributors-badge">Top {contributors.length} core authors</span>
        )}
      </div>

      {isLoading && (
        <div className="contributors-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="contributor-card skeleton-card">
              <div className="skeleton-circle"></div>
              <div className="skeleton-line" style={{ width: '70%', marginTop: '0.75rem' }}></div>
              <div className="skeleton-line" style={{ width: '45%', marginTop: '0.4rem' }}></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="contributors-placeholder">
          <p className="placeholder-text">{error}</p>
        </div>
      )}

      {!isLoading && !error && contributors && contributors.length === 0 && (
        <div className="contributors-placeholder">
          <p className="placeholder-text">No contributor details available for this repository.</p>
        </div>
      )}

      {!isLoading && !error && contributors && contributors.length > 0 && (
        <div className="contributors-grid">
          {contributors.map((contributor, index) => (
            <div key={contributor.id} className="contributor-card">
              <div className="contributor-rank">#{index + 1}</div>
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="avatar-wrapper"
              >
                <img
                  src={contributor.avatar_url}
                  alt={`${contributor.login}'s profile avatar`}
                  className="contributor-avatar"
                  loading="lazy"
                />
              </a>
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="contributor-name"
                title={contributor.login}
              >
                @{contributor.login}
              </a>
              <span className="contributor-commits">
                {new Intl.NumberFormat('en-US').format(contributor.contributions)} commits
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
