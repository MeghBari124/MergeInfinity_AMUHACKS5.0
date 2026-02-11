'use client'

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'
import {
  PlusCircle,
  FileText,
  Trophy,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
  Flame,
  Zap,
  Shield,
  Award,
  MapPin,
  Users,
  Star,
  Globe,
  Layers,
  Target,
  BarChart3,
  Bell,
  Settings,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  Crown,
  Rocket,
  Gem,
  Brain,
  Orbit,
  Radar,
  Waves,
  Wind,
  Leaf,
  Compass,
  Mountain,
  Coffee,
  Heart,
  Home,
  Cloud,
  Droplets,
  Sunrise,
  Sunset
} from 'lucide-react'
import Link from 'next/link'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RadarComponent
} from 'recharts'

// Types
interface DashboardStats {
  totalReports: number
  pendingReports: number
  resolvedReports: number
  pointsEarned: number
}

// ==================== CONSTANTS ====================
const COLORS = {
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e'
  },
  accent: {
    teal: '#14b8a6',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',
    emerald: '#10b981',
    indigo: '#6366f1',
    fuchsia: '#d946ef'
  }
} as const

const QUICK_ACTIONS = [
  {
    title: 'Report New Issue',
    description: 'AI-powered instant analysis',
    icon: PlusCircle,
    href: '/report',
    gradient: 'from-teal-500 via-cyan-500 to-emerald-500',
    glow: 'teal'
  },
  {
    title: 'Track Reports',
    description: 'Real-time status updates',
    icon: Activity,
    href: '/my-reports',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    glow: 'violet'
  },
  {
    title: 'Leaderboard',
    description: 'Compete & earn rewards',
    icon: Trophy,
    href: '/leaderboard',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    glow: 'amber'
  },
  {
    title: 'Analytics',
    description: 'Deep insights & trends',
    icon: TrendingUp,
    href: '/analytics',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'emerald'
  }
] as const

// ==================== UTILITIES ====================
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// ==================== COMPONENTS ====================

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl"
      >
        <p className="text-white font-bold text-sm mb-2">{label || payload[0].name}</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].color || payload[0].fill }} 
          />
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">
            {payload[0].value} Reports
          </p>
        </div>
      </motion.div>
    )
  }
  return null
}

// Particle Field Component - Optimized
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    
    const initParticles = () => {
      particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        color: [COLORS.accent.teal, COLORS.accent.violet, COLORS.accent.amber][Math.floor(Math.random() * 3)]
      }))
    }
    
    const drawParticle = (p: typeof particles[0]) => {
      if (!ctx) return
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
      gradient.addColorStop(0, p.color + '80')
      gradient.addColorStop(1, p.color + '00')
      
      ctx.fillStyle = gradient
      ctx.shadowColor = p.color
      ctx.shadowBlur = p.size * 5
      ctx.fill()
    }
    
    const animate = () => {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.shadowBlur = 0
      
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        drawParticle(p)
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    window.addEventListener('resize', resize)
    resize()
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// Floating Orb Component
const FloatingOrb = ({ color, size, position, delay = 0 }: any) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      ...position,
      width: size,
      height: size,
      background: `radial-gradient(circle at 30% 30%, ${color}, transparent 80%)`,
      filter: 'blur(60px)',
      mixBlendMode: 'screen'
    }}
    animate={{
      scale: [1, 1.2, 1.1, 1.3, 1],
      opacity: [0.2, 0.4, 0.3, 0.5, 0.2],
      x: [0, 30, -20, 40, 0],
      y: [0, -30, 20, -40, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
)

// Stat Card Component - Optimized
const StatCard = ({ stat, index, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + index * 0.1, type: 'spring', stiffness: 80 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl h-full group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-violet-500/10"
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">
              {stat.title}
            </p>
            <div className="flex items-end gap-1 mt-2">
              <span className="text-4xl font-black text-white">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-white/40 text-sm font-bold mb-1">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
          
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 10 } : { scale: 1, rotate: 0 }}
            className="p-4 rounded-2xl bg-white/10"
          >
            <stat.icon size={24} className={stat.color} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Quick Action Card
const QuickActionCard = ({ action, index }: any) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.08 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={action.href}>
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${action.gradient} p-[1px] group`}>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-white blur-2xl opacity-30"
              />
            )}
          </AnimatePresence>
          
          <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <action.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{action.title}</h3>
                  <p className="text-white/40 text-sm">{action.description}</p>
                </div>
              </div>
              <motion.div
                animate={isHovered ? { x: 5 } : { x: 0 }}
                className="p-2 bg-white/10 rounded-lg"
              >
                <ArrowRight size={18} className="text-white/60" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Activity Item Component
const ActivityItem = ({ report, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-3 py-3 px-4 hover:bg-white/5 rounded-xl transition-all"
  >
    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
      <FileText size={14} className="text-teal-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-medium truncate">
        {report.description}
      </p>
      <p className="text-white/40 text-xs">
        {formatDate(new Date(report.created_at))}
      </p>
    </div>
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0
      ${report.urgency === 'critical' ? 'bg-rose-500/20 text-rose-400' :
        report.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' :
        'bg-amber-500/20 text-amber-400'}`}
    >
      {report.urgency}
    </span>
  </motion.div>
)

