import axios from "axios"
import { useState, useEffect } from "react"
import { BACKEND_URL, getToken } from "../config"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Building2, ArrowLeft, Plus, Eye, Calendar, MapPin, DollarSign, Users, Briefcase, Clock } from "lucide-react"
import toast from "react-hot-toast"

interface Job {
  id: string
  title: string
  description: string
  companyid: string
  jobtypeid: string
  location: string
  isremote: boolean
  salarymin: string
  salarymax: string
  salarycurrency: string
  requirements: string
  responsibilities: string
  benefits: string
  applicationUrl: string | null
  contactemail: string
  applicationdeadline: string | null
  experiencerequired: number
  educationlevel: string
  skills: string[]
  isactive: boolean
  viewscount: number
  applicationscount: number
  isfeatured: boolean
  postedby: string
  created: string
  updated: string | null
  company: {
    id: string
    name: string
    logo: string | null
  } | null
  jobtype: {
    id: string
    name: string
  } | null
  postedBy: {
    id: string
    email: string
  } | null
  _count: {
    applications: number
  }
}

export const ViewJobs = function () {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    if (companyId) {
      fetchJobs()
    }
  }, [companyId])


  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BACKEND_URL}/job/company/${companyId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      setJobs(response.data || [])
      
      // Get company name from first job if available
      if (response.data && response.data.length > 0 && response.data[0].company) {
        setCompanyName(response.data[0].company.name)
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load jobs")
      navigate("/my-companies")
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (min: string, max: string, currency: string) => {
    const minNum = parseInt(min)
    const maxNum = parseInt(max)
    return `${currency} ${minNum.toLocaleString()} - ${maxNum.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isDeadlinePassed = (deadline: string | null) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }


  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading jobs...</p>
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

      <div className="relative z-10 min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate("/my-companies")}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Companies
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {companyName ? `${companyName} Jobs` : "Company Jobs"}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage and view all job postings for your company
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Posted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {jobs.reduce((total, job) => total + (job.applicationscount || 0), 0)} Total Applications
                  </span>
                </div>
              </div>
              
              <Link
                to={`/company/${companyId}/post-job`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </Link>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No jobs posted yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start attracting top talent by posting your first job opening.
                </p>
                <Link
                  to={`/company/${companyId}/post-job`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Post Your First Job
                </Link>
              </div>
            ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {job.company?.logo ? (
                        <img 
                          src={job.company.logo} 
                          alt={`${job.company.name} logo`}
                          className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 p-2"
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
                        className={`w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center ${job.company?.logo ? 'hidden' : ''}`}
                        style={{ display: job.company?.logo ? 'none' : 'flex' }}
                      >
                        <Building2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {job.company?.name}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.isfeatured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium">
                              Featured
                            </span>
                          )}
                          {isDeadlinePassed(job.applicationdeadline) && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">
                            {job.isremote ? 'Remote' : job.location}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">
                            {formatSalary(job.salarymin, job.salarymax, job.salarycurrency)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {job.experiencerequired} years exp.
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {job.applicationscount || 0} applications
                          </span>
                        </div>
                      </div>

                      {/* Job Description */}
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
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
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-sm">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Application Deadline */}
                      {job.applicationdeadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className={`font-medium ${
                            isDeadlinePassed(job.applicationdeadline) 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            Application Deadline: {formatDate(job.applicationdeadline)}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
                        <Link 
                          to={`/job/${job.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Job Details
                        </Link>
                        
                        <Link 
                          to={`/job/${job.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
                        >
                          <Users className="w-4 h-4" />
                          View Applications ({job.applicationscount || 0})
                        </Link>
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
