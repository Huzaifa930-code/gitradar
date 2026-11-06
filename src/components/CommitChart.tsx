import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export interface CommitWeek {
  week: number
  total: number
  days: number[]
}

export interface ChartDataPoint {
  weekIndex: number
  commits: number
  weekLabel: string
  dateRange: string
}

interface CommitChartProps {
  data: CommitWeek[] | null
  isLoading: boolean
  notice: string | null
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ChartDataPoint
  }>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="chart-tooltip">
        <p className="tooltip-date">{item.dateRange}</p>
        <p className="tooltip-commits">
          <strong>{item.commits}</strong> {item.commits === 1 ? 'commit' : 'commits'}
        </p>
      </div>
    )
  }
  return null
}

export const CommitChart: React.FC<CommitChartProps> = ({ data, isLoading, notice }) => {
  if (isLoading) {
    return (
      <section className="chart-section">
        <h3 className="section-title">Commit Activity — Last 12 Months</h3>
        <div className="chart-placeholder">
          <div className="skeleton-pulse chart-skeleton"></div>
          <p className="placeholder-text">Fetching 52-week commit activity history...</p>
        </div>
      </section>
    )
  }

  if (notice || !data || data.length === 0) {
    return (
      <section className="chart-section">
        <h3 className="section-title">Commit Activity — Last 12 Months</h3>
        <div className="chart-placeholder">
          <div className="notice-icon">⏳</div>
          <p className="placeholder-text">
            {notice || 'Commit activity is still being computed by GitHub. Please refresh in a moment.'}
          </p>
        </div>
      </section>
    )
  }

  // Format 52 weeks for display
  const chartData: ChartDataPoint[] = data.map((weekItem, idx) => {
    const startDate = new Date(weekItem.week * 1000)
    const endDate = new Date((weekItem.week + 6 * 24 * 3600) * 1000)
    
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return {
      weekIndex: idx + 1,
      commits: weekItem.total,
      weekLabel: idx % 4 === 0 ? startStr : '',
      dateRange: `${startStr} – ${endStr}`
    }
  })

  const totalCommitsInYear = data.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <section className="chart-section">
      <div className="chart-header">
        <h3 className="section-title">Commit Activity — Last 12 Months</h3>
        <span className="total-commits-badge">
          {new Intl.NumberFormat('en-US').format(totalCommitsInYear)} commits in past year
        </span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="weekLabel"
              stroke="#6e7681"
              tickLine={false}
              axisLine={{ stroke: '#30363d' }}
              tick={{ fill: '#8b949e', fontSize: 11 }}
            />
            <YAxis
              stroke="#6e7681"
              tickLine={false}
              axisLine={{ stroke: '#30363d' }}
              tick={{ fill: '#8b949e', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(110, 118, 129, 0.1)' }} />
            <Bar
              dataKey="commits"
              fill="#238636"
              radius={[3, 3, 0, 0]}
              activeBar={{ fill: '#3fb950' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
