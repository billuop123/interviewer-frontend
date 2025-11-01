import React from 'react'
import { Building2, Plus, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  onCreateClick: () => void
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onCreateClick }) => {
  const navigate = useNavigate()

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(to bottom right, #ea580c, #f97316)'}}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                My Companies
              </h1>
              <p className="text-lg text-gray-400">
                Manage your businesses and job postings
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onCreateClick}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200" 
          style={{backgroundColor: '#ea580c', color: 'white'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
        >
          <Plus className="w-5 h-5" />
          Create New Company
        </button>
      </div>
    </div>
  )
}






