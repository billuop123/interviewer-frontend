import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import toast from "react-hot-toast"
import { 
  ArrowLeft, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Linkedin, 
  Github, 
  Globe, 
  Mail,
  Calendar,
  Star,
  Building,
  Shield
} from "lucide-react"

interface UserDetails {
  id: string
  userId: string
  experience: number | null
  phone: string | null
  resumelink: string | null
  skills: string[]
  location: string | null
  bio: string | null
  linkedin: string | null
  portfolio: string | null
  github: string | null
  expected_salary: number | null
  availability: string | null
  created: string
  updated: string | null
}

export const User = function () {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const detailsResponse = await axios.get(`${BACKEND_URL}/userdetails/getuserdetails/${userId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      if (detailsResponse.data?.result) {
        setUserDetails(detailsResponse.data.result)
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error)
      if (error.response?.status === 404) {
        setError("User not found")
      } else if (error.response?.status === 401) {
        setError("Unauthorized access")
      } else {
        setError("Failed to load user information")
      }
      toast.error("Failed to load user information")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatSalary = (salary: number | null) => {
    if (!salary) return "Not specified"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  const handleViewResume = (resumeUrl: string) => {
    try {
      const pdfUrl = resumeUrl.includes('http') ? resumeUrl : `${BACKEND_URL}${resumeUrl}`
      fetch(pdfUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.blob()
        })
        .then(blob => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' })
          const pdfUrl = URL.createObjectURL(pdfBlob)
          
          const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>Resume - PDF Viewer</title>
                  <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .header { background: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; }
                    .header h1 { margin: 0; font-size: 18px; color: #333; }
                    iframe { width: 100%; height: calc(100vh - 50px); border: none; }
                    .fallback { padding: 20px; text-align: center; }
                    .fallback a { color: #0066cc; text-decoration: none; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Resume Viewer</h1>
                  </div>
                  <iframe src="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH" type="application/pdf"></iframe>
                  <div class="fallback" style="display: none;">
                    <p>PDF viewer failed to load. <a href="${pdfUrl}" target="_blank">Click here to open PDF directly</a></p>
                  </div>
                </body>
              </html>
            `)
            newWindow.document.close()
            
            setTimeout(() => {
              URL.revokeObjectURL(pdfUrl)
            }, 30000) 
          }
        })
        .catch(error => {
          console.error('Error fetching PDF:', error)
          toast.error('Failed to load PDF')
          window.open(resumeUrl, '_blank', 'noopener,noreferrer')
        })
        
    } catch (error) {
      console.error('Error opening resume:', error)
      toast.error('Failed to open resume')
      window.open(resumeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleViewResumeAlternative = (resumeUrl: string) => {
    try {
      const pdfUrl = resumeUrl.includes('http') ? resumeUrl : `${BACKEND_URL}${resumeUrl}`
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
      
      const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Resume - PDF Viewer (Google Docs)</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                .header { background: #f5f5f5; padding: 10px; border-bottom: 1px solid #ddd; }
                .header h1 { margin: 0; font-size: 18px; color: #333; }
                iframe { width: 100%; height: calc(100vh - 50px); border: none; }
                .fallback { padding: 20px; text-align: center; }
                .fallback a { color: #0066cc; text-decoration: none; }
                .loading { padding: 20px; text-align: center; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Resume Viewer (Google Docs)</h1>
              </div>
              <div class="loading" id="loading">Loading PDF...</div>
              <iframe 
                src="${googleDocsUrl}" 
                onload="document.getElementById('loading').style.display='none';"
                onerror="document.getElementById('loading').style.display='none'; document.querySelector('.fallback').style.display='block';"
                style="display: none;"
                id="pdfFrame"
              ></iframe>
              <div class="fallback" style="display: none;">
                <p>Google Docs viewer failed to load.</p>
                <p><a href="${pdfUrl}" target="_blank">Click here to open PDF directly</a></p>
                <p><a href="javascript:window.close()">Close this window</a></p>
              </div>
              <script>
                setTimeout(() => {
                  const iframe = document.getElementById('pdfFrame');
                  if (iframe) {
                    iframe.style.display = 'block';
                  }
                }, 1000);
              </script>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
        
    } catch (error) {
      console.error('Error with alternative view:', error)
      toast.error('Failed to open resume')
      window.open(resumeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDownloadResume = (resumeUrl: string) => {
    try {
      const pdfUrl = resumeUrl.includes('http') ? resumeUrl : `${BACKEND_URL}${resumeUrl}`
      
      // Fetch the file and create a proper PDF download
      fetch(pdfUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.blob()
        })
        .then(blob => {
          // Create a blob with PDF MIME type
          const pdfBlob = new Blob([blob], { type: 'application/pdf' })
          
          // Create download link
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'resume.pdf'
          link.style.display = 'none'
          
          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up
          URL.revokeObjectURL(url)
          
          toast.success('Resume downloaded successfully')
        })
        .catch(error => {
          console.error('Error downloading resume:', error)
          toast.error('Failed to download resume')
          
          // Fallback: try direct download
          const link = document.createElement('a')
          link.href = pdfUrl
          link.download = 'resume.pdf'
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
        
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested user could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                User Profile
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Complete profile information
              </p>
            </div>
          </div>

          {/* Bio */}
          {userDetails.bio && (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                About
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {userDetails.bio}
              </p>
            </div>
          )}

          {/* Professional Information */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userDetails.experience !== null && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {userDetails.experience} {userDetails.experience === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                </div>
              )}

              {userDetails.location && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{userDetails.location}</span>
                  </div>
                </div>
              )}

              {userDetails.phone && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{userDetails.phone}</span>
                  </div>
                </div>
              )}

              {userDetails.expected_salary !== null && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Expected Salary
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formatSalary(userDetails.expected_salary)}
                    </span>
                  </div>
                </div>
              )}

              {userDetails.availability && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Availability
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{userDetails.availability}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Profile Created
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(userDetails.created)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {userDetails.skills && userDetails.skills.length > 0 && (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {userDetails.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Professional Links */}
          {(userDetails.linkedin || userDetails.github || userDetails.portfolio || userDetails.resumelink) && (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Professional Links
              </h3>
              
              <div className="space-y-4">
                {userDetails.resumelink && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Resume</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewResume(userDetails.resumelink)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={() => handleViewResumeAlternative(userDetails.resumelink)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-200"
                      >
                        Alternative View
                      </button>
                      <button
                        onClick={() => handleDownloadResume(userDetails.resumelink)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors duration-200"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}

                {userDetails.linkedin && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                    <a
                      href={userDetails.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {userDetails.github && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Github className="w-5 h-5 text-gray-400" />
                    <a
                      href={userDetails.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}

                {userDetails.portfolio && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a
                      href={userDetails.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Portfolio Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}