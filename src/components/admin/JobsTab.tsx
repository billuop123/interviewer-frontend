import React from 'react'
import { Link } from 'react-router-dom'

interface Job {
  id: string
  title: string
  company: { name: string }
  viewscount: number
  applicationscount: number
  isactive: boolean
  isfeatured: boolean
}

interface JobsTabProps {
  jobs: Job[]
  onDelete: (jobId: string) => void
}

export const JobsTab: React.FC<JobsTabProps> = ({ jobs, onDelete }) => {
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold text-white">Jobs Management</h2>
      <div className="border rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
        <table className="w-full">
          <thead style={{backgroundColor: '#2a2a2a'}}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Applications</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr 
                key={job.id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}
              >
                <td className="px-4 py-3">
                  <Link to={`/job/${job.id}`} className="hover:underline" style={{color: '#ea580c'}}>
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-300">{job.company.name}</td>
                <td className="px-4 py-3 text-gray-300">{job.viewscount}</td>
                <td className="px-4 py-3 text-gray-300">{job.applicationscount}</td>
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: job.isactive ? '#22c55e33' : '#ef444433',
                      color: job.isactive ? '#22c55e' : '#ef4444'
                    }}
                  >
                    {job.isactive ? 'Active' : 'Inactive'}
                  </span>
                  {job.isfeatured && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold" style={{backgroundColor: '#ea580c', color: 'white'}}>
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onDelete(job.id)}
                    className="px-3 py-1 rounded-md text-sm font-medium text-white"
                    style={{backgroundColor: '#ef4444'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


