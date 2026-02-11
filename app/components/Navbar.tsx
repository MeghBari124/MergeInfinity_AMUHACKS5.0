'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  PlusCircle,
  FileText,
  Trophy,
  LogOut,
  Menu,
  X,
  Shield,
  Sparkles,
  LayoutDashboard,
  AlertTriangle
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    router.push('/auth/login')
  }

  const navItems = [
    { href: user?.role === 'admin' ? '/admin' : '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ...(user?.role !== 'admin' ? [{ href: '/report', icon: AlertTriangle, label: 'Report Issue' }] : []),
    { href: '/my-reports', icon: FileText, label: 'My Reports' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ...(user?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
  ]


  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/70 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-9 h-9 bg-gradient-to-br from-primary-400 via-primary-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 pulse-glow"
            >
              <span className="text-white font-black text-sm">CF</span>
            </motion.div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">CampusFix</span>
              <span className="text-xs font-semibold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded-md border border-primary-500/20">AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.href)
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20 shadow-sm shadow-primary-500/10'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium text-sm leading-none">{user?.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Sparkles size={10} className="text-primary-400" />
                      <p className="text-primary-400 text-xs font-semibold">{user?.points} pts</p>
                    </div>
                  </div>
                  {user?.badges && user.badges.length > 0 && (
                    <div className="flex space-x-1 ml-1">
                      {user.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${badge === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            badge === 'silver' ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                              'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                            }`}
                        >
                          {badge[0].toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 text-sm"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary py-2 px-6">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="border-t border-white/5 pt-3 mt-3">
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user?.name}</p>
                    <p className="text-primary-400 text-xs font-semibold">{user?.points} points</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}