'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

const STORAGE_KEY = 'jaxtina_guest'

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
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    if (authLoading) return

    if (user) {
      // Logged-in user — skip gate entirely
      setGuestData({ 
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', 
        email: user.email || '', 
        phone: '' 
      })
      setIsLoading(false)
    } else {
      // Not logged in — check localStorage for existing guest data
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setGuestData(JSON.parse(stored))
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsLoading(false)
    }
  }, [user, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/guest/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
        return
      }

      // Save to localStorage so we don't ask again
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      setGuestData(form)
    } catch {
      setError('Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Still checking auth or localStorage
  if (isLoading || authLoading) return null

  // Already registered or logged in — show the actual page
  if (guestData) return <>{children}</>

  // Show the gate form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">
            {source === 'quiz' ? '🧠✨' : '💬✨'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {source === 'quiz' ? 'Tham gia Jaxtina Quiz' : 'Chat với Jaxtina Tutor'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Miễn phí — không cần tạo tài khoản.<br />
            Chỉ cần điền thông tin để bắt đầu!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ✏️ Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              📧 Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              📱 Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Ví dụ: 0901234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Privacy note */}
          <p className="text-xs text-gray-400 text-center">
            Thông tin của bạn được bảo mật và chỉ dùng để cải thiện trải nghiệm học tập.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-white transition ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 shadow-md hover:shadow-lg'
            }`}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : source === 'quiz'
              ? '🚀 Bắt đầu chơi Quiz!'
              : '💬 Bắt đầu học với Tutor!'}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-purple-600 underline hover:text-purple-800">
            Đăng nhập tại đây
          </a>
        </p>
      </div>
    </div>
  )
}
