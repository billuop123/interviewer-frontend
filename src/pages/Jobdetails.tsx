import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { 
  MapPin, 
  DollarSign, 
  Users, 
  Building2, 
  Briefcase, 
  Star, 
  Calendar, 
  ExternalLink, 
  Mail,
  Eye,
  CheckCircle,
  FileText,
  Send,
  X,
  ArrowLeft,
  User,
  AlertCircle
} from "lucide-react"

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
  viewscount: number
  applicationscount: number
  isfeatured: boolean
  company: {
    id: string
    name: string
    logo?: string
    website?: string
  }
  jobtype: {
    id: string
    name: string
  }
  postedby: string
}

interface Application {
  id: string
  coverletter: string
  notes: string
  created: string
  relevancescore?: number
  relevancecomment?: string
  videoLink?: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export const Jobdetails = function () {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const { user: { userId } } = useUser()
  const navigate = useNavigate()

  // state for apply form
  const [showForm, setShowForm] = useState<boolean>(false)
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  
  // state for applications (when user is job owner)
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState<boolean>(false)
  
  // Check if current user is the job owner
  const isJobOwner = job?.postedby === userId
  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const response = await axios.get(`${BACKEND_URL}/job/${jobId}`, {
          headers: {
            Authorization: getToken(),
          },
        })
        setJob(response.data)
      } catch (err) {
        console.error("Error fetching job details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobDetails()
  }, [jobId])

  // Fetch user details for non-job owners
  useEffect(() => {
    async function fetchUserDetails() {
      if (isJobOwner || !userId) return
      
      setUserDetailsLoading(true)
      try {
        const response = await axios.get(`${BACKEND_URL}/userdetails/getuserdetails/${userId}`, {
          headers: {
            Authorization: getToken(),
          },
        })
        setUserDetails(response.data.result)
      } catch (err: any) {
        console.error("Error fetching user details:", err)
        console.error("Error response:", err.response?.data)
        setUserDetails(null)
      } finally {
        setUserDetailsLoading(false)
      }
    }
    fetchUserDetails()
  }, [isJobOwner, userId])

  // Fetch applications when user is job owner
  useEffect(() => {
    async function fetchApplications() {
      if (!isJobOwner || !jobId) return
      
      setApplicationsLoading(true)
      try {
        const response = await axios.get(`${BACKEND_URL}/application/job/${jobId}`, {
          headers: {
            Authorization: getToken(),
          },
        })
        setApplications(response.data)
      } catch (err) {
        console.error("Error fetching applications:", err)
        toast.error("Failed to load applications")
      } finally {
        setApplicationsLoading(false)
      }
    }
    fetchApplications()
  }, [isJobOwner, jobId])

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  // Check if user has user details (simple check - if userDetails exists, they have details)
  const hasUserDetails = () => {
    const hasDetails = userDetails !== null
    return hasDetails
  }

