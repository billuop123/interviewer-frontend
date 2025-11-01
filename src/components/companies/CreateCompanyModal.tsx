import React from 'react'
import { Building2, Mail, Globe, Image, X, AlertCircle } from 'lucide-react'

interface CreateCompanyModalProps {
  isOpen: boolean
  formData: {
    name: string
    email: string
    website: string
    logo: string
    postlimit: number
  }
  formErrors: string[]
  formLoading: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  formData,
  formErrors,
  formLoading,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', border: '1px solid #374151'}}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6" style={{borderBottom: '1px solid #374151'}}>
          <h2 className="text-2xl font-bold text-white">Create New Company</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Error Messages */}
          {formErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border" style={{backgroundColor: '#7f1d1d33', borderColor: '#991b1b80'}}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300 mb-2">Please fix the following errors:</h4>
                  <ul className="space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-400">• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                placeholder="Enter your company name"
                className="w-full px-4 py-3 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300" 
                style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  placeholder="company@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300" 
                  style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                  required
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={onInputChange}
                  placeholder="https://www.yourcompany.com"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300" 
                  style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Logo URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={onInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300" 
                  style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                />
              </div>
              {formData.logo && (
                <div className="mt-4 p-4 rounded-lg" style={{backgroundColor: '#2a2a2a'}}>
                  <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                  <img 
                    src={formData.logo} 
                    alt="Logo preview"
                    className="max-w-24 max-h-24 border rounded-lg" style={{borderColor: '#374151'}}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{backgroundColor: formLoading ? '#6b7280' : '#ea580c'}}
                onMouseEnter={(e) => !formLoading && (e.currentTarget.style.backgroundColor = '#dc5500')}
                onMouseLeave={(e) => !formLoading && (e.currentTarget.style.backgroundColor = '#ea580c')}
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Create Company
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border rounded-lg font-semibold transition-colors duration-200" 
                style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563', color: '#d1d5db'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3a3a3a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a'
                }}
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}






