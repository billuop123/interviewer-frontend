import React, { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { BACKEND_URL, getToken, WEBSOCKET_URL, WEBSOCKET_CONFIG } from "../config"
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
  videolink?: string
  user: {
    id: string
    email: string
    name?: string
  }
}
interface ConnectedUser{
  jobId?:string;
  userId?:string;
  websocket?:WebSocket;
  name?:string;
}
export const Jobdetails = function () {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const { user: { userId, name: userName } } = useUser()
  const navigate = useNavigate()

  // state for apply form
  const [showForm, setShowForm] = useState<boolean>(false)
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  // state for applications (when user is job owner)
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting')
  const websocketRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef<number>(0)
  const maxRetriesRef = useRef<number>(WEBSOCKET_CONFIG.maxRetries)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isManualCloseRef = useRef<boolean>(false)
  // Check if current user is the job owner
  const isJobOwner = job?.postedby === userId

  const manualRetry = () => {

    retryCountRef.current = 0 // Reset retry count for manual retry
    setConnectionStatus('connecting')
    
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    // Close existing connection if any
    if (websocketRef.current) {
      isManualCloseRef.current = true
      websocketRef.current.close()
      websocketRef.current = null
      isManualCloseRef.current = false
    }
    
    // Start new connection
    connectWebSocket()
  }

  const connectWebSocket = () => {
    if (!jobId || !userId) return
    
    setConnectionStatus('connecting')
    
    try {
      websocketRef.current = new WebSocket(WEBSOCKET_URL)
      
      websocketRef.current.onopen = () => {
        retryCountRef.current = 0 // Reset retry count on successful connection
        setConnectionStatus('connected')
        
        websocketRef.current?.send(JSON.stringify({
          event:'getconnectedusers',
        }))
      }
      
      websocketRef.current.onerror = (error) => {
        setConnectionStatus('failed')
        if (retryCountRef.current === 0) {
          toast.error('Failed to connect to server')
        }
      }
      
      websocketRef.current.onclose = (event) => {
        
        // Don't retry if it was a manual close or normal closure
        if (isManualCloseRef.current || event.code === 1000) {
          return
        }
        
        // Retry connection with exponential backoff
        if (retryCountRef.current < maxRetriesRef.current) {
          retryCountRef.current++
          setConnectionStatus('connecting')
          const delay = Math.min(WEBSOCKET_CONFIG.baseDelay * Math.pow(2, retryCountRef.current - 1), WEBSOCKET_CONFIG.maxDelay)
          
          toast.error(`Connection lost. Retrying... (${retryCountRef.current}/${maxRetriesRef.current})`)
          
          retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          setConnectionStatus('failed')
          toast.error('Unable to connect to server. Please refresh the page.')
        }
      }
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if(data.event==='connectedusers'){
          setConnectedUsers(data.connectedUsers)
        }
        
        if(data.event==='joined'){
          setConnectedUsers(prevUsers => {
            // Check if user already exists to avoid duplicates
            const userExists = prevUsers.some(user => user.userId === data.userId)
            if (userExists) {
              return prevUsers
            }
            return [...prevUsers, {
              jobId: data.jobId,
              userId: data.userId,
              name: data.name,
            }]
          })
        }
        
        if(data.event==='notify'){
          if(userId === data.userId){
            toast.success('Your interview submission was done successfully! You can check your result and feedback in the application section in the dashboard page')
          }
        }
        
        if(data.event==='left'){  
          setConnectedUsers(prevUsers => 
            prevUsers.filter(user => user.userId !== data.userId)
          )
        }
      }
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      toast.error('Failed to create WebSocket connection')
    }
  }
  useEffect(() => {
    if (jobId && userId) {
      connectWebSocket()
    }
    
    // Cleanup function
    return () => {
      isManualCloseRef.current = true
      
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      
      // Close WebSocket connection
      if (websocketRef.current) {
        try {
          websocketRef.current.send(JSON.stringify({
            event:'leave',
            userId:userId,
            jobId:jobId,
          }))
        } catch (error) {
          console.error('Error sending leave message:', error)
        }
        
        websocketRef.current.close()
        websocketRef.current = null
      }
    }
  }, [jobId, userId])

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

  useEffect(() => {
    if (!jobId) return
    const bumpViews = async () => {
      try {
        await axios.put(`${BACKEND_URL}/job/${jobId}/views`, {}, {
          headers: { Authorization: getToken() }
        })
      } catch (e) {
        console.log('View bump failed:', e)
      }
    }
    bumpViews()
  }, [jobId])

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
      <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
          <p className="text-gray-400 mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors" style={{backgroundColor: '#ea580c', color: 'white'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
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
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200" style={{backgroundColor: '#1a1a1a', borderColor: '#374151', color: 'white'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a2a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>

        {/* Job Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6 lg:p-8 relative" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            {job.isfeatured && (
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{backgroundColor: '#ea580c', color: 'white'}}>
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
                    className="w-24 h-24 object-contain rounded-xl p-3" style={{backgroundColor: '#2a2a2a'}}
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
                  className={`w-24 h-24 rounded-xl flex items-center justify-center ${job.company?.logo ? 'hidden' : ''}`}
                  style={{ display: job.company?.logo ? 'none' : 'flex', backgroundColor: '#2a2a2a' }}
                >
                  <Building2 className="w-10 h-10 text-gray-500" />
                </div>
              </div>
              
              {/* Job Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-gray-400">
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">{job.company?.name}</span>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      connectionStatus === 'disconnected' ? 'bg-gray-400' :
                      'bg-red-500'
                    }`}></div>
                    <span className={`text-xs font-medium ${
                      connectionStatus === 'connected' ? 'text-green-400' :
                      connectionStatus === 'connecting' ? 'text-yellow-400' :
                      connectionStatus === 'disconnected' ? 'text-gray-400' :
                      'text-red-400'
                    }`}>
                      {connectionStatus === 'connected' ? 'Live Updates' :
                       connectionStatus === 'connecting' ? 'Connecting...' :
                       connectionStatus === 'disconnected' ? 'Disconnected' :
                       'Connection Failed'}
                    </span>
                    {(connectionStatus === 'failed' || connectionStatus === 'disconnected') && (
                      <button
                        onClick={manualRetry}
                        className="ml-2 px-2 py-1 text-xs text-white rounded transition-colors duration-200" style={{backgroundColor: '#ea580c'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.jobtype?.name} {job.isremote && "(Remote)"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salarymin} - {job.salarymax} {job.salarycurrency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
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
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Description
                </h3>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-400 leading-relaxed">{job.description}</p>
      </div>
          </div>

              {/* Requirements */}
          {job.requirements && (
                <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{color: '#22c55e'}} />
                    Requirements
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-400 leading-relaxed">{job.requirements}</p>
                  </div>
            </div>
          )}

              {/* Responsibilities */}
          {job.responsibilities && (
                <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Responsibilities
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-400 leading-relaxed">{job.responsibilities}</p>
                  </div>
            </div>
          )}

              {/* Required Skills */}
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-3">
              {job.skills.length > 0 ? (
                job.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 rounded-full text-sm font-medium border" style={{backgroundColor: '#ea580c20', color: '#ea580c', borderColor: '#ea580c40'}}
                      >
                    {skill}
                  </span>
                ))
              ) : (
                    <p className="text-gray-500">No specific skills listed</p>
              )}
            </div>
          </div>

              {/* Currently Interviewing */}
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Currently Interviewing ({connectedUsers.length})
                </h3>
                
                {connectedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No one is currently interviewing for this job</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedUsers.map((user, index) => (
                      <div key={user.userId || index} className="flex items-center gap-3 p-2 rounded-lg" style={{backgroundColor: '#2a2a2a'}}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{backgroundColor: '#ea580c'}}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name || 'Anonymous User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.userId === userId ? 'You' : 'Interviewing'}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online"></div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4" style={{borderTopColor: '#374151'}}>
                  <p className="text-xs text-gray-500">
                    💡 This shows who else is currently interviewing for this job
                  </p>
                </div>
              </div>
        </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Company Information */}
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
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
                        className="hover:underline" style={{color: '#ea580c'}}
                      >
                  Visit Website
                </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`mailto:${job.contactemail}`}
                      className="hover:underline text-sm" style={{color: '#ea580c'}}
                    >
                {job.contactemail}
              </a>
                  </div>
                </div>
              </div>

              {/* Job Statistics */}
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Job Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Views:</span>
                    <span className="font-medium text-white">{job.viewscount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Applications:</span>
                    <span className="font-medium text-white">{job.applicationscount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Experience:</span>
                    <span className="font-medium text-white">{job.experiencerequired}</span>
                  </div>
                </div>
          </div>

              {/* Application Form or Applications List */}
              <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                {isJobOwner ? (
                  // Show applications for job owners
                  <>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Applications ({(applications || []).length})
                    </h3>
                    
                    {applicationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (applications || []).length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No applications yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Applications will appear here when candidates apply for this job.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="sticky top-0 z-10" style={{backgroundColor: '#2a2a2a'}}>
                            <tr>
                              <th className="px-3 py-2 text-left text-sm font-medium text-gray-300">Candidate</th>
                              <th className="px-3 py-2 text-left text-sm font-medium text-gray-300">Score</th>
                              <th className="px-3 py-2 text-left text-sm font-medium text-gray-300">Applied</th>
                            </tr>
                          </thead>
                          <tbody style={{borderTopColor: '#374151'}}>
                            {(applications || []).map((application, index) => (
                              <tr key={application.id} className="cursor-pointer" onClick={() => navigate(`/application/${application.id}`)} 
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}>
                                <td className="px-3 py-2 text-white">{application.user.name || application.user.email}</td>
                                <td className="px-3 py-2">
                                  {(() => {
                                    const s = application.relevancescore as unknown as string | number | null | undefined
                                    const scoreNum = s === null || s === undefined || s === '' ? NaN : Number(s)
                                    return isNaN(scoreNum) ? (
                                      <span className="text-gray-500 text-sm">—</span>
                                    ) : (
                                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{
                                        backgroundColor: scoreNum >= 8 ? '#22c55e33' : scoreNum >= 6 ? '#eab30833' : '#ef444433',
                                        color: scoreNum >= 8 ? '#22c55e' : scoreNum >= 6 ? '#eab308' : '#ef4444'
                                      }}>
                                        {scoreNum}/10
                                      </span>
                                    )
                                  })()}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-400">{new Date(application.created).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  // Show application form for non-owners
                  <>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Apply for this Job
                    </h3>
            
            {!showForm ? (
                      userDetailsLoading ? (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-not-allowed" style={{backgroundColor: '#4b5563', color: 'white'}}
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Checking Profile...
                        </button>
                      ) : !hasUserDetails() ? (
                        <div className="space-y-3">
                          <button 
                            disabled
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-not-allowed" style={{backgroundColor: '#4b5563', color: 'white'}}
                          >
                            <AlertCircle className="w-5 h-5" />
                            Complete Profile Required
                          </button>
                          <p className="text-sm text-gray-400 text-center">
                            Please complete your profile details before applying
                          </p>
                          <button 
                            onClick={() => navigate('/user-details')}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300" style={{backgroundColor: '#ea580c'}}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                          >
                            <User className="w-5 h-5" />
                            Go to Profile
                          </button>
                        </div>
                      ) : (
              <button 
                onClick={handleApplyClick}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{backgroundColor: '#ea580c'}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                        >
                          <Send className="w-5 h-5" />
                Apply Now
              </button>
                      )
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Cover Letter *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                            className="w-full px-3 py-2 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300 resize-vertical" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    placeholder="Write your cover letter here..."
                    required
                  />
                </div>
                
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                            className="w-full px-3 py-2 border-2 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300 resize-vertical" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
                
                        <div className="flex gap-3">
                  <button 
                    type="submit" 
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200" style={{backgroundColor: '#22c55e'}}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Submit
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200" style={{backgroundColor: '#6b7280'}}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
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
