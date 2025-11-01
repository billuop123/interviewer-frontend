import axios from "axios"
import { useState } from "react"
import { BACKEND_URL, getToken } from "../config"
import { useNavigate } from "react-router-dom"
import { Building2, ArrowLeft, CheckCircle, AlertCircle, Globe, Mail, Image, Hash } from "lucide-react"
import toast from "react-hot-toast"

interface CompanyFormData {
  name: string
  email: string
  website: string
  logo: string
  postlimit: number
}

export const CreateCompany = function () {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    website: "",
    logo: "",
    postlimit: 10
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    // Required field validations
    if (!formData.name.trim()) {
      newErrors.push("Company name is required")
    }
    
    if (!formData.email.trim()) {
      newErrors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email address")
    }
    
    // Format validations (only if fields are filled)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.push("Website must start with http:// or https://")
    }
    
    if (formData.logo && !/^https?:\/\/.+/.test(formData.logo)) {
      newErrors.push("Logo URL must start with http:// or https://")
    }
    
    if (formData.postlimit < 1) {
      newErrors.push("Post limit must be at least 1")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/company`, formData, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      if (response.status === 201) {
        toast.success("Company created successfully! 🎉")
        navigate("/my-companies")
      }
    } catch (error: any) {
      console.error("Error creating company:", error)
      if (error.response?.data?.error) {
        setErrors([error.response.data.error])
      } else {
        setErrors(["Failed to create company. Please try again."])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{backgroundColor: '#2a2a2a'}}>
                <Building2 className="w-8 h-8" style={{color: '#ea580c'}} />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Create Your Company
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Build your company's presence and start posting jobs to find the best talent for your team.
              </p>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6 mb-8" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{color: '#22c55e'}} />
              Why create a company?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{backgroundColor: '#ea580c20'}}>
                  <Building2 className="w-4 h-4" style={{color: '#ea580c'}} />
                </div>
                <div>
                  <p className="font-medium text-white">Post Job Listings</p>
                  <p className="text-sm text-gray-400">Create and manage job postings for your organization</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{backgroundColor: '#16a34a20'}}>
                  <CheckCircle className="w-4 h-4" style={{color: '#22c55e'}} />
                </div>
                <div>
                  <p className="font-medium text-white">Manage Applications</p>
                  <p className="text-sm text-gray-400">Review and track candidate applications</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{backgroundColor: '#3b82f620'}}>
                  <Hash className="w-4 h-4" style={{color: '#60a5fa'}} />
                </div>
                <div>
                  <p className="font-medium text-white">Track Performance</p>
                  <p className="text-sm text-gray-400">Monitor job performance and analytics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{backgroundColor: '#ea580c20'}}>
                  <Globe className="w-4 h-4" style={{color: '#ea580c'}} />
                </div>
                <div>
                  <p className="font-medium text-white">Build Presence</p>
                  <p className="text-sm text-gray-400">Establish your company's brand on the platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="border rounded-xl p-4 mb-8" style={{backgroundColor: '#7f1d1d33', borderColor: '#991b1b80'}}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#f87171'}} />
                <div>
                  <h4 className="font-semibold text-red-300 mb-2">Please fix the following errors:</h4>
                  <ul className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-400">• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="backdrop-blur-sm rounded-xl border shadow-lg p-8" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
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
                    onChange={handleInputChange}
                    placeholder="company@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
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
                    onChange={handleInputChange}
                    placeholder="https://www.yourcompany.com"
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
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
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                  />
                </div>
                {formData.logo && (
                  <div className="mt-4 p-4 rounded-lg" style={{backgroundColor: '#2a2a2a'}}>
                    <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                    <img 
                      src={formData.logo} 
                      alt="Logo preview"
                      className="max-w-24 max-h-24 border rounded-lg"
                      style={{borderColor: '#4b5563'}}
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
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  style={{backgroundColor: '#ea580c', boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.2)'}}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc5500')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
                >
                  {loading ? (
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
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-colors duration-200"
                  style={{backgroundColor: '#374151'}}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

