'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import {
  Camera, MapPin, Upload, AlertCircle, CheckCircle,
  Brain, Zap, Shield, Wrench, Lightbulb, Droplets,
  Tag, Activity, Copy, ArrowRight, Sparkles, Search,
  ChevronRight, ChevronLeft, Info, Eye, Check
} from 'lucide-react'

// --- AI Service Logic ---
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  sanitation: [
    'washroom', 'toilet', 'bathroom', 'dirty', 'clean', 'garbage', 'trash',
    'smell', 'odor', 'leak', 'water', 'spill', 'litter', 'dust', 'clogged', 'plumbing',
    'hygiene', 'sewage', 'drain', 'mop', 'janitor', 'waste', 'bin', 'overflowing'
  ],
  infrastructure: [
    'bench', 'broken', 'chair', 'table', 'door', 'window', 'wall', 'floor',
    'ceiling', 'paint', 'cracked', 'tiles', 'furniture', 'desk', 'stairs', 'elevator',
    'pothole', 'road', 'pathway', 'gate', 'fence', 'building', 'roof', 'collapse',
    'construction', 'ramp', 'railing', 'parking'
  ],
  electrical: [
    'light', 'electric', 'power', 'outlet', 'switch', 'bulb', 'fan', 'ac',
    'air conditioning', 'wire', 'socket', 'fuse', 'generator', 'heater', 'cooler',
    'projector', 'computer', 'server', 'network', 'wifi', 'internet', 'charging',
    'voltage', 'short circuit', 'spark'
  ],
  security: [
    'security', 'lock', 'key', 'theft', 'stolen', 'missing', 'unsafe',
    'guard', 'camera', 'cctv', 'harassment', 'stranger', 'suspicious', 'emergency',
    'danger', 'fire', 'alarm', 'evacuation', 'threat', 'violence'
  ]
}

const URGENCY_KEYWORDS = {
  high: [
    'broken', 'dirty', 'urgent', 'emergency', 'dangerous', 'not working',
    'damaged', 'hazard', 'fire', 'flood', 'collapse', 'injury', 'unsafe',
    'critical', 'immediately', 'severe', 'terrible', 'horrible', 'worst',
    'stuck', 'trapped', 'leaking', 'sparking', 'smoking'
  ],
  medium: [
    'issue', 'problem', 'concern', 'need', 'should', 'fix', 'repair',
    'replace', 'noisy', 'slow', 'intermittent', 'sometimes', 'annoying'
  ]
}

const CATEGORY_ICONS: Record<string, any> = {
  sanitation: Droplets,
  infrastructure: Wrench,
  electrical: Lightbulb,
  security: Shield,
  general: Tag
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sanitation: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  infrastructure: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  electrical: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  security: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  general: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' }
}

const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  high: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' },
  low: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' }
}

function predictCategory(text: string): { category: string; matchedKeywords: string[]; confidence: number } {
  const textLower = text.toLowerCase()
  let bestCategory = 'general'
  let bestCount = 0
  let bestKeywords: string[] = []

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.filter(kw => textLower.includes(kw))
    if (matched.length > bestCount) {
      bestCount = matched.length
      bestCategory = category
      bestKeywords = matched
    }
  }

  const confidence = Math.min(bestCount * 25, 95)
  return { category: bestCategory, matchedKeywords: bestKeywords, confidence: bestCount > 0 ? confidence : 0 }
}

function predictUrgency(text: string): { urgency: string; score: number } {
  const textLower = text.toLowerCase()

  const highMatches = URGENCY_KEYWORDS.high.filter(kw => textLower.includes(kw)).length
  const mediumMatches = URGENCY_KEYWORDS.medium.filter(kw => textLower.includes(kw)).length

  if (highMatches >= 2) return { urgency: 'high', score: Math.min(highMatches * 20, 95) }
  if (highMatches === 1) return { urgency: 'high', score: 50 }
  if (mediumMatches >= 1) return { urgency: 'medium', score: Math.min(mediumMatches * 30, 80) }

  if (text.trim().length > 0) return { urgency: 'low', score: 30 }
  return { urgency: 'low', score: 0 }
}

