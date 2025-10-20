import { Link, useNavigate } from "react-router-dom"
import { Search, LogOut, Building2, Plus } from "lucide-react"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { useEffect, useMemo, useState } from "react"
import { BACKEND_URL, getToken } from "../config"

interface UserApplication {
  id: string
  created: string
  relevancescore?: number | string | null
  videolink?: string | null
  job: { id: string; title: string; company: { id: string; name: string } }
}

interface JobSummary {
  id: string
  postedby?: string | null
  isactive: boolean
  applicationscount: number
  viewscount: number
}

export const Dashboard = function () {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const roleCode = user?.role || ""
  const isRecruiter = roleCode === "RECRUITER" || roleCode === "ADMIN"

  const [userApps, setUserApps] = useState<UserApplication[]>([])
  const [ownedJobs, setOwnedJobs] = useState<JobSummary[]>([])

  useEffect(() => {
    const load = async () => {
      const headers = { Authorization: getToken() || "" }
      try {
        if (isRecruiter) {
          const res = await fetch(`${BACKEND_URL}/job`, { headers })
          const data = await res.json()
          const mine: JobSummary[] = (Array.isArray(data) ? data : []).filter((j: any) => j.postedby === user.userId).map((j: any) => ({
            id: j.id,
            postedby: j.postedby,
            isactive: !!j.isactive,
            applicationscount: Number(j.applicationscount || 0),
            viewscount: Number(j.viewscount || 0),
          }))
          setOwnedJobs(mine)
        } else {
          const res = await fetch(`${BACKEND_URL}/application/user`, { headers })
          const data = await res.json()
          const apps: UserApplication[] = Array.isArray(data) ? data : []
          setUserApps(apps)
        }
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [isRecruiter, user.userId])

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/signin")
  }

  // USER STATS
  const userStats = useMemo(() => {
    if (isRecruiter) return null
    const total = userApps.length
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const last7 = userApps.filter(a => new Date(a.created).getTime() >= weekAgo).length
    const scores = userApps.map(a => Number(a.relevancescore)).filter(n => !isNaN(n))
    const avgScore = scores.length ? (scores.reduce((s, n) => s + n, 0) / scores.length) : null
    const videos = userApps.filter(a => !!a.videolink).length
    return { total, last7, avgScore, videos }
  }, [isRecruiter, userApps])

  // RECRUITER STATS
  const recruiterStats = useMemo(() => {
    if (!isRecruiter) return null
    const jobsPosted = ownedJobs.length
    const activeJobs = ownedJobs.filter(j => j.isactive).length
    const totalApps = ownedJobs.reduce((s, j) => s + (Number(j.applicationscount) || 0), 0)
    const totalViews = ownedJobs.reduce((s, j) => s + (Number(j.viewscount) || 0), 0)
    return { jobsPosted, activeJobs, totalApps, totalViews }
  }, [isRecruiter, ownedJobs])

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
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {isRecruiter ? "Recruiter Dashboard" : "My Applications Dashboard"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {isRecruiter ? "Manage your companies and job postings" : "Track and manage your job applications"}
              </p>
            </div>
            
            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.name || user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Section */}
          {!isRecruiter && userStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.total}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.last7}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.avgScore !== null ? userStats.avgScore.toFixed(1) : '—'}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos Uploaded</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.videos}</p>
              </div>
            </div>
          )}

          {isRecruiter && recruiterStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Posted</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{recruiterStats.jobsPosted}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{recruiterStats.activeJobs}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{recruiterStats.totalApps}</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{recruiterStats.totalViews}</p>
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/jobs" 
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Browse Jobs</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find new opportunities</p>
                </div>
              </Link>

              {isRecruiter ? (
                <>
                  <Link 
                    to="/create-company" 
                    className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Create Company</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Start your business</p>
                    </div>
                  </Link>

                  <Link 
                    to="/my-companies" 
                    className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">My Companies</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your businesses</p>
                    </div>
                  </Link>
                </>
              ) : (
                <Link 
                  to="/applications" 
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">My Applications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View submissions and results</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

