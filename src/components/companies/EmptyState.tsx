import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateClick: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="backdrop-blur-sm rounded-xl border shadow-lg p-12 text-center" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#2a2a2a'}}>
        <Building2 className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">No companies yet</h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Create your first company to start posting jobs and managing your business.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200" 
        style={{backgroundColor: '#ea580c', color: 'white'}}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
      >
        <Plus className="w-5 h-5" />
        Create Your First Company
      </button>
    </div>
  )
}






