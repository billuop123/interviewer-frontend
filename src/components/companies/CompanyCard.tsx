import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Globe, Calendar, Hash, AlertCircle, Eye, Plus, Edit, Trash2 } from 'lucide-react'

interface Company {
  id: string
  name: string
  email: string | null
  website: string | null
  logo: string | null
  postlimit: number | null
  blacklisted: boolean
  created: string
}

interface CompanyCardProps {
  company: Company
  onDelete: (companyId: string) => void
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onDelete }) => {
  const navigate = useNavigate()

  return (
    <div className="backdrop-blur-sm rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={`${company.name || 'Company'} logo`}
              className="w-20 h-20 object-contain rounded-lg p-2 border" style={{backgroundColor: '#2a2a2a', borderColor: '#374151'}}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className={`w-20 h-20 rounded-lg flex items-center justify-center ${company.logo ? 'hidden' : ''}`}
            style={{ display: company.logo ? 'none' : 'flex', backgroundColor: '#2a2a2a' }}
          >
            <Building2 className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        {/* Company Info */}
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {company.name || "Unnamed Company"}
              </h3>
              <div className="space-y-1">
                {company.email && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline" 
                      style={{color: '#ea580c', textDecoration: 'none'}}
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(company.created).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4" />
                <span>Job Limit: {company.postlimit || "Not set"}</span>
              </div>
              {company.blacklisted && (
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Blacklisted</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4 border" style={{backgroundColor: '#2a2a2a', borderColor: '#374151'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#ea580c20'}}>
                  <Hash className="w-5 h-5" style={{color: '#ea580c'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Job Posting Limit</p>
                  <p className="text-2xl font-bold" style={{color: '#ea580c'}}>
                    {company.postlimit || "Not set"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg p-4 border" style={{backgroundColor: '#2a2a2a', borderColor: '#374151'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: company.blacklisted ? '#ef444420' : '#22c55e20'}}>
                  <Building2 className="w-5 h-5" style={{color: company.blacklisted ? '#ef4444' : '#22c55e'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-2xl font-bold" style={{color: company.blacklisted ? '#ef4444' : '#22c55e'}}>
                    {company.blacklisted ? "Blacklisted" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Link 
                to={`/company/${company.id}/jobs`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border" 
                style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563', color: '#d1d5db', textDecoration: 'none'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3a3a3a'
                  e.currentTarget.style.borderColor = '#6b7280'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a'
                  e.currentTarget.style.borderColor = '#4b5563'
                }}
              >
                <Eye className="w-4 h-4" />
                View Jobs
              </Link>
              
              <Link 
                to={`/company/${company.id}/post-job`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200" 
                style={{backgroundColor: '#ea580c', color: 'white', textDecoration: 'none'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              >
                <Plus className="w-4 h-4" />
                Post New Job
              </Link>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/company/${company.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border" 
                style={{backgroundColor: '#2a2a2a', borderColor: '#374151', color: '#d1d5db'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3a3a3a'
                  e.currentTarget.style.borderColor = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a'
                  e.currentTarget.style.borderColor = '#374151'
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              
              <button
                onClick={() => onDelete(company.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border" 
                style={{backgroundColor: '#7f1d1d33', borderColor: '#991b1b80', color: '#f87171'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#991b1b50'
                  e.currentTarget.style.borderColor = '#b91c1c80'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7f1d1d33'
                  e.currentTarget.style.borderColor = '#991b1b80'
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



