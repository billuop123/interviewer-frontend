import axios from "axios"
import { useEffect, useState } from "react"
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

export const AdminDashboard = function () {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'jobs'>('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [companiesRes, usersRes, jobsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/company`, {
          headers: { Authorization: getToken() }
        }),
        axios.get(`${BACKEND_URL}/user`, {
          headers: { Authorization: getToken() }
        }),
        axios.get(`${BACKEND_URL}/job`, {
          headers: { Authorization: getToken() }
        })
      ])
      
      setCompanies(companiesRes.data)
      setUsers(usersRes.data.result)
      setJobs(jobsRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlacklistCompany = async (companyId: string, blacklist: boolean) => {
    try {
      await axios.put(`${BACKEND_URL}/company/${companyId}`, {
        blacklisted: blacklist
      }, {
        headers: { Authorization: getToken() }
      })
      fetchDashboardData()
    } catch (error) {
      console.error("Error updating company:", error)
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await axios.delete(`${BACKEND_URL}/company/${companyId}`, {
          headers: { Authorization: getToken() }
        })
        fetchDashboardData()
      } catch (error) {
        console.error("Error deleting company:", error)
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BACKEND_URL}/user/${userId}`, {
          headers: { Authorization: getToken() }
        })
        fetchDashboardData()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${BACKEND_URL}/job/${jobId}`, {
          headers: { Authorization: getToken() }
        })
        fetchDashboardData()
      } catch (error) {
        console.error("Error deleting job:", error)
      }
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Admin Dashboard
      </h1>

      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "30px",
        borderBottom: "2px solid #dee2e6"
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'companies', label: 'Companies' },
          { key: 'users', label: 'Users' },
          { key: 'jobs', label: 'Jobs' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "12px 24px",
              border: "none",
              backgroundColor: activeTab === tab.key ? "#007bff" : "transparent",
              color: activeTab === tab.key ? "white" : "#333",
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
              fontWeight: "bold",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = "#f8f9fa"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "20px",
            marginBottom: "30px"
          }}>
            <div style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Total Companies</h3>
              <p style={{ fontSize: "32px", margin: "0", fontWeight: "bold" }}>
                {companies.length}
              </p>
            </div>
            
            <div style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Total Users</h3>
              <p style={{ fontSize: "32px", margin: "0", fontWeight: "bold" }}>
                {users.length}
              </p>
            </div>
            
            <div style={{
              backgroundColor: "#17a2b8",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Total Jobs</h3>
              <p style={{ fontSize: "32px", margin: "0", fontWeight: "bold" }}>
                {jobs.length}
              </p>
            </div>
            
            <div style={{
              backgroundColor: "#ffc107",
              color: "#000",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Active Jobs</h3>
              <p style={{ fontSize: "32px", margin: "0", fontWeight: "bold" }}>
                {jobs.filter(job => job.isactive).length}
              </p>
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "20px" 
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #dee2e6"
            }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Recent Companies</h3>
              {companies.slice(0, 5).map(company => (
                <div key={company.id} style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: "500" }}>{company.name}</span>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {new Date(company.created).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #dee2e6"
            }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Recent Jobs</h3>
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} style={{
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: "500" }}>{job.title}</span>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {job.company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h2 style={{ margin: "0", color: "#333" }}>Companies Management</h2>
            <Link 
              to="/create-company"
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: "bold"
              }}
            >
              Create Company
            </Link>
          </div>

          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            border: "1px solid #dee2e6",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Name</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Website</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Post Limit</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id}>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      {company.logo && (
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`}
                          style={{ width: "30px", height: "30px", marginRight: "10px", verticalAlign: "middle" }}
                        />
                      )}
                      {company.name}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{company.email}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      ) : "N/A"}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{company.postlimit}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: company.blacklisted ? "#dc3545" : "#28a745",
                        color: "white"
                      }}>
                        {company.blacklisted ? "Blacklisted" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => handleBlacklistCompany(company.id, !company.blacklisted)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: company.blacklisted ? "#28a745" : "#ffc107",
                            color: company.blacklisted ? "white" : "#000"
                          }}
                        >
                          {company.blacklisted ? "Unblacklist" : "Blacklist"}
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#dc3545",
                            color: "white"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Users Management</h2>
          
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            border: "1px solid #dee2e6",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Name</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Email</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Phone</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Company</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Joined</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{user.name}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{user.email}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{user.phone || "N/A"}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      {user.companyId ? "Associated" : "Independent"}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      {new Date(user.created).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          backgroundColor: "#dc3545",
                          color: "white"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Jobs Management</h2>
          
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            border: "1px solid #dee2e6",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Title</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Company</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Views</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Applications</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <Link 
                        to={`/job/${job.id}`}
                        style={{ color: "#007bff", textDecoration: "none" }}
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{job.company.name}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{job.viewscount}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>{job.applicationscount}</td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: job.isactive ? "#28a745" : "#dc3545",
                        color: "white"
                      }}>
                        {job.isactive ? "Active" : "Inactive"}
                      </span>
                      {job.isfeatured && (
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: "#ffc107",
                          color: "#000",
                          marginLeft: "5px"
                        }}>
                          Featured
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "15px", borderBottom: "1px solid #eee" }}>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          backgroundColor: "#dc3545",
                          color: "white"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
