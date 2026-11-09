import React from 'react'

export interface AppError {
  type: 'RATE_LIMIT' | 'NOT_FOUND' | 'INVALID_FORMAT' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN'
  title: string
  message: string
}

interface ErrorAlertProps {
  error: AppError
  onRetry: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onRetry }) => {
  const getIcon = () => {
    switch (error.type) {
      case 'RATE_LIMIT':
        return '⏳'
      case 'NOT_FOUND':
        return '🔍'
      case 'INVALID_FORMAT':
        return '✏️'
      case 'TIMEOUT':
        return '⏱️'
      case 'NETWORK_ERROR':
        return '📡'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="error-card" role="alert">
      <div className="error-card-header">
        <span className="error-type-icon">{getIcon()}</span>
        <div className="error-text-wrap">
          <h4 className="error-card-title">{error.title}</h4>
          <p className="error-card-desc">{error.message}</p>
        </div>
      </div>

      <div className="error-card-actions">
        <button type="button" className="retry-btn" onClick={onRetry}>
          <span className="retry-icon">🔄</span>
          <span>Try Again</span>
        </button>
      </div>
    </div>
  )
}