  const handleApplyClick = () => {
    if (!hasUserDetails()) {
      toast.error("Please complete your profile details before applying. Go to User Details page to update your information.")
      return
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!(coverLetter || "").trim()) {
      toast.error("Please write a cover letter")
      return
    }
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/application/`,
        {
          coverLetter,
          notes,
          jobId
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      )
      
      if (response.status === 200) {
        toast.success("Application submitted successfully! 🎉")
      setCoverLetter("")
      setNotes("")
      setShowForm(false)
        
        // Navigate to interview if available
        if (response.data.id) {
          setTimeout(() => {
            navigate(`/interview/${jobId}/${response.data.id}`)
          }, 1500)
        }
      }
    } catch (err: any) {
      console.error("Error submitting application:", err)
      const errorMessage = err.response?.data?.message || "Failed to submit application. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-300/15 to-gray-200/15 dark:from-gray-600/15 dark:to-gray-700/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>

        {/* Job Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 lg:p-8 relative">
            {job.isfeatured && (
              <div className="absolute top-6 right-6 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3" />
                FEATURED
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {job.company?.logo ? (
            <img 
              src={job.company.logo} 
              alt={`${job.company.name} logo`}
                    className="w-24 h-24 object-contain rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
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
                  className={`w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center ${job.company?.logo ? 'hidden' : ''}`}
                  style={{ display: job.company?.logo ? 'none' : 'flex' }}
                >
                  <Building2 className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              {/* Job Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400">
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">{job.company?.name}</span>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.jobtype?.name} {job.isremote && "(Remote)"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salarymin} - {job.salarymax} {job.salarycurrency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(job.applicationdeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Description
                </h3>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
      </div>
          </div>

              {/* Requirements */}
          {job.requirements && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Requirements
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{job.requirements}</p>
                  </div>
            </div>
          )}

              {/* Responsibilities */}
          {job.responsibilities && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Responsibilities
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{job.responsibilities}</p>
                  </div>
            </div>
          )}

              {/* Required Skills */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-3">
              {job.skills.length > 0 ? (
                job.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
                      >
                    {skill}
                  </span>
                ))
              ) : (
                    <p className="text-gray-500 dark:text-gray-400">No specific skills listed</p>
              )}
            </div>
          </div>
        </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{job.company?.name}</span>
                  </div>
            {job.company?.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                      <a 
                        href={job.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                  Visit Website
                </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`mailto:${job.contactemail}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                {job.contactemail}
              </a>
                  </div>
                </div>
              </div>

              {/* Job Statistics */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Job Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Views:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{job.viewscount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Applications:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{job.applicationscount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{job.experiencerequired}</span>
                  </div>
                </div>
          </div>

              {/* Application Form or Applications List */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                {isJobOwner ? (
                  // Show applications for job owners
                  <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Applications ({(applications || []).length})
                    </h3>
                    
                    {applicationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
                      </div>
                    ) : (applications || []).length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          Applications will appear here when candidates apply for this job.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {(applications || []).map((application) => (
                          <div 
                            key={application.id} 
                            onClick={() => navigate(`/application/${application.id}`)}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer hover:shadow-md"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {application.user.name || application.user.email}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {application.user.email}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Applied: {new Date(application.created).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {application.relevancescore && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    application.relevancescore >= 8 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                      : application.relevancescore >= 6
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    Score: {application.relevancescore}/10
                                  </span>
                                )}
                                {application.videoLink && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold">
                                    Video
                                  </span>
              )}
            </div>
          </div>

                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Letter:</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {application.coverletter}
                              </p>
                            </div>
                            
                            {application.notes && (
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.notes}
                                </p>
                              </div>
                            )}
                            
                            {application.relevancecomment && (
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-3">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Evaluation:</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.relevancecomment}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`mailto:${application.user.email}`, '_blank')
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                                Contact
                              </button>
                              {application.videoLink && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(application.videoLink, '_blank')
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Video
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Show application form for non-owners
                  <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Apply for this Job
                    </h3>
            
            {!showForm ? (
                      userDetailsLoading ? (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Checking Profile...
                        </button>
                      ) : !hasUserDetails() ? (
                        <div className="space-y-3">
                          <button 
                            disabled
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
                          >
                            <AlertCircle className="w-5 h-5" />
                            Complete Profile Required
                          </button>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Please complete your profile details before applying
                          </p>
                          <button 
                            onClick={() => navigate('/user-details')}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300"
                          >
                            <User className="w-5 h-5" />
                            Go to Profile
                          </button>
                        </div>
                      ) : (
              <button 
                onClick={handleApplyClick}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Send className="w-5 h-5" />
                Apply Now
              </button>
                      )
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cover Letter *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                            className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 resize-vertical"
                    placeholder="Write your cover letter here..."
                    required
                  />
                </div>
                
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                            className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 resize-vertical"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
                
                        <div className="flex gap-3">
                  <button 
                    type="submit" 
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Submit
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
