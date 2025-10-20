import axios from "axios"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { ArrowLeft, User, Mail, Calendar, Video, FileText, Star, MessageSquare, CheckCircle, AlertCircle, Play, Download } from "lucide-react"
import toast from "react-hot-toast"

interface Application {
  id: string
  coverletter: string
  notes: string | null
  relevancescore: number | null
  relevancecomment: string | null
  videolink: string | null
  created: string
  updated: string | null
  user: {
    id: string
    email: string
    name: string
  }
  job: {
    id: string
    title: string
    description: string
    company: {
      id: string
      name: string
    }
  }
}

export const ApplicationDetails = function () {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails()
    } else {
      setError("No application ID provided")
      setLoading(false)
    }
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      
      const response = await axios.get(`${BACKEND_URL}/application/${applicationId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      setApplication(response.data)
    } catch (error: any) {
      console.error("Error fetching application details:", error)
      console.error("Error response:", error.response?.data)
      setError("Failed to load application details")
      toast.error("Failed to load application details")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500"
    if (score >= 8) return "text-green-600 dark:text-green-400"
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBgColor = (score: number | null) => {
    if (!score) return "bg-gray-100 dark:bg-gray-800"
    if (score >= 8) return "bg-green-100 dark:bg-green-900/30"
    if (score >= 6) return "bg-yellow-100 dark:bg-yellow-900/30"
    return "bg-red-100 dark:bg-red-900/30"
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading application details...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Application ID: {applicationId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The application you're looking for doesn't exist."}</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-400/20 dark:from-blue-700/20 dark:to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-300/15 to-blue-200/15 dark:from-green-600/15 dark:to-blue-700/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Job Applications</span>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Application Details
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Review candidate information, interview performance, and evaluation details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Candidate Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Candidate Card */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Candidate Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {application.user.name || "Not provided"}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {application.user.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Date</label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(application.created).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Job Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Position</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {application.job.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</label>
                    <p className="text-gray-900 dark:text-white">
                      {application.job.company.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Score */}
              {application.relevancescore && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    AI Evaluation Score
                  </h3>
                  
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${getScoreBgColor(application.relevancescore)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(application.relevancescore)}`}>
                        {application.relevancescore}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Out of 10</p>
                    <p className={`text-sm font-medium mt-2 ${getScoreColor(application.relevancescore)}`}>
                      {application.relevancescore >= 8 ? "Excellent Match" : 
                       application.relevancescore >= 6 ? "Good Match" : "Needs Review"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Application Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover Letter */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Cover Letter
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {application.coverletter}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {application.notes && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Notes
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {application.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Evaluation Comments */}
              {application.relevancecomment && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    AI Evaluation Comments
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {application.relevancecomment}
                    </p>
                  </div>
                </div>
              )}

              {/* Interview Video */}
              {application.videolink && (
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Interview Video
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-white">Interview Recording</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Watch the candidate's interview performance and responses.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.open(application.videolink, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Play className="w-4 h-4" />
                          Watch Video
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = application.videolink!
                            link.download = `interview-${application.user.name || application.user.email}-${application.id}.mp4`
                            link.click()
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.open(`mailto:${application.user.email}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Candidate
                  </button>
                  
                  <button
                    onClick={() => navigate(`/job/${application.job.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    View Job Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
