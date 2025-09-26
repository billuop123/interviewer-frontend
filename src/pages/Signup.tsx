import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BACKEND_URL } from "../config"
import toast from "react-hot-toast"
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Check, Phone } from "lucide-react"

export const Signup = function() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async function() {
        if (!name || !email || !password) {
            toast.error("Please fill in all required fields")
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long")
            return
        }
        
        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumbers = /\d/.test(password)
        const hasSpecialChar = /[@$!%*?&#]/.test(password)
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)")
            return
        }

        setLoading(true)
        setError("")
        
        try {
            const response = await axios.post(`${BACKEND_URL}/users/signup`, {
                name,
                email,
                password,
                phone
            })
            
            toast.success(`Account created successfully! Please sign in to continue. 🎉`)
            
            // Redirect to signin page after successful signup
            navigate("/signin")
            
        } catch (error: any) {
            console.error("Signup error:", error)
            if (error.response?.data?.message) {
                // Handle validation errors (array) or single message
                const errorMessage = Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ')
                    : error.response.data.message
                toast.error(errorMessage)
                setError(errorMessage)
            } else {
                toast.error("Sign up failed. Please try again.")
                setError("Sign up failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-hidden">
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-300/25 to-gray-200/25 dark:from-gray-600/25 dark:to-gray-700/25 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-400/40 dark:bg-gray-500/40 rounded-full"></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-gray-300/50 dark:bg-gray-600/50 rounded-full"></div>
                <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gray-400/30 dark:bg-gray-500/30 rounded-full"></div>
            </div>

            <div className="relative w-full min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Main card */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8 lg:p-12 xl:p-16 space-y-8 lg:space-y-0 relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full max-w-7xl">
                    {/* Left Column - Welcome Section */}
                    <div className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left">
                        <div className="space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-lg">
                                <Sparkles className="w-10 h-10 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                    Join Our Platform
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Create your account and connect with thousands of professionals finding their dream jobs.
                                </p>
                            </div>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                                <span className="text-gray-700 dark:text-gray-300">Access to premium job listings</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                                <span className="text-gray-700 dark:text-gray-300">Connect with top employers</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                                <span className="text-gray-700 dark:text-gray-300">AI-powered job recommendations</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Section */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create Account
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fill in your details to get started
                            </p>
                        </div>
                        
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {error}
                                </div>
                            </div>
                        )}
                        
                        {/* Form */}
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                        {/* Name Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Full Name
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                                    placeholder="Enter your full name"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-gray-800/10 dark:to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        
                        {/* Email Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
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
                                    className="block w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                                    placeholder="Enter your email address"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-gray-800/10 dark:to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                                <span className="text-gray-500 dark:text-gray-400 font-normal text-xs ml-1">(optional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                                    placeholder="Enter your phone number"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-gray-800/10 dark:to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 pr-12 bg-white/70 dark:bg-gray-800/70 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-gray-800/10 dark:to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            {/* Password strength indicator */}
                            <div className="mt-2 space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${password.length >= 8 ? 'bg-green-500 shadow-sm' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        At least 8 characters
                                    </span>
                                    {password.length >= 8 && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${/[A-Z]/.test(password) ? 'bg-green-500 shadow-sm' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Uppercase letter
                                    </span>
                                    {/[A-Z]/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${/[a-z]/.test(password) ? 'bg-green-500 shadow-sm' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Lowercase letter
                                    </span>
                                    {/[a-z]/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${/\d/.test(password) ? 'bg-green-500 shadow-sm' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Number
                                    </span>
                                    {/\d/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${/[@$!%*?&#]/.test(password) ? 'bg-green-500 shadow-sm' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[@$!%*?&#]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Special character (@$!%*?&#)
                                    </span>
                                    {/[@$!%*?&#]/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold text-base hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin"></div>
                                        Creating your account...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                        Create Account
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Sign in link */}
                        <div className="text-center pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <a 
                                    href="/signin" 
                                    className="font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 hover:underline underline-offset-4"
                                >
                                    Sign in
                                </a>
                            </p>
                        </div>
                        </form>
                    </div>
                </div>

                {/* Enhanced floating elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-gray-200/60 to-gray-400/60 dark:from-gray-700/60 dark:to-gray-500/60 rounded-2xl opacity-70 shadow-xl animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-gradient-to-tr from-gray-300/50 to-gray-200/50 dark:from-gray-600/50 dark:to-gray-700/50 rounded-xl opacity-60 shadow-lg animate-pulse"></div>
                <div className="absolute top-1/4 -left-4 w-6 h-6 bg-gradient-to-r from-gray-400/40 to-gray-300/40 dark:from-gray-600/40 dark:to-gray-500/40 rounded-full opacity-50 shadow-md animate-pulse"></div>
                <div className="absolute bottom-1/3 -right-3 w-8 h-8 bg-gradient-to-l from-gray-300/60 to-gray-400/60 dark:from-gray-700/60 dark:to-gray-600/60 rounded-lg opacity-50 shadow-lg animate-pulse"></div>
            </div>
        </div>
    )
}
