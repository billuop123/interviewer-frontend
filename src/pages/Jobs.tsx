import { useEffect, useState } from "react"
import axios from "axios"
import { Briefcase, Building2, Calendar, DollarSign, ExternalLink, Filter, MapPin, Search, Star, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"

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

export const Jobs = function () {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterCompany, setFilterCompany] = useState<string>("")
  const [filterJobType, setFilterJobType] = useState<string>("")
  const [filterRemote, setFilterRemote] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    async function fetchAllJobs() {
      try {
        setLoading(true)
        const response = await axios.get(`${BACKEND_URL}/job`, {
          headers: {
            Authorization: getToken(),
          },
        })
        setJobs(response.data)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllJobs()
  }, [])

  // Get unique companies and job types for filters
  const companies = [...new Set((jobs || []).map(job => job.company?.name).filter(Boolean))]
  const jobTypes = [...new Set((jobs || []).map(job => job.jobtype?.name).filter(Boolean))]

  // Filter and sort jobs
  let filteredJobs = (jobs || []).filter(job => {
    const matchesSearch = job.title.toLowerCase().includes((searchTerm || "").toLowerCase()) ||
                         job.description.toLowerCase().includes((searchTerm || "").toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes((searchTerm || "").toLowerCase())) ||
                         job.company?.name.toLowerCase().includes((searchTerm || "").toLowerCase())
    
    const matchesCompany = !filterCompany || job.company?.name === filterCompany
    const matchesJobType = !filterJobType || job.jobtype?.name === filterJobType
    const matchesRemote = !filterRemote || 
                         (filterRemote === "remote" && job.isremote) ||
                         (filterRemote === "onsite" && !job.isremote)
    
    return matchesSearch && matchesCompany && matchesJobType && matchesRemote
  })

  // Sort jobs
  filteredJobs.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.applicationdeadline).getTime() - new Date(a.applicationdeadline).getTime()
      case "oldest":
        return new Date(a.applicationdeadline).getTime() - new Date(b.applicationdeadline).getTime()
      case "salary-high":
        return parseFloat(b.salarymax) - parseFloat(a.salarymax)
      case "salary-low":
        return parseFloat(a.salarymin) - parseFloat(b.salarymin)
      case "applications":
        return b.applicationscount - a.applicationscount
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading available jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-300/15 to-gray-200/15 dark:from-gray-600/15 dark:to-gray-700/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Available Jobs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover your next career opportunity
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title, description, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </label>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300"
                >
                  <option value="">All Companies</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Type
                </label>
                <select
                  value={filterJobType}
                  onChange={(e) => setFilterJobType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300"
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Work Type
                </label>
                <select
                  value={filterRemote}
                  onChange={(e) => setFilterRemote(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300"
                >
                  <option value="">All</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                  <option value="applications">Most Applications</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredJobs.length} of {(jobs || []).length} jobs
            </p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="max-w-7xl mx-auto">
          {filteredJobs.length === 0 ? (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                No jobs match your current search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <Link 
                  to={`/job/${job.id}`} 
                  key={job.id} 
                  className="block group"
                >
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6 group-hover:-translate-y-1 relative">
                    {job.isfeatured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
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
                            className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-gray-800 p-2"
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
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{job.company?.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              Deadline: {new Date(job.applicationdeadline).toLocaleDateString()}
                            </div>
                            {/* <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              {job.applicationscount} applications
                            </div> */}
                          </div>
                        </div>

                        {/* Job Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {job.description.length > 200 
                            ? `${job.description.substring(0, 200)}...` 
                            : job.description
                          }
                        </p>

                        {/* Skills and Apply */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 4).map((skill, idx) => (
                              <span 
                                key={idx} 
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                +{job.skills.length - 4} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                            View Details
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
