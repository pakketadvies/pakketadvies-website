'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lightning, Eye, EyeSlash, Envelope, Lock } from '@phosphor-icons/react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError || profile?.role !== 'admin') {
          await supabase.auth.signOut()
          throw new Error('Je hebt geen toegang tot het admin panel')
        }

        // Success - middleware will redirect to /admin
        router.push('/admin')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis bij het inloggen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal-600 text-white mb-4">
            <Lightning size={32} weight="bold" />
          </div>
          <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">
            PakketAdvies Admin
          </h1>
          <p className="text-sm text-gray-600">
            Log in om het admin panel te betreden
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">
              E-mailadres
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Envelope size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@pakketadvies.nl"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">
              Wachtwoord
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-teal-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Inloggen...
              </>
            ) : (
              'Inloggen'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          PakketAdvies © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

