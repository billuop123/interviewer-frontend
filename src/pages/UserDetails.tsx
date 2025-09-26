import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Linkedin, 
  Github, 
  Globe, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle,
  Save,
  Calendar,
  Star
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

export const UserDetails = function () {
  const navigate = useNavigate()
  const { user } = useUser()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    experience: "",
    phone: "",
    resumelink: "",
    skills: [] as string[],
    location: "",
    bio: "",
    linkedin: "",
    portfolio: "",
    github: "",
    expected_salary: "",
    availability: ""
  })

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BACKEND_URL}/userdetails/getuserdetails/${user.userId}`, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      if (response.data?.result) {
        const data = response.data.result
        setUserDetails(data)
        setFormData({
          experience: data.experience?.toString() || "",
          phone: data.phone || "",
          resumelink: data.resumelink || "",
          skills: data.skills || [],
          location: data.location || "",
          bio: data.bio || "",
          linkedin: data.linkedin || "",
          portfolio: data.portfolio || "",
          github: data.github || "",
          expected_salary: data.expected_salary?.toString() || "",
          availability: data.availability || ""
        })
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
      } else {
        console.error("Error fetching user details:", error)
        toast.error("Failed to load profile details")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file")
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      setResumeFile(file)
      toast.success("Resume file selected! It will be uploaded when you save your profile.")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.push("Please enter a valid phone number")
    }
    
    if (formData.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(formData.linkedin)) {
      newErrors.push("LinkedIn URL must be a valid LinkedIn profile link")
    }
    
    if (formData.portfolio && !/^https?:\/\/.+/.test(formData.portfolio)) {
      newErrors.push("Portfolio URL must start with http:// or https://")
    }
    
    if (formData.github && !/^https?:\/\/(www\.)?github\.com\/.+/.test(formData.github)) {
      newErrors.push("GitHub URL must be a valid GitHub profile link")
    }
    
    if (formData.experience && (parseInt(formData.experience) < 0 || parseInt(formData.experience) > 50)) {
      newErrors.push("Experience must be between 0 and 50 years")
    }
    
    if (formData.expected_salary && (parseInt(formData.expected_salary) < 0 || parseInt(formData.expected_salary) > 1000000)) {
      newErrors.push("Expected salary must be between 0 and 1,000,000")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // Always use POST endpoint with FormData (handles both create and update)
      const formDataToSend = new FormData()
      formDataToSend.append('userId', user?.userId || '')
      formDataToSend.append('experience', formData.experience)
      formDataToSend.append('phone', formData.phone || '')
      formDataToSend.append('skills', JSON.stringify(formData.skills))
      formDataToSend.append('location', formData.location || '')
      formDataToSend.append('bio', formData.bio || '')
      formDataToSend.append('linkedin', formData.linkedin || '')
      formDataToSend.append('portfolio', formData.portfolio || '')
      formDataToSend.append('github', formData.github || '')
      formDataToSend.append('expected_salary', formData.expected_salary || '')
      formDataToSend.append('availability', formData.availability || '')
      
      // Add resume file if selected
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile)
      }

      const response = await axios.post(`${BACKEND_URL}/userdetails/`, formDataToSend, {
        headers: {
          Authorization: getToken(),
          'Content-Type': 'multipart/form-data',
        },
      })
      setUserDetails(response.data)
      
      toast.success("Profile updated successfully! 🎉")
      setErrors([])
    } catch (error: any) {
      console.error("Error saving user details:", error)
      if (error.response?.data?.error) {
        setErrors([error.response.data.error])
      } else {
        setErrors(["Failed to save profile. Please try again."])
      }
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your profile...</p>
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Profile Details
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Complete your profile to make your applications more competitive and help employers find you.
              </p>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Why complete your profile?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">Help employers find you with relevant skills and experience</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">Showcase your portfolio and professional links</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">Set salary expectations for better job matches</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">Make your applications more competitive</p>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Please fix the following errors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-red-700 dark:text-red-400">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about yourself, your career goals, and what makes you unique..."
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300 resize-vertical"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State/Country"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        placeholder="5"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Expected Salary (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="expected_salary"
                        value={formData.expected_salary}
                        onChange={handleInputChange}
                        min="0"
                        max="1000000"
                        placeholder="75000"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Professional Links
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Resume Upload
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center justify-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                      >
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {resumeFile ? `${resumeFile.name} - Ready to upload` : 'Click to upload PDF resume'}
                        </span>
                      </label>
                    </div>
                    
                    {formData.resumelink && !resumeFile && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-700 dark:text-green-400 text-sm">
                          Resume already uploaded
                        </span>
                      </div>
                    )}
                    
                    {resumeFile && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-400 text-sm">
                          Resume will be uploaded when you save your profile
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload a PDF file (max 10MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        placeholder="https://github.com/yourusername"
                        className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Skills *
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, React, Python)"
                    className="flex-1 px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {formData.skills.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Add at least one skill to complete your profile</p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Availability Status
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
                >
                  <option value="">Select availability</option>
                  <option value="Available immediately">Available immediately</option>
                  <option value="Available in 2 weeks">Available in 2 weeks</option>
                  <option value="Available in 1 month">Available in 1 month</option>
                  <option value="Available in 2+ months">Available in 2+ months</option>
                  <option value="Not currently looking">Not currently looking</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}