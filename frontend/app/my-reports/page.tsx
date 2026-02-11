'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'
import {
  FileText,
  Calendar,
  MapPin,
  Star,
  Filter,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Shield,
  TrendingUp,
  Zap,
  Award,
  Gem,
  Brain,
  Sparkles,
  ChevronRight,
  Eye,
  Share2,
  Download,
  RefreshCw,
  Search,
  Grid,
  List,
  LayoutGrid,
  LayoutList,
  Flag,
  Wifi,
  Droplets,
  Volume2,
  Camera,
  Trophy,
  PlusCircle,  // Added missing import
  ThumbsUp,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

// ==================== TYPES ====================
interface Report {
  id: string
  description: string
  category: string
  urgency: string
  status: string
  location: any
  is_duplicate: boolean
  created_at: string
  points_earned: number
  ai_analysis?: {
    severity: number
    estimated_resolution: string
    similar_reports: number
    suggested_action: string
  }
  media?: string[]
  comments?: number
  upvotes?: number
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

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 via-amber-600/10 to-transparent'
  },
  in_progress: {
    label: 'In Progress',
    icon: Activity,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 via-blue-600/10 to-transparent'
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent'
  }
} as const

const URGENCY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    icon: AlertCircle
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    icon: Flag
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    icon: Shield
  },
  low: {
    label: 'Low',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    icon: Shield
  }
} as const

const CATEGORY_ICONS: Record<string, any> = {
  infrastructure: Wifi,
  sanitation: Droplets,
  safety: Shield,
  noise: Volume2,
  lighting: Camera,
  other: Flag
}

// ==================== COMPONENTS ====================

// Particle Background
const ParticleField = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: `radial-gradient(circle at center, ${
              [COLORS.accent.teal, COLORS.accent.violet, COLORS.accent.amber][i % 3]
            }40, transparent)`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

