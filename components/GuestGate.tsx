'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'

const GUEST_KEY = 'jaxtina_guest'

interface GuestData {
  name: string
  email: string
  phone: string
}

interface GuestGateProps {
  children: React.ReactNode
  source: 'quiz' | 'tutor'
}

export default function GuestGate({ children, source }: GuestGateProps) {
  const { user, loading: authLoading } = useUser()
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (user) {
      // Logged-in user — skip gate entirely
      setGuest({ 
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', 
        email: user.email || '', 
        phone: '' 
      })
      setIsLoading(false)
    } else {
      // Not logged in — check localStorage for existing guest data
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        try {
          setGuest(JSON.parse(stored))
        } catch {
          localStorage.removeItem(GUEST_KEY)
        }
      }
      setIsLoading(false)
    }
  }, [user, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem(GUEST_KEY, JSON.stringify(form))
        setGuest(form)
      } else {
        alert(data.error || 'Oops! Something went wrong.')
      }
    } catch {
      alert('Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Still checking auth or localStorage
  if (isLoading || authLoading) return null

  // Already registered or logged in — show the actual page
  if (guest) return <>{children}</>

  // Show the gate form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-bold text-white mb-2">
          {source === 'quiz' ? 'Trước khi bắt đầu' : 'Trước khi chat với Tutor'}
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          {source === 'quiz' ? 'Vui lòng nhập thông tin để tham gia Quiz' : 'Vui lòng nhập thông tin để bắt đầu hỏi đáp'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Họ và tên *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-red-500 outline-none transition-all"
          />
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-red-500 outline-none transition-all"
          />
          <input
            type="tel"
            placeholder="Số điện thoại *"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-red-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 ${isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold rounded-lg transition-all`}
          >
            {isSubmitting ? 'Đang xử lý...' : source === 'quiz' ? 'Bắt đầu Quiz →' : 'Bắt đầu Chat →'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Đã có tài khoản? <Link href="/login" className="text-red-500 underline">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  )
}
