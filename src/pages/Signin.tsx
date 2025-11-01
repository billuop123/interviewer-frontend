import React, { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { BACKEND_URL } from "../config"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"

export const Signin = function() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { setUser } = useUser()
    const navigate = useNavigate()
    
    const handleSignin = async function() {
        if (!email || !password) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        setError("")
        
        try {
            const response = await axios.post(`${BACKEND_URL}/auth/signin`, {
                email,
                password
            })
            
            sessionStorage.setItem("auth_token", response.data.token)
            const { name: contextName, email: contextEmail, role: { code: contextRole }, id } = response.data.result
            console.log(contextRole)
            setUser({ name: contextName, email: contextEmail, role: contextRole, userId: id })
            
            toast.success(`Welcome back, ${contextName}! 🎉`)
            if (contextRole === "ADMIN") {
                navigate("/admindashboard")
            } else {
                navigate("/dashboard")
            }
            
        } catch (error: any) {
            console.error("Signin error:", error)
                if (error.response?.data?.message) {
                toast.error(error.response.data.message)
                setError(error.response.data.message)
            } else {
                toast.error("Sign in failed. Please try again.")
                setError("Sign in failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative w-full min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Main card */}
                <div className="rounded-2xl border shadow-2xl p-6 sm:p-8 lg:p-12 xl:p-16 space-y-8 lg:space-y-0 relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full max-w-7xl" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
                    {/* Left Column - Welcome Section */}
                    <div className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg" style={{backgroundColor: '#2a2a2a'}}>
                                <LogIn className="w-10 h-10" style={{color: '#ea580c'}} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                    Welcome Back
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                                    Sign in to your account and continue your journey with us.
                                </p>
                            </div>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">Access your dashboard</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">Manage your applications</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">Connect with employers</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Section */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-white">
                                Sign In
                            </h2>
                            <p className="text-gray-400">
                                Enter your credentials to access your account
                            </p>
                        </div>
                        
                        {/* Error message */}
                        {error && (
                            <div className="border text-red-300 px-4 py-3 rounded-xl text-sm" style={{backgroundColor: '#7f1d1d33', borderColor: '#991b1b80'}}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {error}
                                </div>
                            </div>
                        )}
                        
                        {/* Form */}
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignin(); }}>
                            {/* Email Input */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                                        placeholder="Enter your email address"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Password
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 pr-12 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full flex items-center justify-center gap-3 px-6 py-3 text-white rounded-xl font-semibold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 active:scale-95" style={{backgroundColor: '#ea580c', boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.2)'}}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Signing you in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                            Sign In
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* OAuth separator */}
                            <div className="relative py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px" style={{backgroundColor: '#374151'}}></div>
                                    <span className="text-xs text-gray-400">or</span>
                                    <div className="flex-1 h-px" style={{backgroundColor: '#374151'}}></div>
                                </div>
                            </div>

                            {/* Google Sign-in */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => { window.location.href = `${BACKEND_URL}/auth/google` }}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 border hover:shadow-md"
                                    style={{backgroundColor: '#ffffff', color: '#111827', borderColor: '#e5e7eb'}}
                                >
                                    <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
                                    Continue with Google
                                </button>
                            </div>

                            {/* Sign up link */}
                            <div className="text-center pt-3" style={{borderTopColor: '#374151'}}>
                                <p className="text-sm text-gray-400">
                                    Don't have an account?{" "}
                                    <Link 
                                        to="/signup" 
                                        className="font-semibold transition-colors duration-200 hover:underline underline-offset-4"
                                        style={{color: '#ea580c'}}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#dc5500'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#ea580c'}
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced floating elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 rounded-2xl opacity-70 shadow-xl animate-pulse" style={{backgroundColor: '#2a2a2a'}}></div>
                <div className="absolute -bottom-8 -left-8 w-12 h-12 rounded-xl opacity-60 shadow-lg animate-pulse" style={{backgroundColor: '#1a1a1a'}}></div>
            </div>
        </div>
    )
}
