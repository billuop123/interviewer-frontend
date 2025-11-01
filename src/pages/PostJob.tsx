import axios from "axios"
import { AlertCircle, ArrowLeft, Briefcase, CheckCircle, DollarSign, Mail, MapPin, Plus, Star, Users, X } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { useUser } from "../contexts/userContext"

interface JobType {
  id: string
  name: string
  description: string
}

interface JobFormData {
  title: string
  description: string
  jobtypeId: string
  location: string
  isremote: boolean
  salarymin: string
  salarymax: string
  salarycurrency: string
  requirements: string
  responsibilities: string
  benefits: string
  applicationurl: string
  contactemail: string
  applicationdeadline: string
  experiencerequired: string
  educationlevel: string
  skills: string[]
  isfeatured: boolean
}

export const PostJob = function () {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingJobTypes, setLoadingJobTypes] = useState(true)
  const [errors, setErrors] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    jobtypeId: "",
    location: "",
    isremote: false,
    salarymin: "",
    salarymax: "",
    salarycurrency: "USD",
    requirements: "",
    responsibilities: "",
    benefits: "",
    applicationurl: "",
    contactemail: "",
    applicationdeadline: "",
    experiencerequired: "0",
    educationlevel: "",
    skills: [],
    isfeatured: false
  })

  useEffect(() => {
    fetchJobTypes()
  }, [])

  const fetchJobTypes = async () => {
    try {
      setLoadingJobTypes(true)
      const response = await axios.get(`${BACKEND_URL}/jobtype/getAllJobs`,{headers:{
        Authorization:getToken()
      }})
      setJobTypes(response.data.allJobs || [])
    } catch (error) {
      console.error("Error fetching job types:", error)
      toast.error("Failed to load job types")
    } finally {
      setLoadingJobTypes(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? value : value
    }))
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
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

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    // Required field validations
    if (!formData.title.trim()) {
      newErrors.push("Job title is required")
    }
    
    if (!formData.description.trim()) {
      newErrors.push("Job description is required")
    }
    
    if (!formData.jobtypeId) {
      newErrors.push("Job type is required")
    }
    
    if (!formData.location.trim() && !formData.isremote) {
      newErrors.push("Location is required for non-remote jobs")
    }
    
    if (!formData.contactemail.trim()) {
      newErrors.push("Contact email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactemail)) {
      newErrors.push("Please enter a valid contact email address")
    }
    
    if (!formData.applicationurl.trim()) {
      newErrors.push("Application URL is required")
    } else if (!/^https?:\/\/.+/.test(formData.applicationurl)) {
      newErrors.push("Application URL must start with http:// or https://")
    }
    
    // Salary validation
    if (formData.salarymin && formData.salarymax) {
      const minSalary = parseFloat(formData.salarymin)
      const maxSalary = parseFloat(formData.salarymax)
      
      if (minSalary >= maxSalary) {
        newErrors.push("Maximum salary must be greater than minimum salary")
      }
      
      if (minSalary < 0 || maxSalary < 0) {
        newErrors.push("Salary values cannot be negative")
      }
    }
    
    // Application deadline validation
    if (formData.applicationdeadline) {
      const deadlineDate = new Date(formData.applicationdeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      
      if (deadlineDate < today) {
        newErrors.push("Application deadline must be in the future")
      }
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!companyId) {
      toast.error("Company ID is missing")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/job`, {
        ...formData,
        companyId,
        postedById: user.userId,
        salarymin: formData.salarymin ? parseFloat(formData.salarymin) : null,
        salarymax: formData.salarymax ? parseFloat(formData.salarymax) : null,
        experiencerequired: parseInt(formData.experiencerequired),
        applicationdeadline: formData.applicationdeadline ? new Date(formData.applicationdeadline).toISOString() : null
      }, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      console.log('Job posting response:', response.status, response.data)
      
      if (response.status === 201) {
        toast.success("Job posted successfully! 🎉")
        // Small delay to show the toast before navigating
        setTimeout(() => {
          navigate(-1) // Go back to previous page
        }, 1000)
      }
    } catch (error: any) {
      console.error("Error posting job:", error)
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
        setErrors([error.response.data.error])
      } else {
        toast.error("Failed to post job. Please try again.")
        setErrors(["Failed to post job. Please try again."])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingJobTypes) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-400">Loading job types...</p>
        </div>
      </div>
    )
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
              onClick={() => navigate(`/company/${companyId}/jobs`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Company Jobs</span>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{backgroundColor: '#2a2a2a'}}>
                <Briefcase className="w-8 h-8" style={{color: '#ea580c'}} />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Post a New Job
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Create a job posting to attract the best talent for your company.
              </p>
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
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Job Type *
                    </label>
                    <select
                      name="jobtypeId"
                      value={formData.jobtypeId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300 text-base"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                      required
                    >
                      <option value="">Select job type</option>
                      {jobTypes.map((jobType) => (
                        <option key={jobType.id} value={jobType.id}>
                          {jobType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-vertical"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    required
                  />
                </div>
              </div>

              {/* Location & Remote */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Work Type
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., San Francisco, CA"
                      className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isremote"
                        checked={formData.isremote}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-semibold text-gray-300">
                        Remote work available
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Salary Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Minimum Salary
                    </label>
                    <input
                      type="number"
                      name="salarymin"
                      value={formData.salarymin}
                      onChange={handleInputChange}
                      placeholder="50000"
                      min="0"
                      className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Must be less than maximum salary
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Maximum Salary
                    </label>
                    <input
                      type="number"
                      name="salarymax"
                      value={formData.salarymax}
                      onChange={handleInputChange}
                      placeholder="80000"
                      min="0"
                      className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Must be greater than minimum salary
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      name="salarycurrency"
                      value={formData.salarycurrency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirements & Skills */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Requirements & Skills
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Experience Required (years)
                    </label>
                    <select
                      name="experiencerequired"
                      value={formData.experiencerequired}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    >
                      <option value="0">Entry Level (0-1 years)</option>
                      <option value="2">Junior (2-3 years)</option>
                      <option value="4">Mid Level (4-6 years)</option>
                      <option value="7">Senior (7+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Education Level
                    </label>
                    <select
                      name="educationlevel"
                      value={formData.educationlevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    >
                      <option value="">No specific requirement</option>
                      <option value="High School">High School</option>
                      <option value="Associate">Associate Degree</option>
                      <option value="Bachelor">Bachelor's Degree</option>
                      <option value="Master">Master's Degree</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Required Skills
                  </label>
                  
                  {/* Skills Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="Enter a skill and press Enter or click Add"
                      className="flex-1 px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-3 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
                      style={{backgroundColor: '#ea580c'}}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  
                  {/* Skills Display */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
                          style={{backgroundColor: '#ea580c20', color: '#ea580c', borderColor: '#ea580c40'}}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="rounded-full p-0.5 transition-colors duration-200"
                            style={{backgroundColor: 'transparent'}}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Add skills one by one. Press Enter or click Add to add a skill.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Job Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="List specific requirements, certifications, or qualifications needed..."
                    className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-vertical"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Key Responsibilities
                  </label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the main duties and responsibilities..."
                    className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-vertical"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Benefits & Perks
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="List benefits, perks, and what makes your company a great place to work..."
                    className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-vertical"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                  />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Application Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="contactemail"
                      value={formData.contactemail}
                      onChange={handleInputChange}
                      placeholder="hr@company.com"
                      className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="applicationdeadline"
                      value={formData.applicationdeadline}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Must be in the future
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Application URL *
                  </label>
                  <input
                    type="url"
                    name="applicationurl"
                    value={formData.applicationurl}
                    onChange={handleInputChange}
                    placeholder="https://company.com/careers/apply"
                    className="w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isfeatured"
                      checked={formData.isfeatured}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Feature this job (highlighted listing)
                    </span>
                  </label>
                </div>
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
                      Posting Job...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Post Job
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(`/company/${companyId}/jobs`)}
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
