import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/userContext'
import toast from 'react-hot-toast'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[] // role codes like 'RECRUITER', 'ADMIN'
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, loading } = useUser()

  if (loading) return null

  // Fallback role from token on first paint
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null
  let tokenRole = ''
  try {
    if (token) {
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1] || ''))
      tokenRole = (payload?.role || '').toUpperCase()
    }
  } catch {}

  const roleCode = (user?.role || tokenRole || '').toUpperCase()

  if (!allowedRoles.map(r => r.toUpperCase()).includes(roleCode)) {
    toast.error('You do not have permission to access this page')
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}