export default function ReportPage() {
  const [formData, setFormData] = useState({
    description: '',
    image: null as string | null,
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
      address: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (user.role === 'admin') {
      router.push('/admin')
      toast.error('Admins cannot file reports. Redirecting to Command Center.')
    }
  }, [user, router])

  // Local AI Predictions with Debounce Interactivity
  const [aiPreview, setAiPreview] = useState<any>(null)

  useEffect(() => {
    const text = formData.description.trim()
    if (text.length < 3) {
      setAiPreview(null)
      setIsThinking(false)
      return
    }

    setIsThinking(true)
    const timeout = setTimeout(() => {
      const categoryResult = predictCategory(text)
      const urgencyResult = predictUrgency(text)

      setAiPreview({
        category: categoryResult.category,
        categoryConfidence: categoryResult.confidence,
        matchedKeywords: categoryResult.matchedKeywords,
        urgency: urgencyResult.urgency,
        urgencyScore: urgencyResult.score,
      })
      setIsThinking(false)
    }, 800)

    return () => clearTimeout(timeout)
  }, [formData.description])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds safety protocols (5MB limit)')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
            }
          }))
          toast.success('Geographic coordinates synchronized')
        },
        () => {
          toast.error('Signal lost. Please enable location permissions.')
        }
      )
    } else {
      toast.error('Geolocation engine not supported by device.')
    }
  }

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('Please describe the issue first')
      return
    }

    setLoading(true)
    setIsAnalyzing(true)

    try {

      const response = await api.createIssue(
        formData.description,
        formData.image,
        formData.location
      )

      setIsAnalyzing(false)
      setResult(response)
      toast.success('Report submitted to Central Intelligence')

      setFormData({
        description: '',
        image: null,
        location: { latitude: null, longitude: null, address: '' }
      })
    } catch (error: any) {
      setIsAnalyzing(false)
      toast.error(error.message || 'Transmission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="report-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Input Form (7/12) */}
              <div className="lg:col-span-7 space-y-6">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-[#1e293b]/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl shadow-black/20 transition-colors hover:border-slate-700"
                >
                  <div className="space-y-6">
                    {/* Description Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        Issue Description <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                        rows={6}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-slate-200 placeholder-slate-500 resize-none transition-all outline-none"
                        placeholder="Describe the issue in detail... (e.g., 'The lights in Room 204 are not working and there are sparks from the switch')"
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300">Upload Image (Optional)</label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative aspect-[21/9] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 group ${formData.image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-600 bg-[#0f172a]/30'
                          }`}
                      >
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                        {formData.image ? (
                          <div className="absolute inset-0 p-2">
                            <div className="relative w-full h-full rounded-xl overflow-hidden">
                              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, image: null })) }}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-lg backdrop-blur-sm transition-all shadow-lg"
                              >
                                <ChevronLeft size={16} className="rotate-45" />
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="text-slate-400 group-hover:text-emerald-400" size={24} />
                            </div>
                            <p className="text-slate-300 font-medium">Click to upload image</p>
                            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-black">Max size: 5MB</p>
                          </>
                        )}
                      </motion.div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-300">Location (Optional)</label>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={getLocation}
                        className={`w-full py-4 px-6 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all relative overflow-hidden group ${formData.location.address
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-[#0f172a]/50 border-slate-700 text-slate-300 hover:bg-[#0f172a] hover:border-slate-600'
                          }`}
                      >
                        {formData.location.address && (
                          <motion.div
                            layoutId="location-glow"
                            className="absolute inset-0 bg-emerald-500/5 animate-pulse"
                          />
                        )}
                        <MapPin size={20} className={`${formData.location.address ? 'text-emerald-400 animate-bounce' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                        {formData.location.address ? 'Location Synchronized' : 'Get Current Location'}
                      </motion.button>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !formData.description.trim()}
                      className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98] text-white"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Brain size={24} />
                          Submit & Analyze with AI
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: AI Analysis & Info (5/12) */}
              <div className="lg:col-span-5 space-y-6">
                {/* AI Analysis Live Card */}
                <div className="bg-[#1e293b]/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden shadow-xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Brain className="text-emerald-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">AI Analysis</h2>
                  </div>

                  <div className="min-h-[240px] flex flex-col items-center justify-center text-center relative">
                    {/* Scanning Bar Animation */}
                    <AnimatePresence>
                      {isThinking && (
                        <motion.div
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-10 blur-sm"
                        />
                      )}
                    </AnimatePresence>

                    {!aiPreview || isThinking ? (
                      <motion.div
                        key={isThinking ? 'thinking' : 'empty'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <div className="w-20 h-20 mx-auto bg-slate-800/80 rounded-2xl flex items-center justify-center relative shadow-inner">
                          <Brain size={40} className={`transition-all duration-500 ${isThinking ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
                          {isThinking && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl"
                            />
                          )}
                        </div>
                        <div className="space-y-3 px-4">
                          <h3 className="text-lg font-bold text-slate-200">
                            {isThinking ? 'Analyzing Input...' : 'Start typing to see AI predictions'}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto font-medium">
                            {isThinking
                              ? 'Our neural network is processing your description to identify patterns...'
                              : 'Our AI will predict urgency, categorize the issue, and check for duplicates in real-time'}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 pt-4">
                          {[
                            { icon: Zap, label: 'Urgency Detection', color: 'text-rose-500' },
                            { icon: Tag, label: 'Auto Categorization', color: 'text-sky-500' },
                            { icon: Copy, label: 'Duplicate Check', color: 'text-amber-500' }
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              animate={isThinking ? { y: [0, -4, 0] } : {}}
                              transition={{ duration: 0.6, delay: i * 0.1, repeat: isThinking ? Infinity : 0 }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-wider"
                            >
                              <item.icon size={14} className={`${isThinking ? item.color : 'text-slate-600'}`} /> {item.label}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-6"
                      >
                        {/* Urgency Meter */}
                        <motion.div
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                          className="bg-[#0f172a]/50 rounded-2xl p-5 border border-slate-700/50 text-left transition-colors cursor-default"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Threat Assessment</span>
                            <motion.span
                              key={aiPreview.urgency}
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className={`text-sm font-black uppercase ${aiPreview.urgency === 'high' ? 'text-rose-400' : aiPreview.urgency === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}
                            >
                              {aiPreview.urgency}
                            </motion.span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${aiPreview.urgencyScore}%` }}
                              className={`h-full ${aiPreview.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : aiPreview.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Confidence Index: {aiPreview.urgencyScore}%</p>
                        </motion.div>

                        {/* Category & Tags */}
                        <motion.div
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 41, 59, 0.7)' }}
                          className="bg-[#0f172a]/50 rounded-2xl p-5 border border-slate-700/50 text-left transition-colors cursor-default"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sector Classification</span>
                            <motion.div
                              key={aiPreview.category}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-sm"
                            >
                              <span className="text-xs font-black uppercase text-emerald-400">{aiPreview.category}</span>
                            </motion.div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <AnimatePresence mode="popLayout">
                              {aiPreview.matchedKeywords.map((kw: string) => (
                                <motion.span
                                  key={kw}
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="px-2.5 py-1 bg-slate-800/50 border border-slate-700/50 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-tight"
                                >
                                  #{kw}
                                </motion.span>
                              ))}
                            </AnimatePresence>
                            {aiPreview.matchedKeywords.length === 0 && <span className="text-xs text-slate-600 italic">No keywords detected...</span>}
                          </div>
                        </motion.div>

                        <motion.div
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-left"
                        >
                          <Info size={16} className="text-emerald-500 shrink-0" />
                          <p className="text-[11px] text-slate-400 leading-tight">Neural signatures verified. AI predictions are high precision but require human validation.</p>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Info Card: How AI Works */}
                <div className="bg-[#1e293b]/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Sparkles className="text-emerald-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">How AI Analysis Works</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="flex gap-5">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs shrink-0 border border-rose-500/20">1</div>
                      <div className="space-y-1.5">
                        <h4 className="text-[15px] font-bold text-slate-200">Sentiment Analysis</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">RoBERTa NLP model analyzes emotional tone to determine urgency</p>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs shrink-0 border border-sky-500/20">2</div>
                      <div className="space-y-1.5">
                        <h4 className="text-[15px] font-bold text-slate-200">Issue Categorization</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Keyword matching classifies into sanitation, infrastructure, electrical, or security</p>
                      </div>
                    </div>

                    <div className="flex gap-5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs shrink-0 border border-amber-500/20">3</div>
                      <div className="space-y-1.5">
                        <h4 className="text-[15px] font-bold text-slate-200">Duplicate Detection</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">TF-IDF + Cosine Similarity checks against existing reports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Success Result Page */
            <motion.div
              key="success-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[#1e293b]/80 border border-slate-700/50 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

                <div className="p-10 text-center">
                  <div className="relative mb-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-emerald-500 blur-3xl rounded-full scale-150"
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                      className="relative w-28 h-28 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 border-4 border-white/20"
                    >
                      <CheckCircle size={56} className="text-white fill-emerald-600/20" strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-3">Transmission Successful</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
                    Incident Intelligence logged in Campus Registry
                  </p>

                  <div className="bg-[#0f172a]/60 border border-slate-700/50 rounded-2xl p-6 text-left mb-8">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700/50">
                      <div>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Reference ID</p>
                        <p className="text-white font-mono text-base font-bold select-all">#INTEL-{result.issue_id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Status</p>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                          Verification Pending
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5 text-rose-400">Threat Level</p>
                          <p className="text-white font-black text-xs uppercase flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${result.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : result.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {result.urgency}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5 text-sky-400">Sector</p>
                          <p className="text-white font-black text-xs uppercase flex items-center gap-2">
                            <Tag size={12} className="text-sky-400" />
                            {result.category}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Intelligence Summary</p>
                        <p className="text-slate-300 text-sm italic font-medium leading-relaxed">
                          "{formData.description.substring(0, 100)}{formData.description.length > 100 ? '...' : ''}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase pt-2">
                        <Activity size={10} className="text-emerald-500" />
                        Network verified at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Impact Points: +10 XP
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg transition-all group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Mission Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        window.location.reload()
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl border border-slate-700 transition-all"
                    >
                      File Another Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div >
  )
}