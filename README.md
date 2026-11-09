# 📡 GitRadar

> **Instant visual breakdown and codebase health analyzer for any public GitHub repository.**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://gitradar.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Recharts](https://img.shields.io/badge/Recharts-2-22b5bf?style=for-the-badge)](https://recharts.org)

🔗 **Live Demo:** [https://gitradar.vercel.app](https://gitradar.vercel.app)

---

## ⚡ Overview

**GitRadar** gives developers, engineering leads, and technical recruiters an instant "X-ray" into the health and activity of any open-source GitHub repository. By entering a repository URL or shorthand handle (e.g. `facebook/react`), GitRadar computes an algorithmic health score, aggregates key metrics, and visualizes 12 months of commit velocity without requiring authentication or API keys.

---

## ✨ Features

- **🎯 Repository Health Score (0–100):** Evaluates repository vitality by factoring in days since the last push, unresolved issue-to-star ratio, and community adoption. Categorized into color-coded status badges:
  - 🟢 **Healthy (80–100):** Active maintainers and frequent updates.
  - 🟡 **Needs Attention (50–79):** Moderate maintenance lag or accumulating issue backlogs.
  - 🔴 **Inactive (0–49):** Stale or abandoned codebase.
- **📊 Key Metric Scoreboard:** Real-time metrics for Stars, Forks, Open Issues, and Watchers formatted with locale-aware thousands separators.
- **📈 52-Week Commit Activity Chart:** Interactive weekly commit bar chart powered by `recharts`, featuring hover tooltips and annual commit summaries.
- **👥 Top Contributors Showcase:** Displays the top 5 contributors with circular profile avatars, commit counts, and direct links to their GitHub profiles.
- **⏱️ Recent Commits Feed:** Displays the last 10 commits with author information, human-readable relative time (e.g., *"2 hours ago"*), message truncation, and direct links to commit diffs.
- **🔗 Shareable Deep Links:** Synchronizes searches with URL query parameters (`?repo=owner/repo`) so analyses can be shared or bookmarked directly, complete with a 1-click **Copy Link** clipboard action.
- **🛡️ Production-Grade Error Handling & Skeletons:** Comprehensive UI skeleton loaders during network latency, alongside categorized error states for GitHub rate limiting (with countdown), 404s, invalid formats, and connection timeouts with a **Try Again** retry mechanism.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Data Visualization:** Recharts
- **Styling:** CSS3 (GitHub Dark Theme design tokens, CSS Grid, Flexbox, Keyframe Animations)
- **API:** GitHub REST API v3 (unauthenticated, zero cost, zero API keys required)
- **Deployment:** Vercel (SPA routing configured with `vercel.json`)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Huzaifa930-code/gitradar.git
   cd gitradar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 💡 Why I Built This

Evaluating third-party dependencies often requires manual inspection across multiple GitHub tabs—checking recent commit dates, issue backlogs, contributor activity, and release cadence. **GitRadar** consolidates these critical signals into a clean, unified dashboard with a quantifiable health score. It demonstrates end-to-end data fetching from third-party REST APIs, client-side state synchronization, defensive rate-limit handling, and clean responsive data visualization.

---

## 📝 Portfolio Description (Copy & Paste)

> **GitRadar** is a real-time GitHub repository health analyzer and metrics dashboard built with React, TypeScript, and Recharts. It calculates a dynamic 0–100 codebase health score, visualizes 52 weeks of commit activity, and highlights core contributors and recent changes using GitHub's REST API. Engineered with full URL deep linking, responsive dark styling, and resilient error states.

---

## 📄 License

MIT License © 2026 Huzaifa
