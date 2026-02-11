'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.login(email, password)
      login(response.access_token, response.user, rememberMe)
      toast.success('Login successful!')

      if (response.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg px-4 relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Decorative gradient circles */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />

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
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-dark-400"
            >
              Sign in to your CampusFix AI account
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded border border-dark-500 bg-dark-700/50 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-dark-300 group-hover:text-dark-200 transition-colors">Remember me</span>
                </label>
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
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-dark-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-card !p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-primary-500/20 flex items-center justify-center">
                <Sparkles size={12} className="text-primary-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Demo Credentials</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Shield size={12} className="text-purple-400" />
                <span className="text-dark-400">Admin:</span>
                <code className="text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded text-[11px]">admin@campusfix.com / admin123</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap size={12} className="text-cyan-400" />
                <span className="text-dark-400">Student:</span>
                <span className="text-dark-300">Register a new account</span>
              </div>
            </div>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {['AI-Powered', 'Real-time Analysis', 'Gamification'].map((feature, i) => (
              <motion.span
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-xs text-dark-400 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div >
  )
}