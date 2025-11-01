import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken } from "../config"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { PageHeader } from "../components/companies/PageHeader"
import { CompanyCard } from "../components/companies/CompanyCard"
import { EmptyState } from "../components/companies/EmptyState"
import { CreateCompanyModal } from "../components/companies/CreateCompanyModal"

interface Company {
  id: string
  name: string
  email: string | null
  website: string | null
  logo: string | null
  postlimit: number | null
  blacklisted: boolean
  created: string
  updated: string | null
}

export const MyCompanies = function () {
  const { user, loading: userLoading } = useUser()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const hasFetched = useRef(false)
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    logo: "",
    postlimit: 10
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setFormData({ name: "", email: "", website: "", logo: "", postlimit: 10 })
    setFormErrors([])
  }

  const fetchUserCompanies = async () => {
    if (hasFetched.current) return; // Prevent multiple requests
    
    try {
      setLoading(true)
      hasFetched.current = true
      
      if (!user.userId) {
        setLoading(false)
        return
      }
      
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${BACKEND_URL}/company`, {
        headers: {
          Authorization: token,
        },
      })
      
      setCompanies(response.data || [])
    } catch (error) {
      hasFetched.current = false // Reset on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for UserContext to finish loading
    if (userLoading) {
      return
    }
    
    if (user.userId && !hasFetched.current) {
      fetchUserCompanies()
    } else if (!user.userId) {
      setLoading(false) // Stop loading if no user
    }
  }, [user.userId, userLoading])

  // Removed empty useEffect that was causing infinite loop

  const refreshCompanies = () => {
    hasFetched.current = false
    setCompanies([])
    if (user.userId) {
      fetchUserCompanies()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'postlimit' ? parseInt(value) || 0 : value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []
    
    if (!formData.name.trim()) {
      newErrors.push("Company name is required")
    }
    
    if (!formData.email.trim()) {
      newErrors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Please enter a valid email address")
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.push("Website must start with http:// or https://")
    }
    
    if (formData.logo && !/^https?:\/\/.+/.test(formData.logo)) {
      newErrors.push("Logo URL must start with http:// or https://")
    }
    
    if (formData.postlimit < 1) {
      newErrors.push("Post limit must be at least 1")
    }
    
    setFormErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/company`, formData, {
        headers: {
          Authorization: getToken(),
        },
      })
      
      if (response.status === 201) {
        toast.success("Company created successfully! 🎉")
        handleCloseModal()
        refreshCompanies()
      }
    } catch (error: any) {
      console.error("Error creating company:", error)
      if (error.response?.data?.error) {
        setFormErrors([error.response.data.error])
      } else {
        setFormErrors(["Failed to create company. Please try again."])
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCompany = async (companyId: string) => {
    if (window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      try {
        await axios.delete(`${BACKEND_URL}/company/${companyId}`, {
          headers: {
            Authorization: getToken(),
          },
        })
        refreshCompanies()
        toast.success("Company deleted successfully! 🗑️")
      } catch (error) {
        console.error("Error deleting company:", error)
        toast.error("Failed to delete company. Please try again.")
      }
    }
  }



  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-400">
              Loading your companies...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 min-h-full">
        <div className="max-w-7xl mx-auto">
          <PageHeader onCreateClick={() => setShowCreateModal(true)} />

          {(companies || []).length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className="grid gap-6">
              {companies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  company={company}
                  onDelete={handleDeleteCompany}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCompanyModal
        isOpen={showCreateModal}
        formData={formData}
        formErrors={formErrors}
        formLoading={formLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCompany}
        onInputChange={handleInputChange}
      />
    </div>
  )
}
