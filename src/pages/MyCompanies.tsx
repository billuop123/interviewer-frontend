import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { useUser } from "../contexts/userContext"
import { Building2, Plus, ArrowLeft, Eye, Edit, Trash2, Calendar, Globe, Mail, Hash, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Company {
  id: string
  name: string
  email: string | null
  website: string | null
  logo: string | null
  postlimit: number | null
  blacklisted: boolean
  created: string
  updated: string | null
}

export const MyCompanies = function () {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useUser()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const hasFetched = useRef(false)

  const fetchUserCompanies = async () => {
    if (hasFetched.current) return; // Prevent multiple requests
    
    try {
      setLoading(true)
      hasFetched.current = true
      
      if (!user.userId) {
        setLoading(false)
        return
      }
      
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${BACKEND_URL}/company`, {
        headers: {
          Authorization: token,
        },
      })
      
      setCompanies(response.data || [])
    } catch (error) {
      hasFetched.current = false // Reset on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for UserContext to finish loading
    if (userLoading) {
      return
    }
    
    if (user.userId && !hasFetched.current) {
      fetchUserCompanies()
    } else if (!user.userId) {
      setLoading(false) // Stop loading if no user
    }
  }, [user.userId, userLoading])

  // Removed empty useEffect that was causing infinite loop

  const refreshCompanies = () => {
    hasFetched.current = false
    setCompanies([])
    if (user.userId) {
      fetchUserCompanies()
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      try {
        await axios.delete(`${BACKEND_URL}/company/${companyId}`, {
          headers: {
            Authorization: getToken(),
          },
        })
        refreshCompanies()
        toast.success("Company deleted successfully! 🗑️")
      } catch (error) {
        console.error("Error deleting company:", error)
        toast.error("Failed to delete company. Please try again.")
      }
    }
  }



  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading your companies...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-400/20 dark:from-blue-700/20 dark:to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-300/15 to-blue-200/15 dark:from-green-600/15 dark:to-blue-700/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      My Companies
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Manage your businesses and job postings
                    </p>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/create-company"
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Create New Company
              </Link>
            </div>
          </div>


          {(companies || []).length === 0 ? (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No companies yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Create your first company to start posting jobs and managing your business.
              </p>
              <Link 
                to="/create-company" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Your First Company
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {(companies || []).map((company) => (
                <div key={company.id} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {company.logo ? (
                        <img 
                          src={company.logo} 
                          alt={`${company.name || 'Company'} logo`}
                          className="w-20 h-20 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            // Hide the broken image and show default icon
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) {
                              fallback.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center ${company.logo ? 'hidden' : ''}`}
                        style={{ display: company.logo ? 'none' : 'flex' }}
                      >
                        <Building2 className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Company Info */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {company.name || "Unnamed Company"}
                          </h3>
                          <div className="space-y-1">
                            {company.email && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span>{company.email}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Globe className="w-4 h-4" />
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {company.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {new Date(company.created).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-4 h-4" />
                            <span>Job Limit: {company.postlimit || "Not set"}</span>
                          </div>
                          {company.blacklisted && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              <span>Blacklisted</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                              <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Job Posting Limit</p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {company.postlimit || "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                              <p className={`text-2xl font-bold ${company.blacklisted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {company.blacklisted ? "Blacklisted" : "Active"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Link 
                          to={`/company/${company.id}/jobs`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Jobs
                        </Link>
                        
                        <Link 
                          to={`/company/${company.id}/post-job`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          Post New Job
                        </Link>
                        
                        <button
                          onClick={() => navigate(`/company/${company.id}/edit`)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Company
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Company
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
