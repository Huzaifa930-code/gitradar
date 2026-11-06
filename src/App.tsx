import React, { useState } from 'react'
import './App.css'

function App() {
  const [repoUrl, setRepoUrl] = useState('')

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Searching...')
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
          />
          <button type="submit" className="analyze-btn">
            Analyze
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
