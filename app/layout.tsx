import './globals.css'
// v1.1.0 - Core Refresh
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const metadata = {
  title: 'CampusFix AI - Smart Campus Issue Reporting',
  description: 'AI-powered campus issue reporting and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} noise-overlay`}>
        {/* Floating background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <AuthProvider>
          <div className="relative z-10">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}