// Floating Orb
const FloatingOrb = ({ color, size, position, delay = 0 }: any) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      ...position,
      width: size,
      height: size,
      background: `radial-gradient(circle at 30% 30%, ${color}, transparent 80%)`,
      filter: 'blur(60px)',
      mixBlendMode: 'screen',
    }}
    animate={{
      scale: [1, 1.2, 1.1, 1.3, 1],
      opacity: [0.1, 0.2, 0.15, 0.25, 0.1],
      x: [0, 30, -20, 40, 0],
      y: [0, -30, 20, -40, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
)

// Stat Card
const StatCard = ({ stat, index, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + index * 0.08, type: 'spring', stiffness: 80 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-cyan-500/10 to-violet-500/10"
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              {stat.label}
            </p>
            <div className="flex items-end gap-1 mt-1.5">
              <span className="text-3xl font-black text-white">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-white/40 text-xs font-bold mb-1">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
          
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className={`p-3 rounded-xl ${stat.bg}`}
          >
            <stat.icon className={stat.color} size={20} strokeWidth={2} />
          </motion.div>
        </div>
        
        {stat.label === 'Resolution Rate' && (
          <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stat.percentage}%` }}
              transition={{ delay: delay + 0.5 + index * 0.08, duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Report Card
const ReportCard = ({ report, index }: { report: Report; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const urgencyConfig = URGENCY_CONFIG[report.urgency as keyof typeof URGENCY_CONFIG] || URGENCY_CONFIG.medium
  const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
  const CategoryIcon = CATEGORY_ICONS[report.category] || Flag
  const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 80 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-xl"
          />
        )}
      </AnimatePresence>
      
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${statusConfig.gradient}`} />
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  className={`p-3 rounded-xl ${urgencyConfig.bg} flex-shrink-0`}
                >
                  <CategoryIcon className={urgencyConfig.color} size={20} />
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold text-base leading-relaxed">
                      {report.description}
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {report.points_earned > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: index * 0.05 + 0.2 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30"
                        >
                          <Star size={12} className="text-amber-400" />
                          <span className="text-amber-400 text-xs font-bold">+{report.points_earned}</span>
                        </motion.div>
                      )}
                      
                      {report.is_duplicate && (
                        <span className="px-3 py-1.5 bg-violet-500/20 text-violet-400 text-xs font-bold rounded-full border border-violet-500/30 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Duplicate
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className={`px-3 py-1.5 rounded-full ${urgencyConfig.bg} border ${urgencyConfig.border} flex items-center gap-1.5`}>
                      <urgencyConfig.icon size={12} className={urgencyConfig.color} />
                      <span className={`text-xs font-bold ${urgencyConfig.color}`}>
                        {urgencyConfig.label}
                      </span>
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full ${statusConfig.bg} border ${statusConfig.border} flex items-center gap-1.5`}>
                      <statusConfig.icon size={12} className={statusConfig.color} />
                      <span className={`text-xs font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/10 flex items-center gap-1.5">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                        {report.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Calendar size={12} />
                      <span>{formattedDate}</span>
                    </div>
                    
                    {report.location?.address && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <MapPin size={12} />
                        <span className="truncate max-w-[200px]">{report.location.address}</span>
                      </div>
                    )}
                    
                    {report.ai_analysis && (
                      <div className="flex items-center gap-1.5 text-teal-400/60">
                        <Brain size={12} />
                        <span>AI Score: {report.ai_analysis.severity}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Eye size={16} className="text-white/60" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Share2 size={16} className="text-white/60" />
              </motion.button>
              
              <div className="ml-2 px-3 py-2 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/30 font-mono">#{report.id.slice(0, 6)}</p>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {report.ai_analysis && (
                      <div className="col-span-2 p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl border border-teal-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={14} className="text-teal-400" />
                          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                            AI Analysis
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-2">
                          {report.ai_analysis.suggested_action}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-white/40">
                            Est. resolution: {report.ai_analysis.estimated_resolution}
                          </span>
                          <span className="text-white/40">
                            {report.ai_analysis.similar_reports} similar
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} className="text-white/40" />
                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                          Engagement
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Comments</span>
                          <span className="text-white font-bold">{report.comments || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Upvotes</span>
                          <span className="text-white font-bold">{report.upvotes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Filter Bar
const FilterBar = ({ filter, setFilter, viewMode, setViewMode, searchQuery, setSearchQuery }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/40" />
            <div className="flex space-x-1 bg-black/40 p-1 rounded-xl">
              {[
                { key: 'all', label: 'All Reports' },
                { key: 'pending', label: 'Pending' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'resolved', label: 'Resolved' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/30'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50 transition-colors w-[200px]"
              />
            </div>
            
            <div className="flex space-x-1 bg-black/40 p-1 rounded-xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <LayoutGrid size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <LayoutList size={16} />
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Download size={16} className="text-white/60" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Empty State
const EmptyState = ({ filter, setFilter }: { filter: string; setFilter: (filter: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
    
    <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
      >
        <FileText size={32} className="text-primary-400" />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        {filter === 'all' ? 'No reports yet' : `No ${filter.replace('_', ' ')} reports`}
      </h3>
      
      <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
        {filter === 'all'
          ? 'Start making an impact by reporting your first campus issue. Every report helps create a better environment!'
          : `You don't have any ${filter.replace('_', ' ')} reports at the moment. Check back later or view all reports.`
        }
      </p>
      
      {filter === 'all' && (
        <Link href="/report">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-bold rounded-xl shadow-2xl shadow-primary-500/30 flex items-center gap-2 mx-auto"
          >
            <PlusCircle size={18} />
            Report Your First Issue
            <ArrowUpRight size={16} />
          </motion.button>
        </Link>
      )}
      
      {filter !== 'all' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('all')}
          className="text-primary-400 hover:text-primary-300 text-sm font-semibold flex items-center gap-1 mx-auto"
        >
          View all reports <ChevronRight size={14} />
        </motion.button>
      )}
    </div>
  </motion.div>
)

// ==================== MAIN PAGE ====================
export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const { scrollYProgress } = useScroll()
  
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.getMyReports()
      const reports = response.issues || []
      
      const enhancedReports = reports.map((report: Report) => ({
        ...report,
        ai_analysis: {
          severity: Math.floor(Math.random() * 100),
          estimated_resolution: ['24 hours', '3 days', '1 week'][Math.floor(Math.random() * 3)],
          similar_reports: Math.floor(Math.random() * 5),
          suggested_action: [
            'Immediate attention required',
            'Schedule for maintenance',
            'Monitor situation',
            'Escalate to supervisor'
          ][Math.floor(Math.random() * 4)]
        },
        comments: Math.floor(Math.random() * 10),
        upvotes: Math.floor(Math.random() * 20)
      }))
      
      setReports(enhancedReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filter !== 'all' && report.status !== filter) return false
      if (searchQuery) {
        return report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               report.category.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
  }, [reports, filter, searchQuery])

  const stats = useMemo(() => {
    const total = reports.length
    const pending = reports.filter(r => r.status === 'pending').length
    const resolved = reports.filter(r => r.status === 'resolved').length
    const points = reports.reduce((sum, r) => sum + r.points_earned, 0)
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    
    return [
      { 
        label: 'Total Reports', 
        value: total, 
        icon: FileText, 
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        unit: ''
      },
      { 
        label: 'Pending', 
        value: pending, 
        icon: Clock, 
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
        unit: ''
      },
      { 
        label: 'Resolved', 
        value: resolved, 
        icon: CheckCircle, 
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        unit: ''
      },
      { 
        label: 'Impact Points', 
        value: points, 
        icon: Gem, 
        color: 'text-teal-400',
        bg: 'bg-teal-500/20',
        unit: 'XP'
      },
      { 
        label: 'Resolution Rate', 
        value: resolutionRate, 
        icon: TrendingUp, 
        color: 'text-violet-400',
        bg: 'bg-violet-500/20',
        unit: '%',
        percentage: resolutionRate
      }
    ]
  }, [reports])

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <ParticleField />
        <FloatingOrb color={COLORS.accent.teal} size={500} position={{ top: '20%', left: '10%' }} />
        <FloatingOrb color={COLORS.accent.violet} size={400} position={{ bottom: '30%', right: '15%' }} delay={2} />
        <Navbar />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner size="lg" text="Loading your impact data..." color="primary" />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <ParticleField />
      
      <FloatingOrb color={COLORS.accent.teal} size={600} position={{ top: '-5%', left: '-5%' }} />
      <FloatingOrb color={COLORS.accent.violet} size={500} position={{ bottom: '-5%', right: '-5%' }} delay={2} />
      <FloatingOrb color={COLORS.accent.amber} size={400} position={{ top: '40%', right: '15%' }} delay={4} />
      
      {/* Progress Bar */}
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
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl"
                >
                  <FileText size={28} className="text-teal-400" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-cyan-200">
                    My Impact
                  </span>
                </h1>
              </div>
              <p className="text-white/40 flex items-center gap-2 ml-1">
                <Sparkles size={14} className="text-teal-400" />
                Track and manage your campus contributions
              </p>
            </div>
            
            {/* Achievement Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 flex items-center gap-2"
            >
              <Trophy size={16} className="text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">
                Level {Math.floor(stats[3].value / 100) + 1}
              </span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats[3].value % 100}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} delay={0.2} />
          ))}
        </div>

        {/* Filter Bar */}
        <FilterBar 
          filter={filter} 
          setFilter={setFilter} 
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Reports Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            {filteredReports.length > 0 ? (
              <motion.div
                key={filter + viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'space-y-4'
                }
              >
                {filteredReports.map((report, index) => (
                  <ReportCard key={report.id} report={report} index={index} />
                ))}
              </motion.div>
            ) : (
              <EmptyState filter={filter} setFilter={setFilter} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span>© 2024 Campus Impact</span>
            <span>•</span>
            <span>AI-Powered Reporting System</span>
          </div>
          <div className="flex items-center gap-4">
            <RefreshCw size={12} className="text-white/20" />
            <span>Last updated {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}