import React from 'react'

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="results-container skeleton-container" aria-busy="true" aria-label="Loading repository data">
      {/* Header Skeleton */}
      <div className="repo-header">
        <div className="skeleton-line skeleton-pulse" style={{ width: '40%', height: '32px', margin: '0 auto 1rem' }}></div>
        <div className="skeleton-line skeleton-pulse" style={{ width: '70%', height: '16px', margin: '0 auto 0.5rem' }}></div>
        <div className="skeleton-line skeleton-pulse" style={{ width: '50%', height: '16px', margin: '0 auto' }}></div>
      </div>

      {/* Health Score Skeleton */}
      <div className="health-score-card skeleton-card">
        <div className="health-score-left" style={{ width: '60%' }}>
          <div className="skeleton-line skeleton-pulse" style={{ width: '45%', height: '22px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-line skeleton-pulse" style={{ width: '75%', height: '14px' }}></div>
        </div>
        <div className="health-score-right">
          <div className="skeleton-line skeleton-pulse" style={{ width: '90px', height: '48px', borderRadius: '8px' }}></div>
          <div className="skeleton-line skeleton-pulse" style={{ width: '100px', height: '32px', borderRadius: '16px' }}></div>
        </div>
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton-card">
            <div className="skeleton-line skeleton-pulse" style={{ width: '60%', height: '32px', margin: '0 auto 0.5rem' }}></div>
            <div className="skeleton-line skeleton-pulse" style={{ width: '40%', height: '14px', margin: '0 auto' }}></div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="chart-section skeleton-card">
        <div className="chart-header">
          <div className="skeleton-line skeleton-pulse" style={{ width: '240px', height: '20px' }}></div>
          <div className="skeleton-line skeleton-pulse" style={{ width: '120px', height: '20px', borderRadius: '12px' }}></div>
        </div>
        <div className="skeleton-pulse chart-skeleton"></div>
      </div>

      {/* Contributors Skeleton */}
      <div className="contributors-section skeleton-card">
        <div className="section-header">
          <div className="skeleton-line skeleton-pulse" style={{ width: '180px', height: '20px' }}></div>
        </div>
        <div className="contributors-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="contributor-card skeleton-card">
              <div className="skeleton-circle skeleton-pulse"></div>
              <div className="skeleton-line skeleton-pulse" style={{ width: '70%', height: '14px', marginTop: '0.75rem' }}></div>
              <div className="skeleton-line skeleton-pulse" style={{ width: '45%', height: '12px', marginTop: '0.4rem' }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Commits Skeleton */}
      <div className="commits-section skeleton-card">
        <div className="section-header">
          <div className="skeleton-line skeleton-pulse" style={{ width: '160px', height: '20px' }}></div>
        </div>
        <div className="commits-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="commit-row skeleton-row">
              <div className="skeleton-circle-small skeleton-pulse"></div>
              <div className="commit-meta-skeleton">
                <div className="skeleton-line skeleton-pulse" style={{ width: '65%', height: '16px' }}></div>
                <div className="skeleton-line skeleton-pulse" style={{ width: '30%', height: '12px', marginTop: '0.5rem' }}></div>
              </div>
              <div className="skeleton-line skeleton-pulse" style={{ width: '60px', height: '24px', borderRadius: '6px' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

