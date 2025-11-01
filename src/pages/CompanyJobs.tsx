import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL, getToken } from "../config"
import { Link, useNavigate } from "react-router-dom"
import { Building2, ArrowLeft, Search, Eye, MapPin, DollarSign, Calendar, Users, Briefcase, Clock, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface Company {
  id: string
  name: string
  email: string
  website: string
  logo: string
  postlimit: number
  blacklisted: boolean
}

interface Job {
  id: string
  title: string
  description: string
  companyid: string
  jobtypeid: string
  isremote: boolean
  salarymin: string
  salarymax: string
  salarycurrency: string
  requirements: string | null
  responsibilities: string | null
  contactemail: string
  applicationdeadline: string
  experiencerequired: string
  skills: string[]
  location: string
  isactive: boolean
  isfeatured: boolean
  viewscount: number
  applicationscount: number
  company: {
    id: string
    name: string
    logo: string
    website: string
  }
  jobtype: {
    id: string
    name: string
  }
  postedBy: string
}

export const CompanyJobs = function () {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [companyJobs, setCompanyJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoadingCompanies(true)
        const response = await axios.get(`${BACKEND_URL}/company`, {
          headers: {
            Authorization: getToken(),
          },
        })
        setCompanies(response.data)
      } catch (error: any) {
        console.error("Error fetching companies:", error)
        toast.error("Failed to load companies")
      } finally {
        setLoadingCompanies(false)
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyJobs(selectedCompany)
    }
  }, [selectedCompany])

  const fetchCompanyJobs = async (companyId: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${BACKEND_URL}/job?companyId=${companyId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      setCompanyJobs(response.data)
    } catch (error: any) {
      console.error("Error fetching company jobs:", error)
      toast.error("Failed to load company jobs")
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = companyJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedCompanyData = companies.find(company => company.id === selectedCompany)

  const formatSalary = (min: string, max: string, currency: string) => {
    return `${currency} ${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  if (loadingCompanies) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-300/20 to-gray-500/20 dark:from-gray-600/20 dark:to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-200/10 to-gray-400/10 dark:from-gray-700/10 dark:to-gray-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#2a2a2a'}}>
                <Building2 className="w-6 h-6" style={{color: '#ea580c'}} />
              </div>
              <h1 className="text-3xl font-bold text-white">Company Jobs</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Browse jobs from different companies
            </p>
          </div>

          {/* Company Selection */}
          <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6 mb-8" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <h3 className="text-lg font-semibold text-white mb-4">Select Company</h3>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300"
                style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
              >
                <option value="">Choose a company to view their jobs...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Info */}
          {selectedCompanyData && (
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6 mb-8" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <div className="flex items-start gap-6">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {selectedCompanyData.logo ? (
                    <img 
                      src={selectedCompanyData.logo} 
                      alt={`${selectedCompanyData.name} logo`}
                      className="w-20 h-20 object-contain rounded-lg p-2"
                      style={{backgroundColor: '#2a2a2a'}}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-20 h-20 rounded-lg flex items-center justify-center ${selectedCompanyData.logo ? 'hidden' : ''}`}
                    style={{ display: selectedCompanyData.logo ? 'none' : 'flex', backgroundColor: '#2a2a2a' }}
                  >
                    <Building2 className="w-8 h-8 text-gray-500" />
                  </div>
                </div>

                {/* Company Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedCompanyData.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-medium">Email:</span>
                      <span>{selectedCompanyData.email}</span>
                    </div>
                    
                    {selectedCompanyData.website && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-medium">Website:</span>
                        <a 
                          href={selectedCompanyData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                          style={{color: '#ea580c'}}
                        >
                          {selectedCompanyData.website}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-medium">Job Limit:</span>
                      <span>{selectedCompanyData.postlimit}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCompanyData.blacklisted 
                          ? ''
                          : ''
                      }`} style={{
                        backgroundColor: selectedCompanyData.blacklisted ? '#ef444433' : '#22c55e33',
                        color: selectedCompanyData.blacklisted ? '#ef4444' : '#22c55e'
                      }}>
                        {selectedCompanyData.blacklisted ? 'Blacklisted' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          {selectedCompany && (
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6 mb-8" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <h3 className="text-lg font-semibold text-white mb-4">Search Jobs</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                />
              </div>
            </div>
          )}

          {/* Jobs List */}
          {loading ? (
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-12 text-center" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading jobs...</p>
            </div>
          ) : selectedCompany ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Available Jobs ({filteredJobs.length})
                </h2>
                {filteredJobs.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">
                      {searchTerm ? `Filtered by "${searchTerm}"` : 'All jobs'}
                    </span>
                  </div>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {searchTerm ? 'No jobs found' : 'No jobs available'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {searchTerm 
                      ? `No jobs match your search "${searchTerm}". Try different keywords.`
                      : 'This company hasn\'t posted any jobs yet.'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredJobs.map((job) => (
                    <Link to={`/job/${job.id}`} key={job.id} className="block">
                      <div className="backdrop-blur-sm rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 p-6 group" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Company Logo */}
                          <div className="flex-shrink-0">
                            {job.company?.logo ? (
                              <img 
                                src={job.company.logo} 
                                alt={`${job.company.name} logo`}
                                className="w-16 h-16 object-contain rounded-lg p-2"
                                style={{backgroundColor: '#2a2a2a'}}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) {
                                    fallback.style.display = 'flex'
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-16 h-16 rounded-lg flex items-center justify-center ${job.company?.logo ? 'hidden' : ''}`}
                              style={{ display: job.company?.logo ? 'none' : 'flex', backgroundColor: '#2a2a2a' }}
                            >
                              <Building2 className="w-6 h-6 text-gray-500" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-4">
                            {/* Header */}
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-200" style={{color: 'white'}}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ea580c')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
                                >
                                  {job.title}
                                </h3>
                                <p className="text-gray-400 font-medium">
                                  {job.company?.name}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {job.isfeatured && (
                                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#eab30833', color: '#eab308'}}>
                                    Featured
                                  </span>
                                )}
                                {isDeadlinePassed(job.applicationdeadline) && (
                                  <span className="px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#ef444433', color: '#ef4444'}}>
                                    Expired
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Job Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">
                                  {job.isremote ? 'Remote' : job.location || 'Not specified'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-400">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-sm">
                                  {formatSalary(job.salarymin, job.salarymax, job.salarycurrency)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  {job.experiencerequired} years exp.
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">
                                  {job.applicationscount || 0} applications
                                </span>
                              </div>
                            </div>

                            {/* Job Description */}
                            <p className="text-gray-400 line-clamp-2">
                              {job.description.length > 200 
                                ? `${job.description.substring(0, 200)}...` 
                                : job.description
                              }
                            </p>

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.skills.slice(0, 5).map((skill, index) => (
                                  <span 
                                    key={index}
                                    className="px-3 py-1 rounded-full text-sm"
                                    style={{backgroundColor: '#ea580c20', color: '#ea580c', borderColor: '#ea580c40'}}
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 5 && (
                                  <span className="px-3 py-1 rounded-full text-sm" style={{backgroundColor: '#2a2a2a', color: '#9ca3af'}}>
                                    +{job.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Application Deadline */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className={`font-medium ${
                                isDeadlinePassed(job.applicationdeadline) 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-gray-400'
                              }`}>
                                Application Deadline: {formatDate(job.applicationdeadline)}
                              </span>
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-2 pt-4" style={{borderTop: '1px solid', borderColor: '#374151'}}>
                              <Eye className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-400">
                                Click to view job details
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-12 text-center" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#2a2a2a'}}>
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Select a Company</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Choose a company from the dropdown above to view their available job postings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
