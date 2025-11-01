import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL, getToken } from "../config"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Modal } from "../components/Modal"
import { Tabs } from "../components/Tabs"
import { OverviewTab } from "../components/admin/OverviewTab"
import { CompaniesTab } from "../components/admin/CompaniesTab"
import { UsersTab } from "../components/admin/UsersTab"
import { JobsTab } from "../components/admin/JobsTab"
import { RolesTab } from "../components/admin/RolesTab"

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

  // modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info' | 'success'
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

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
      await axios.put(`${BACKEND_URL}/users/${userId}`, { roleId }, { headers: { Authorization: getToken() } })
      await fetchUsers(usersPage)
      toast.success('User role updated successfully')
    } catch (e) {
      console.error('Error updating user role:', e)
      toast.error('Failed to update user role')
    }
  }

  const createJobType = async () => {
    if (!newJobType.name.trim() || !newJobType.description.trim()) {
      toast.error('Please fill in both name and description')
      return
    }
    try {
      await axios.post(`${BACKEND_URL}/jobtype`, newJobType, { headers: { Authorization: getToken() } })
      setNewJobType({ name: '', description: '' })
      fetchJobTypes()
      toast.success('Job type created successfully')
    } catch (e) {
      console.error('Error creating job type:', e)
      toast.error('Failed to create job type')
    }
  }

  const deleteJobType = async (jobtypeid: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete Job Type',
      message: 'Are you sure you want to delete this job type? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/jobtype/${jobtypeid}`, { headers: { Authorization: getToken() } })
          fetchJobTypes()
          toast.success('Job type deleted successfully')
          setModalState({ ...modalState, isOpen: false })
        } catch (e) {
          console.error('Error deleting job type:', e)
          toast.error('Failed to delete job type')
          setModalState({ ...modalState, isOpen: false })
        }
      }
    })
  }

  const createCompanyType = async () => {
    if (!newCompanyType.name.trim() || !newCompanyType.description.trim()) {
      toast.error('Please fill in both name and description')
      return
    }
    try {
      await axios.post(`${BACKEND_URL}/companytype`, newCompanyType, { headers: { Authorization: getToken() } })
      setNewCompanyType({ name: '', description: '' })
      fetchCompanyTypes()
      toast.success('Company type created successfully')
    } catch (e) {
      console.error('Error creating company type:', e)
      toast.error('Failed to create company type')
    }
  }

  const deleteCompanyType = async (companyTypeId: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete Company Type',
      message: 'Are you sure you want to delete this company type? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/companytype/${companyTypeId}`, { headers: { Authorization: getToken() } })
          fetchCompanyTypes()
          toast.success('Company type deleted successfully')
          setModalState({ ...modalState, isOpen: false })
        } catch (e) {
          console.error('Error deleting company type:', e)
          toast.error('Failed to delete company type')
          setModalState({ ...modalState, isOpen: false })
        }
      }
    })
  }

  const handleBlacklistCompany = async (companyId: string, blacklist: boolean) => {
    try {
      await axios.put(`${BACKEND_URL}/company/${companyId}`, { blacklisted: blacklist }, { headers: { Authorization: getToken() } })
      fetchDashboardData()
      toast.success(blacklist ? 'Company blacklisted' : 'Company unblacklisted')
    } catch (error) {
      console.error("Error updating company:", error)
      toast.error('Failed to update company')
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete Company',
      message: 'Are you sure you want to delete this company? This will also delete all associated jobs and cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/company/${companyId}`, { headers: { Authorization: getToken() } })
          fetchDashboardData()
          toast.success('Company deleted successfully')
          setModalState({ ...modalState, isOpen: false })
        } catch (error) {
          console.error("Error deleting company:", error)
          toast.error('Failed to delete company')
          setModalState({ ...modalState, isOpen: false })
        }
      }
    })
  }

  const handleDeleteUser = async (userId: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/users/${userId}`, { headers: { Authorization: getToken() } })
          fetchUsers(usersPage)
          toast.success('User deleted successfully')
          setModalState({ ...modalState, isOpen: false })
        } catch (error) {
          console.error("Error deleting user:", error)
          toast.error('Failed to delete user')
          setModalState({ ...modalState, isOpen: false })
        }
      }
    })
  }

  const handleDeleteJob = async (jobId: string) => {
    setModalState({
      isOpen: true,
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${BACKEND_URL}/job/${jobId}`, { headers: { Authorization: getToken() } })
          fetchDashboardData()
          toast.success('Job deleted successfully')
          setModalState({ ...modalState, isOpen: false })
        } catch (error) {
          console.error("Error deleting job:", error)
          toast.error('Failed to delete job')
          setModalState({ ...modalState, isOpen: false })
        }
      }
    })
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
        <Tabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'companies', label: 'Companies' },
            { key: 'users', label: 'Users' },
            { key: 'jobs', label: 'Jobs' },
            { key: 'roles', label: 'Roles' },
            { key: 'jobtypes', label: 'Job Types' },
            { key: 'companytypes', label: 'Company Types' },
            { key: 'errors', label: 'Errors' }
          ]}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabKey)}
        />

        {/* Overview */}
      {activeTab === 'overview' && (
          <OverviewTab companies={companies} users={users} jobs={jobs} errors={errors} />
      )}

        {/* Companies */}
      {activeTab === 'companies' && (
          <CompaniesTab 
            companies={companies} 
            onBlacklist={handleBlacklistCompany}
            onDelete={handleDeleteCompany}
          />
      )}

        {/* Users */}
      {activeTab === 'users' && (
          <UsersTab
            users={users}
            roles={roles}
            page={usersPage}
            onPageChange={setUsersPage}
            onRoleUpdate={updateUserRole}
            onDelete={handleDeleteUser}
            pendingRoles={pendingUserRoles}
            onPendingRoleChange={(userId, roleId) => setPendingUserRoles(s => ({ ...s, [userId]: roleId }))}
          />
      )}

        {/* Jobs */}
      {activeTab === 'jobs' && (
          <JobsTab jobs={jobs} onDelete={handleDeleteJob} />
      )}

        {/* Roles */}
        {activeTab === 'roles' && (
          <RolesTab roles={roles} />
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

        {/* Modal Component */}
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
          onConfirm={modalState.onConfirm}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  )
}
