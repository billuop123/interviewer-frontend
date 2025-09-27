import {type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../config'
import toast from 'react-hot-toast'

interface AuthGuardProps {
  children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  // Simply check if token exists in storage
  const token = getToken()

  // If no token, redirect to signin
  if (!token) {
    toast.error('Please sign in to access this page')
    return <Navigate to="/signin" replace />
  }

  // If token exists, show the protected content
  return <>{children}</>
}
