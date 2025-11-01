import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  color?: 'blue' | 'green' | 'cyan' | 'amber' | 'red' | 'orange'
}

const colorMap = {
  blue: { bg: '#3b82f6', text: 'white' },
  green: { bg: '#22c55e', text: 'white' },
  cyan: { bg: '#06b6d4', text: 'white' },
  amber: { bg: '#eab308', text: 'black' },
  red: { bg: '#ef4444', text: 'white' },
  orange: { bg: '#ea580c', text: 'white' }
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'blue' }) => {
  const colors = colorMap[color]

  return (
    <div className="rounded-xl p-6 shadow" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

