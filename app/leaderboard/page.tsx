'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { api } from '../utils/api'
import { Trophy, Medal, Award, Crown, Star, Flame, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  badges: string[]
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard()
      setLeaderboard(response.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />
      case 2:
        return <Medal className="text-gray-300" size={24} />
      case 3:
        return <Award className="text-amber-500" size={24} />
      default:
        return <span className="text-dark-400 font-bold text-lg">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/15 via-yellow-500/10 to-amber-500/5 border-yellow-500/30 shadow-lg shadow-yellow-500/5'
      case 2:
        return 'bg-gradient-to-r from-gray-400/15 via-gray-400/10 to-slate-400/5 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-amber-600/15 via-amber-600/10 to-orange-600/5 border-amber-600/30'
      default:
        return 'bg-dark-800/60 border-dark-700/50 hover:border-dark-600/50'
    }
  }

  const getBadgeEmoji = (badge: string) => {
    const config: Record<string, string> = {
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉'
    }
    return config[badge] || '🏅'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading leaderboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 grid-pattern">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl mb-4 shadow-xl shadow-yellow-500/20"
          >
            <Trophy className="text-white" size={28} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Leaderboard</h1>
          <p className="text-dark-400">
            Top contributors making our campus better
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-end justify-center gap-4 px-4">
              {/* Second Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center flex-1 max-w-[180px]"
              >
                <div className="glass-card !p-5 relative overflow-hidden border-gray-400/20 h-36 flex flex-col justify-end">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                  <Medal className="text-gray-300 mx-auto mb-2" size={30} />
                  <p className="text-white font-bold text-sm truncate">{leaderboard[1]?.name}</p>
                  <p className="text-gray-400 text-xs font-semibold mt-1">{leaderboard[1]?.points} pts</p>
                </div>
                <div className="bg-gray-400/10 h-16 rounded-b-xl flex items-center justify-center border border-t-0 border-gray-400/20">
                  <span className="text-gray-400 font-bold text-xl">2</span>
                </div>
              </motion.div>

              {/* First Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center flex-1 max-w-[200px]"
              >
                <div className="glass-card !p-5 relative overflow-hidden border-yellow-500/20 h-44 flex flex-col justify-end shadow-xl shadow-yellow-500/10">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Crown className="text-yellow-400 mx-auto mb-2" size={36} />
                  </motion.div>
                  <p className="text-white font-bold truncate">{leaderboard[0]?.name}</p>
                  <p className="text-yellow-400 text-sm font-bold mt-1">{leaderboard[0]?.points} pts</p>
                  <div className="flex justify-center space-x-1 mt-2">
                    {leaderboard[0]?.badges.map((badge, idx) => (
                      <span key={idx} className="text-lg">{getBadgeEmoji(badge)}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-yellow-500/10 h-24 rounded-b-xl flex items-center justify-center border border-t-0 border-yellow-500/20">
                  <span className="text-yellow-400 font-bold text-2xl">1</span>
                </div>
              </motion.div>

              {/* Third Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center flex-1 max-w-[180px]"
              >
                <div className="glass-card !p-5 relative overflow-hidden border-amber-500/20 h-32 flex flex-col justify-end">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  <Award className="text-amber-500 mx-auto mb-2" size={26} />
                  <p className="text-white font-bold text-sm truncate">{leaderboard[2]?.name}</p>
                  <p className="text-amber-500 text-xs font-semibold mt-1">{leaderboard[2]?.points} pts</p>
                </div>
                <div className="bg-amber-500/10 h-12 rounded-b-xl flex items-center justify-center border border-t-0 border-amber-500/20">
                  <span className="text-amber-500 font-bold text-lg">3</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white">All Contributors</h2>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-2.5">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className={`card ${getRankStyle(entry.rank)} border hover:scale-[1.01] transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                          entry.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-slate-500' :
                            entry.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                              'bg-gradient-to-br from-dark-600 to-dark-700'
                        }`}>
                        {entry.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>

                      <div>
                        <h3 className="text-white font-semibold">
                          {entry.name}
                        </h3>
                        <div className="flex items-center space-x-1.5">
                          <Flame size={12} className="text-primary-400" />
                          <span className="text-primary-400 font-semibold text-sm">
                            {entry.points} points
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {entry.badges.map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="text-lg" title={`${badge.charAt(0).toUpperCase() + badge.slice(1)} Badge`}>
                          {getBadgeEmoji(badge)}
                        </span>
                      ))}
                      {entry.badges.length === 0 && (
                        <span className="text-dark-500 text-xs bg-dark-700/50 px-2 py-1 rounded-lg">No badges</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-14">
              <div className="mx-auto w-14 h-14 bg-dark-700/50 rounded-2xl flex items-center justify-center mb-4">
                <Trophy className="text-dark-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No contributors yet</h3>
              <p className="text-dark-400 mb-6 text-sm">
                Be the first to report issues and earn points!
              </p>
              <a href="/report" className="btn-primary">
                Report an Issue
              </a>
            </div>
          )}
        </motion.div>

        {/* Badge Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <div className="glass-card border-primary-500/10">
            <div className="flex items-center gap-2 mb-5">
              <Star size={18} className="text-primary-400" />
              <h3 className="text-lg font-semibold text-white">How to Earn Points & Badges</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-primary-400 font-semibold mb-3 text-xs uppercase tracking-wider">Points System</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-dark-500" />
                    <span className="text-dark-300">Report an issue: 0 points</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-dark-300">Issue gets resolved: <span className="text-emerald-400 font-semibold">+10 points</span></span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-primary-400 font-semibold mb-3 text-xs uppercase tracking-wider">Badge Requirements</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10">
                    <span className="text-base">🥉</span>
                    <span className="text-dark-300">Bronze: <span className="text-amber-400 font-semibold">50 points</span></span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-400/5 rounded-xl border border-gray-400/10">
                    <span className="text-base">🥈</span>
                    <span className="text-dark-300">Silver: <span className="text-gray-300 font-semibold">100 points</span></span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                    <span className="text-base">🥇</span>
                    <span className="text-dark-300">Gold: <span className="text-yellow-400 font-semibold">200 points</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}