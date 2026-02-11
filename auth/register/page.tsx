'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await api.register(formData.email, formData.password, formData.name)
      login(response.access_token, response.user)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg px-4 relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Decorative gradient circles */}
      <div className="absolute top-1/3 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-400 via-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30 pulse-glow"
            >
              <span className="text-white font-black text-2xl">CF</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create account</h2>
            <p className="mt-2 text-dark-400">Join CampusFix AI and start reporting issues</p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-11 pr-11"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-dark-400 group-focus-within:text-primary-400 transition-colors" size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-dark-400 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.form>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {[
              { icon: Sparkles, text: 'AI-Powered Analysis' },
              { icon: Sparkles, text: 'Earn Points & Badges' },
            ].map((feature, i) => (
              <motion.span
                key={feature.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-xs text-dark-400 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm flex items-center gap-1.5"
              >
                <feature.icon size={10} className="text-primary-400" />
                {feature.text}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}