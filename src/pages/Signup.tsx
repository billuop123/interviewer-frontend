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
                                <Sparkles className="w-10 h-10" style={{color: '#ea580c'}} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                    Join Our Platform
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                                    Create your account and connect with thousands of professionals finding their dream jobs.
                                </p>
                            </div>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">Access to premium job listings</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">Connect with top employers</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ea580c'}}></div>
                                <span className="text-gray-300">AI-powered job recommendations</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Section */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-white">
                                Create Account
                            </h2>
                            <p className="text-gray-400">
                                Fill in your details to get started
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
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                        {/* Name Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
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
                                    className="block w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                                    placeholder="Enter your full name"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                        
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
                                    className="block w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                                    placeholder="Enter your email address"
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                                <span className="text-gray-500 font-normal text-xs ml-1">(optional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full px-4 py-3 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg" style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563'}}
                                    placeholder="Enter your phone number"
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
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                            {/* Password strength indicator */}
                            <div className="mt-2 space-y-2 p-3 rounded-lg" style={{backgroundColor: '#2a2a2a'}}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full transition-all duration-300" style={{backgroundColor: password.length >= 8 ? '#22c55e' : '#1a1a1a'}}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${password.length >= 8 ? 'text-green-400' : 'text-gray-400'}`}>
                                        At least 8 characters
                                    </span>
                                    {password.length >= 8 && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full transition-all duration-300" style={{backgroundColor: /[A-Z]/.test(password) ? '#22c55e' : '#1a1a1a'}}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                                        Uppercase letter
                                    </span>
                                    {/[A-Z]/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full transition-all duration-300" style={{backgroundColor: /[a-z]/.test(password) ? '#22c55e' : '#1a1a1a'}}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                                        Lowercase letter
                                    </span>
                                    {/[a-z]/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full transition-all duration-300" style={{backgroundColor: /\d/.test(password) ? '#22c55e' : '#1a1a1a'}}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/\d/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
                                        Number
                                    </span>
                                    {/\d/.test(password) && <Check className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full transition-all duration-300" style={{backgroundColor: /[@$!%*?&#]/.test(password) ? '#22c55e' : '#1a1a1a'}}></div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${/[@$!%*?&#]/.test(password) ? 'text-green-400' : 'text-gray-400'}`}>
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
                                className="group w-full flex items-center justify-center gap-3 px-6 py-3 text-white rounded-xl font-semibold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-105 active:scale-95" style={{backgroundColor: '#ea580c', boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.2)'}}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                        <div className="text-center pt-3" style={{borderTopColor: '#374151'}}>
                            <p className="text-sm text-gray-400">
                                Already have an account?{" "}
                                <a 
                                    href="/signin" 
                                    className="font-semibold transition-colors duration-200 hover:underline underline-offset-4"
                                    style={{color: '#ea580c'}}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#dc5500'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#ea580c'}
                                >
                                    Sign in
                                </a>
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
