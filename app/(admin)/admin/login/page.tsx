// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import {
//   EyeIcon,
//   EyeSlashIcon,
//   SparklesIcon,
//   LockClosedIcon,
//   EnvelopeIcon,
//   UserIcon,
//   PhoneIcon,
//   ArrowLeftIcon
// } from '@heroicons/react/24/outline'
// import { useAuth } from '@/contexts/AuthContext'
// import Image from 'next/image'

// type UserRole = 'admin' | 'agent' | 'customer'

// export default function EnhancedLoginPage() {
//   const [isLogin, setIsLogin] = useState(true)
//   const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     fullName: '',
//     phone: ''
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const router = useRouter()
//   const { signIn, signUp, signInAsAdmin, signInAsAgent } = useAuth()

//   const handleRoleChange = (role: UserRole) => {
//     setSelectedRole(role)
//     setError('')
//     setSuccess('')
//     setFormData({
//       email: '',
//       password: '',
//       fullName: '',
//       phone: ''
//     })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError('')
//     setSuccess('')

//     try {
//       if (isLogin) {
//         // 🔹 LOGIN FLOW
//         let result
        
//         if (selectedRole === 'admin') {
//           result = await signInAsAdmin(formData.email, formData.password)
//         } else if (selectedRole === 'agent') {
//           result = await signInAsAgent(formData.email, formData.password)
//         } else {
//           result = await signIn(formData.email, formData.password, 'customer')
//         }

//         if (result?.error) {
//           setError(result.error.message || 'Login failed. Please try again.')
//         } else {
//           // Successful login - redirect based on role
//           switch (selectedRole) {
//             case 'admin':
//               router.push('/admin/dashboard')
//               break
//             case 'agent':
//               router.push('/agent/dashboard')
//               break
           
//           }
//         }
//       } else {
//         // 🔹 SIGNUP FLOW - ALLOW ALL ROLES
//         const result = await signUp(formData.email, formData.password, {
//           ...formData,
//           role: selectedRole as   'agent'| 'admin'
//         })

//         if (result?.error) {
//           setError(result.error.message || 'Registration failed.')
//         } else {
//           setSuccess(`Account created successfully! Please login.`)
//           setIsLogin(true)
//         }
//       }
//     } catch (err: any) {
//       console.error('Auth error:', err)
//       setError(err.message || 'An unexpected error occurred.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Auto-fill demo credentials based on role
//   const fillDemoCredentials = () => {
//     let credentials = {
//       email: '',
//       password: ''
//     }
    
//     switch(selectedRole) {
//       case 'admin':
//         credentials = { email: 'hamza@gmail.com', password: 'hamZa9778' }
//         break
//       case 'agent':
//         credentials = { email: 'agent@ragdol.com', password: 'Agent123!' }
//         break
    
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       email: credentials.email,
//       password: credentials.password
//     }))
//     setError('')
//   }

//   return (
//     <div className="min-h-screen bg-secondary flex flex-col lg:flex-row overflow-hidden">
//       {/* Left Side: Visual/Branding - SAME AS BEFORE */}
//       {/* Right Side: Form */}
//       <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white lg:rounded-l-[4rem] shadow-2xl">
//         <div className="w-full max-w-md">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl font-serif text-secondary mb-2">
//               {isLogin ? 'Member Login' : 'Create Account'}
//             </h2>
//             <p className="text-slate-500">
//               {isLogin ? 'Enter your credentials to access the portal' : 'Join our exclusive network of real estate professionals'}
//             </p>
//           </div>

