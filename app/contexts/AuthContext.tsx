'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  role: string
  points: number
  badges: string[]
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: User, remember?: boolean) => void
  logout: () => void
  loading: boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    const userData = Cookies.get('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        Cookies.remove('token')
        Cookies.remove('user')
      }
    }

    setLoading(false)
  }, [])

  const login = (token: string, userData: User, remember: boolean = true) => {
    const cookieOptions = remember ? { expires: 7 } : {}
    Cookies.set('token', token, cookieOptions)
    Cookies.set('user', JSON.stringify(userData), cookieOptions)
    setUser(userData)
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('user')
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 })
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}