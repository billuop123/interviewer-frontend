import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export const OAuthCallback: React.FC = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (token) {
            sessionStorage.setItem('auth_token', token)
            toast.success('Signed in with Google')
            navigate('/dashboard', { replace: true })
        } else {
            toast.error('Google sign-in failed')
            navigate('/signin', { replace: true })
        }
    }, [navigate])

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="text-gray-300">Completing sign-in...</div>
        </div>
    )
}

export default OAuthCallback


