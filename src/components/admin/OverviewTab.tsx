import React from 'react'
import { StatCard } from '../StatCard'

interface OverviewTabProps {
  companies: any[]
  users: any[]
  jobs: any[]
  errors: any[]
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ companies, users, jobs, errors }) => {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Companies" value={companies.length} color="blue" />
        <StatCard title="Total Users" value={users.length} color="green" />
        <StatCard title="Total Jobs" value={jobs.length} color="cyan" />
        <StatCard title="Active Jobs" value={jobs.filter(j => j.isactive).length} color="amber" />
        <StatCard title="System Errors" value={errors.length} color="red" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Companies</h3>
          <div className="space-y-3">
            {companies.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between py-3" style={{borderTop: '1px solid #374151'}}>
                <span className="font-medium text-white">{c.name}</span>
                <span className="text-xs text-gray-400">{new Date(c.created).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-xl p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {jobs.slice(0, 5).map(j => (
              <div key={j.id} className="flex items-center justify-between py-3" style={{borderTop: '1px solid #374151'}}>
                <span className="font-medium text-white">{j.title}</span>
                <span className="text-xs text-gray-400">{j.company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


