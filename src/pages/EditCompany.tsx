import axios from "axios"
import { useState, useEffect } from "react"
import { BACKEND_URL, getToken } from "../config"
import { useNavigate, useParams } from "react-router-dom"
import { Building2, ArrowLeft, CheckCircle, AlertCircle, Globe, Mail, Image } from "lucide-react"
import toast from "react-hot-toast"

interface CompanyFormData {
  name: string
  email: string
  website: string
  logo: string
}

export const EditCompany = function () {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    website: "",
    logo: ""
  })
  const [loading, setLoading] = useState(false)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (companyId) {
      fetchCompany()
    }
  }, [companyId])

  const fetchCompany = async () => {
    try {
      setLoadingCompany(true)
      const response = await axios.get(`${BACKEND_URL}/company/${companyId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        website: response.data.website || "",
        logo: response.data.logo || ""
      })
    } catch (error: any) {
      console.error("Error fetching company:", error)
      toast.error("Failed to load company details")
      navigate("/my-companies")
    } finally {
      setLoadingCompany(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    if (!formData.name.trim()) {
      newErrors.push("Company name is required")
    }
    
    if (!formData.email.trim()) {
      newErrors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email address")
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.push("Website must start with http:// or https://")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await axios.put(`${BACKEND_URL}/company/${companyId}`, formData, {
        headers: {
          Authorization: getToken(),
          'Content-Type': 'application/json',
        },
      })
      
      toast.success("Company updated successfully! 🎉")
      navigate("/my-companies")
    } catch (error: any) {
      console.error("Error updating company:", error)
      if (error.response?.data?.error) {
        setErrors([error.response.data.error])
      } else {
        setErrors(["Failed to update company. Please try again."])
      }
      toast.error("Failed to update company")
    } finally {
      setLoading(false)
    }
  }

  if (loadingCompany) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading company details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-300/20 to-gray-500/20 dark:from-gray-600/20 dark:to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-200/10 to-gray-400/10 dark:from-gray-700/10 dark:to-gray-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <button
              onClick={() => navigate("/my-companies")}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Companies
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Company</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Update your company information and settings
            </p>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Why update your company?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Better Visibility</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Updated info helps candidates find you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Professional Image</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintain a polished company profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Accurate Contact</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ensure candidates can reach you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Brand Consistency</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keep your branding up to date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-8">
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-medium text-red-800 dark:text-red-200">Please fix the following errors:</h4>
                </div>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    placeholder="company@example.com"
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    placeholder="https://www.yourcompany.com"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                {/* Logo Preview */}
                {formData.logo && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo Preview:</p>
                    <div className="w-20 h-20 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <img 
                        src={formData.logo} 
                        alt="Company logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating Company...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Company
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/my-companies")}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200"
                >
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
