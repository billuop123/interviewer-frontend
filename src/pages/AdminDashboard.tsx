import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { BACKEND_URL, getToken } from "../config"
import { Link } from "react-router-dom"

interface Company {
  id: string
  name: string
  email: string
  website: string
  logo: string
  postlimit: number
  blacklisted: boolean
  created: string
  updated: string
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  roleId: string
  companyId: string
  created: string
  updated: string
}

interface Job {
  id: string
  title: string
  description: string
  companyid: string
  isactive: boolean
  isfeatured: boolean
  viewscount: number
  applicationscount: number
  created: string
  company: {
    id: string
    name: string
  }
}

interface Role { id: string; name: string; code: string }
interface JobType { id: string; name: string; description?: string }
interface CompanyType { id: string; name: string; description?: string }
interface Error { 
  id: string; 
  message: string; 
  description: string; 
  severity: string; 
  userId?: string; 
  created: string; 
  updated?: string; 
}

type TabKey = 'overview' | 'companies' | 'users' | 'jobs' | 'roles' | 'jobtypes' | 'companytypes' | 'errors'

export const AdminDashboard = function () {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  // pagination for users
  const [usersPage, setUsersPage] = useState<number>(1)
  const usersPageSize = 20
  const [usersTotal, setUsersTotal] = useState<number>(0)

  // admin resources
  const [roles, setRoles] = useState<Role[]>([])
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([])
  const [errors, setErrors] = useState<Error[]>([])
  // role editing local state
  const [pendingUserRoles, setPendingUserRoles] = useState<Record<string, string>>({})

  // create forms state
  const [newJobType, setNewJobType] = useState<{ name: string; description: string }>({ name: '', description: '' })
  const [newCompanyType, setNewCompanyType] = useState<{ name: string; description: string }>({ name: '', description: '' })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(usersPage)
      fetchRoles()
    }
  }, [activeTab, usersPage])

  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles()
    } else if (activeTab === 'jobtypes') {
      fetchJobTypes()
    } else if (activeTab === 'companytypes') {
      fetchCompanyTypes()
    } else if (activeTab === 'errors') {
      fetchErrors()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [companiesRes, jobsRes, errorsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/company`, { headers: { Authorization: getToken() } }),
        axios.get(`${BACKEND_URL}/job`, { headers: { Authorization: getToken() } }),
        axios.get(`${BACKEND_URL}/error`, { headers: { Authorization: getToken() } })
      ])
      setCompanies(companiesRes.data)
      setJobs(jobsRes.data)
      setErrors(errorsRes.data.errors || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (page: number) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users?limit=${usersPageSize}&page=${page}`, {
        headers: { Authorization: getToken() }
      })
      // backend returns { result }
      setUsers(res.data.result || [])
      // naive total - if backend doesn't provide count, infer from page fill
      setUsersTotal(page * usersPageSize + (res.data.result?.length || 0))
    } catch (e) {
      console.error('Error fetching users:', e)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/roles/getallroles`, { headers: { Authorization: getToken() } })
      setRoles(res.data.roles || [])
    } catch (e) {
      console.error('Error fetching roles:', e)
    }
  }

  const fetchJobTypes = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/jobtype/getAllJobs`, { headers: { Authorization: getToken() } })
      setJobTypes(res.data.allJobs || [])
    } catch (e) {
      console.error('Error fetching job types:', e)
    }
  }

  const fetchCompanyTypes = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/companytype/getAllcompanytype`, { headers: { Authorization: getToken() } })
      setCompanyTypes(res.data || [])
    } catch (e) {
      console.error('Error fetching company types:', e)
    }
  }

  const fetchErrors = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/error`, { headers: { Authorization: getToken() } })
      setErrors(res.data.errors || [])
    } catch (e) {
      console.error('Error fetching errors:', e)
    }
  }

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      await axios.put(`${BACKEND_URL}/user/${userId}`, { roleId }, { headers: { Authorization: getToken() } })
      await fetchUsers(usersPage)
    } catch (e) {
      console.error('Error updating user role:', e)
    }
  }

  const createJobType = async () => {
    if (!newJobType.name.trim() || !newJobType.description.trim()) return
    try {
      await axios.post(`${BACKEND_URL}/jobtype`, newJobType, { headers: { Authorization: getToken() } })
      setNewJobType({ name: '', description: '' })
      fetchJobTypes()
    } catch (e) {
      console.error('Error creating job type:', e)
    }
  }

  const deleteJobType = async (jobtypeid: string) => {
    if (!confirm('Delete this job type?')) return
    try {
      await axios.delete(`${BACKEND_URL}/jobstype/${jobtypeid}`, { headers: { Authorization: getToken() } })
      fetchJobTypes()
    } catch (e) {
      console.error('Error deleting job type:', e)
    }
  }

  const createCompanyType = async () => {
    if (!newCompanyType.name.trim() || !newCompanyType.description.trim()) return
    try {
      await axios.post(`${BACKEND_URL}/companytype`, newCompanyType, { headers: { Authorization: getToken() } })
      setNewCompanyType({ name: '', description: '' })
      fetchCompanyTypes()
    } catch (e) {
      console.error('Error creating company type:', e)
    }
  }

  const deleteCompanyType = async (companyTypeId: string) => {
    if (!confirm('Delete this company type?')) return
    try {
      await axios.delete(`${BACKEND_URL}/companytype/${companyTypeId}`, { headers: { Authorization: getToken() } })
      fetchCompanyTypes()
    } catch (e) {
      console.error('Error deleting company type:', e)
    }
  }

  const handleBlacklistCompany = async (companyId: string, blacklist: boolean) => {
    try {
      await axios.put(`${BACKEND_URL}/company/${companyId}`, { blacklisted: blacklist }, { headers: { Authorization: getToken() } })
      fetchDashboardData()
    } catch (error) {
      console.error("Error updating company:", error)
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await axios.delete(`${BACKEND_URL}/company/${companyId}`, { headers: { Authorization: getToken() } })
        fetchDashboardData()
      } catch (error) {
        console.error("Error deleting company:", error)
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BACKEND_URL}/user/${userId}`, { headers: { Authorization: getToken() } })
        fetchUsers(usersPage)
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${BACKEND_URL}/job/${jobId}`, { headers: { Authorization: getToken() } })
        fetchDashboardData()
      } catch (error) {
        console.error("Error deleting job:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'companies', label: 'Companies' },
          { key: 'users', label: 'Users' },
            { key: 'jobs', label: 'Jobs' },
            { key: 'roles', label: 'Roles' },
            { key: 'jobtypes', label: 'Job Types' },
            { key: 'companytypes', label: 'Company Types' },
            { key: 'errors', label: 'Errors' }
        ].map(tab => (
          <button
            key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-4 py-2 rounded-t-md font-medium transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white border-b-2 border-blue-600 dark:border-blue-500' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

        {/* Overview */}
      {activeTab === 'overview' && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-blue-600 text-white rounded-xl p-6 shadow">
                <h3 className="text-sm opacity-90">Total Companies</h3>
                <p className="text-3xl font-bold">{companies.length}</p>
              </div>
              <div className="bg-green-600 text-white rounded-xl p-6 shadow">
                <h3 className="text-sm opacity-90">Total Users</h3>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <div className="bg-cyan-600 text-white rounded-xl p-6 shadow">
                <h3 className="text-sm opacity-90">Total Jobs</h3>
                <p className="text-3xl font-bold">{jobs.length}</p>
            </div>
              <div className="bg-amber-400 text-black rounded-xl p-6 shadow">
                <h3 className="text-sm opacity-90">Active Jobs</h3>
                <p className="text-3xl font-bold">{jobs.filter(j => j.isactive).length}</p>
            </div>
              <div className="bg-red-600 text-white rounded-xl p-6 shadow">
                <h3 className="text-sm opacity-90">System Errors</h3>
                <p className="text-3xl font-bold">{errors.length}</p>
            </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Companies</h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {companies.slice(0,5).map(c => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.created).toLocaleDateString()}</span>
            </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Jobs</h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {jobs.slice(0,5).map(j => (
                    <div key={j.id} className="py-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{j.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{j.company.name}</span>
                </div>
              ))}
                </div>
              </div>
          </div>
        </div>
      )}

        {/* Companies */}
      {activeTab === 'companies' && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Companies Management</h2>
              <Link to="/create-company" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium">Create Company</Link>
          </div>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Website</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Post Limit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {companies.map(company => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                      {company.logo && (
                            <img src={company.logo} alt={company.name} className="w-6 h-6 rounded" />
                      )}
                      {company.name}
                        </div>
                    </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{company.email}</td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                        {company.website ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : 'N/A'}
                    </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{company.postlimit}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${company.blacklisted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                          {company.blacklisted ? 'Blacklisted' : 'Active'}
                      </span>
                    </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleBlacklistCompany(company.id, !company.blacklisted)} className={`px-3 py-1 rounded-md text-sm font-medium ${company.blacklisted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-400 hover:bg-amber-500 text-black'}`}>
                            {company.blacklisted ? 'Unblacklist' : 'Blacklist'}
                        </button>
                          <button onClick={() => handleDeleteCompany(company.id)} className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Users */}
      {activeTab === 'users' && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users Management</h2>
              <div className="flex items-center gap-2">
                <button disabled={usersPage === 1} onClick={() => setUsersPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50">Prev</button>
                <span className="text-gray-700 dark:text-gray-300">Page {usersPage}</span>
                <button onClick={() => setUsersPage(p => p + 1)} className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Next</button>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{user.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.companyId ? 'Associated' : 'Independent'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(user.created).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <select
                          value={pendingUserRoles[user.id] ?? user.roleId ?? ''}
                          onChange={(e) => setPendingUserRoles(s => ({ ...s, [user.id]: e.target.value }))}
                          className="px-2 py-1 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Select role</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                    </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateUserRole(user.id, (pendingUserRoles[user.id] ?? user.roleId) || '')} className="px-3 py-1 rounded-md text-sm font-medium bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors">Save</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Delete</button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Jobs */}
      {activeTab === 'jobs' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Jobs Management</h2>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Views</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Applications</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3">
                        <Link to={`/job/${job.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{job.title}</Link>
                    </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{job.company.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{job.viewscount}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{job.applicationscount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${job.isactive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {job.isactive ? 'Active' : 'Inactive'}
                        </span>
                        {job.isfeatured && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-amber-400 text-black">Featured</span>
                      )}
                    </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteJob(job.id)} className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Roles */}
        {activeTab === 'roles' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roles</h2>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {roles.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Types */}
        {activeTab === 'jobtypes' && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Types</h2>
              <div className="flex items-center gap-2">
                <input value={newJobType.name} onChange={(e) => setNewJobType(s => ({ ...s, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
                <input value={newJobType.description} onChange={(e) => setNewJobType(s => ({ ...s, description: e.target.value }))} placeholder="Description" className="px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
                <button onClick={createJobType} className="px-3 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors">Add</button>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {jobTypes.map(jt => (
                    <tr key={jt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{jt.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{jt.description || ''}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteJobType(jt.id)} className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Company Types */}
        {activeTab === 'companytypes' && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Company Types</h2>
              <div className="flex items-center gap-2">
                <input value={newCompanyType.name} onChange={(e) => setNewCompanyType(s => ({ ...s, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
                <input value={newCompanyType.description} onChange={(e) => setNewCompanyType(s => ({ ...s, description: e.target.value }))} placeholder="Description" className="px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white" />
                <button onClick={createCompanyType} className="px-3 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors">Add</button>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {companyTypes.map(ct => (
                    <tr key={ct.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{ct.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ct.description || ''}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteCompanyType(ct.id)} className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {activeTab === 'errors' && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Errors</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total: {errors.length}</span>
                <button onClick={fetchErrors} className="px-3 py-2 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors">Refresh</button>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Severity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {errors.map(error => (
                    <tr key={error.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          error.severity === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          error.severity === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          error.severity === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {error.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{error.message}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={error.description}>
                        {error.description}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {error.userId ? (
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {error.userId.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {new Date(error.created).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {errors.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No errors found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