//           {/* Role Selector */}
//           <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
//             {([ 'agent', 'admin'] as UserRole[]).map((role) => (
//               <button
//                 key={role}
//                 type="button"
//                 onClick={() => handleRoleChange(role)}
//                 className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 capitalize ${selectedRole === role
//                   ? 'bg-white text-secondary shadow-md'
//                   : 'text-slate-400 hover:text-secondary'
//                   }`}
//               >
//                 {role}
//               </button>
//             ))}
//           </div>

         

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {!isLogin && (
//               <div className="relative">
//                 <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   required={!isLogin}
//                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
//                   value={formData.fullName}
//                   onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                 />
//               </div>
//             )}

//             <div className="relative">
//               <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <input
//                 type="email"
//                 placeholder="Email Address"
//                 required
//                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               />
//             </div>

//             <div className="relative">
//               <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Password"
//                 required
//                 className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary"
//               >
//                 {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
//               </button>
//             </div>

//             {!isLogin && (
//               <div className="relative">
//                 <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <input
//                   type="tel"
//                   placeholder="Phone Number (Optional)"
//                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 />
//               </div>
//             )}

//             {error && (
//               <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
//                 <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
//                 {error}
//               </div>
//             )}

//             {success && (
//               <div className="p-4 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100 flex items-center gap-2">
//                 <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
//                 {success}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 shadow-xl shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               ) : (
//                 isLogin ? 'Sign In' : 'Create Account'
//               )}
//             </button>
//           </form>

//           <div className="mt-8 space-y-4">
           

//           </div>

//           <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
//             <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-secondary transition-colors">
//               <ArrowLeftIcon className="h-4 w-4" />
//               Back to Home
//             </Link>
//             <span className="text-xs text-slate-300 uppercase tracking-widest">© 2026 RAGDOL</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// new code
// new
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

type UserRole = 'admin' | 'agent' | 'customer'

export default function EnhancedLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  
  const { signIn, signUp, signInAsAdmin, signInAsAgent, user, profile } = useAuth()

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      console.log('User already logged in:', { role: profile.role })
      redirectBasedOnRole(profile.role)
    }
  }, [user, profile])

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'agent':
        router.push('/agent/dashboard')
        break
      case 'customer':
        router.push('/customer/dashboard')
        break
      default:
        router.push('/')
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        // 🔹 LOGIN FLOW
        let result
        
        if (selectedRole === 'admin') {
          result = await signInAsAdmin(formData.email, formData.password)
        } else if (selectedRole === 'agent') {
          result = await signInAsAgent(formData.email, formData.password)
        } else {
          result = await signIn(formData.email, formData.password, 'customer')
        }

        if (result?.error) {
          setError(result.error.message || 'Login failed. Please try again.')
        } else {
          // Wait a moment for auth state to update
          setTimeout(() => {
            redirectBasedOnRole(selectedRole)
          }, 500)
        }
      } else {
        // 🔹 SIGNUP FLOW
        const result = await signUp(formData.email, formData.password, {
          ...formData,
          role: selectedRole
        })

        if (result?.error) {
          setError(result.error.message || 'Registration failed.')
        } else {
          setSuccess(`Account created successfully! Please login.`)
          setIsLogin(true)
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Visual/Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary/10 to-secondary/10 p-12 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="inline-block p-4 bg-white/90 rounded-3xl shadow-2xl mb-8">
            <h1 className="text-5xl font-serif text-secondary">
              RAG<span className="text-primary italic">DOLL</span>
            </h1>
          </div>
          <h2 className="text-3xl font-serif text-white mb-4">Welcome Back!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Access your personalized dashboard to manage properties, track inquiries, and grow your real estate portfolio.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2">🏠</div>
              <div className="text-sm font-bold">Properties</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-bold">Clients</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-bold">Analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white lg:rounded-l-[4rem] shadow-2xl">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-secondary mb-2">
              {isLogin ? 'Member Login' : 'Create Account'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your credentials to access the portal' : 'Join our exclusive network of real estate professionals'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            {([ 'agent', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 capitalize ${
                  selectedRole === role
                    ? 'bg-white text-secondary shadow-md'
                    : 'text-slate-400 hover:text-secondary'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required={!isLogin}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all duration-300 shadow-xl shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setSuccess('')
                }}
                className="text-sm text-slate-500 hover:text-secondary transition-colors"
              >
               
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-secondary transition-colors">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Home
            </Link>
            <span className="text-xs text-slate-300 uppercase tracking-widest">© 2026 RAGDOLL</span>
          </div>
        </div>
      </div>
    </div>
  )
}