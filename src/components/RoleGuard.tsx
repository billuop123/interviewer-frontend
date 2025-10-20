import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/userContext'
import toast from 'react-hot-toast'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[] // role codes like 'RECRUITER', 'ADMIN'
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user } = useUser()
  const roleCode = user?.role || ''

  if (!allowedRoles.includes(roleCode)) {
    toast.error('You do not have permission to access this page')
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

