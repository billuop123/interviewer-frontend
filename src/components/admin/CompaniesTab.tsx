import React from 'react'
import { Link } from 'react-router-dom'

interface Company {
  id: string
  name: string
  email: string
  website: string
  logo: string
  postlimit: number
  blacklisted: boolean
}

interface CompaniesTabProps {
  companies: Company[]
  onBlacklist: (companyId: string, blacklist: boolean) => void
  onDelete: (companyId: string) => void
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({ companies, onBlacklist, onDelete }) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'website', label: 'Website' },
    { key: 'postlimit', label: 'Post Limit' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  if (companies.length === 0) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Companies Management</h2>
          <Link 
            to="/create-company" 
            className="px-4 py-2 text-white rounded-md font-medium" 
            style={{backgroundColor: '#22c55e', textDecoration: 'none'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
          >
            Create Company
          </Link>
        </div>
        <div className="border rounded-xl p-12 text-center" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
          <p className="text-gray-400">No companies found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Companies Management</h2>
        <Link 
          to="/create-company" 
          className="px-4 py-2 text-white rounded-md font-medium" 
          style={{backgroundColor: '#22c55e', textDecoration: 'none'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
        >
          Create Company
        </Link>
      </div>
      
      <div className="border rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
        <table className="w-full">
          <thead style={{backgroundColor: '#2a2a2a'}}>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr 
                key={company.id} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}
              >
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    {company.logo && (
                      <img src={company.logo} alt={company.name} className="w-6 h-6 rounded" />
                    )}
                    {company.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{company.email}</td>
                <td className="px-4 py-3">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline" style={{color: '#ea580c', textDecoration: 'none'}}>
                      {company.website}
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-300">{company.postlimit}</td>
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold" 
                    style={{
                      backgroundColor: company.blacklisted ? '#ef444433' : '#22c55e33',
                      color: company.blacklisted ? '#ef4444' : '#22c55e'
                    }}
                  >
                    {company.blacklisted ? 'Blacklisted' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onBlacklist(company.id, !company.blacklisted)}
                      className="px-3 py-1 rounded-md text-sm font-medium text-white"
                      style={{backgroundColor: company.blacklisted ? '#22c55e' : '#eab308'}}
                      onMouseEnter={(e) => {
                        if (company.blacklisted) {
                          e.currentTarget.style.backgroundColor = '#16a34a'
                        } else {
                          e.currentTarget.style.backgroundColor = '#ca8a04'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (company.blacklisted) {
                          e.currentTarget.style.backgroundColor = '#22c55e'
                        } else {
                          e.currentTarget.style.backgroundColor = '#eab308'
                        }
                      }}
                    >
                      {company.blacklisted ? 'Unblacklist' : 'Blacklist'}
                    </button>
                    <button 
                      onClick={() => onDelete(company.id)}
                      className="px-3 py-1 rounded-md text-sm font-medium text-white" 
                      style={{backgroundColor: '#ef4444'}}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