// ==================== MAIN DASHBOARD ====================
export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    pointsEarned: 0
  })
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [allReports, setAllReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')
  const { scrollYProgress } = useScroll()
  
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const reportsResponse = await api.getMyReports()
      const reports = reportsResponse.issues || []

      setAllReports(reports)
      setRecentReports(reports.slice(0, 5))
      setStats({
        totalReports: reports.length,
        pendingReports: reports.filter((r: any) => r.status === 'pending').length,
        resolvedReports: reports.filter((r: any) => r.status === 'resolved').length,
        pointsEarned: user?.points || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendData = useMemo(() => {
    const dates: Record<string, number> = {}
    const now = new Date()
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dates[d.toLocaleDateString()] = 0
    }

    allReports.forEach((r: any) => {
      const d = new Date(r.created_at).toLocaleDateString()
      if (dates.hasOwnProperty(d)) {
        dates[d]++
      }
    })

    return Object.entries(dates).map(([date, count]) => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    }))
  }, [allReports, timeRange])

  const getCategoryData = useMemo(() => {
    const categories: Record<string, number> = {}
    allReports.forEach((r: any) => {
      categories[r.category] = (categories[r.category] || 0) + 1
    })

    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  }, [allReports])

  const statCards = [
    {
      title: 'TOTAL REPORTS',
      value: stats.totalReports,
      icon: FileText,
      color: 'text-blue-400',
      unit: ''
    },
    {
      title: 'PENDING',
      value: stats.pendingReports,
      icon: Clock,
      color: 'text-amber-400',
      unit: ''
    },
    {
      title: 'RESOLVED',
      value: stats.resolvedReports,
      icon: CheckCircle,
      color: 'text-emerald-400',
      unit: ''
    },
    {
      title: 'IMPACT POINTS',
      value: stats.pointsEarned,
      icon: Flame,
      color: 'text-teal-400',
      unit: 'XP'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <ParticleField />
        <Navbar />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner size="lg" text="Loading dashboard..." color="primary" />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <ParticleField />
      
      <FloatingOrb color={COLORS.accent.teal} size={600} position={{ top: '-10%', left: '-5%' }} delay={0} />
      <FloatingOrb color={COLORS.accent.violet} size={500} position={{ bottom: '-10%', right: '-5%' }} delay={2} />
      <FloatingOrb color={COLORS.accent.amber} size={400} position={{ top: '50%', right: '10%' }} delay={4} />
      
      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500 z-50"
        style={{ scaleX, transformOrigin: '0%' }}
      />
      
      <Navbar />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Welcome back, {user?.name}
                </h1>
                <motion.span
                  animate={{ rotate: [0, 20, -10, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  👋
                </motion.span>
              </div>
              <p className="text-white/40 flex items-center gap-2">
                <Brain size={16} className="text-teal-400" />
                AI-Powered Campus Impact Dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Gem size={18} className="text-teal-400" />
                  <span className="text-white font-bold">{stats.pointsEarned} XP</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} index={index} delay={0.2} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <TrendingUp size={20} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Activity Trend</h3>
                    <p className="text-xs text-white/40">Last {timeRange}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {['week', 'month', 'quarter'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        timeRange === range
                          ? 'bg-teal-500 text-white'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getTrendData}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fill="url(#trendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Layers size={20} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Categories</h3>
                  <p className="text-xs text-white/40">Distribution</p>
                </div>
              </div>
              
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCategoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={Object.values(COLORS.accent)[index % Object.values(COLORS.accent).length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {getCategoryData.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: Object.values(COLORS.accent)[i % Object.values(COLORS.accent).length] }}
                      />
                      <span className="text-white/60">{item.name}</span>
                    </div>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={18} className="text-teal-400" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action, index) => (
                <QuickActionCard key={action.title} action={action} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Recent Activity
              </h2>
              
              {recentReports.length > 0 && (
                <Link href="/my-reports" className="text-sm text-teal-400 hover:text-teal-300">
                  View All
                </Link>
              )}
            </div>
            
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {recentReports.length > 0 ? (
                recentReports.map((report, index) => (
                  <ActivityItem key={report.id} report={report} index={index} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="text-white/40" size={24} />
                  </div>
                  <p className="text-white/60 text-sm">No reports yet</p>
                  <Link href="/report">
                    <button className="mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold">
                      Create First Report
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex items-center justify-between">
          <span>© 2024 Campus Impact • AI-Powered</span>
          <div className="flex items-center gap-2">
            <Heart size={12} className="text-rose-400/60" />
            <span>Making campuses better together</span>
          </div>
        </div>
      </div>
    </div>
  )
}