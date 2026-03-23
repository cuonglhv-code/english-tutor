'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

const GUEST_KEY = 'jaxtina_guest'

export default function ExperiencePage() {
  const [guest, setGuest] = useState<{ name: string; email: string; phone: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  useEffect(() => {
    const init = async () => {
      const supabase = createBrowserClient()
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setGuest({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email ?? '',
          phone: ''
        })
        setIsLoading(false)
        return
      }
      // Check localStorage for returning guest
      const stored = localStorage.getItem(GUEST_KEY)
      if (stored) {
        try { setGuest(JSON.parse(stored)) } catch { }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }
    setSubmitting(true)

    // CRITICAL: unlock UI immediately before API call
    localStorage.setItem(GUEST_KEY, JSON.stringify(form))
    setGuest(form)

    // Fire-and-forget API save
    fetch('/api/guest-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(console.error)

    setSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── GATE VIEW ──────────────────────────────────────────────────────────────
  if (!guest) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">J</div>
              <span className="text-white font-bold text-xl">Jaxtina</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Try the Experience</h1>
            <p className="text-gray-400 mt-2 text-sm">
              Practice with our AI Tutor or test yourself with IELTS Vocabulary Quiz — free, no account needed.
            </p>
          </div>

          {/* Gate Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">Nhập thông tin để bắt đầu</h2>
            <p className="text-gray-500 text-sm mb-6">Hoặc <Link href="/login" className="text-red-400 hover:text-red-300 underline">đăng nhập</Link> nếu đã có tài khoản</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500 transition"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500 transition"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Số điện thoại * (VD: 0912 345 678)"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500 transition"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  'Bắt đầu →'
                )}
              </button>
            </form>

            <p className="text-gray-600 text-xs text-center mt-5">
              Thông tin của bạn được bảo mật và không chia sẻ cho bên thứ ba.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── HUB VIEW (after gate passed) ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Welcome header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <p className="text-red-400 text-sm font-medium uppercase tracking-widest mb-2">Xin chào, {guest.name.split(' ').pop()}!</p>
          <h1 className="text-4xl font-bold text-white mb-3">Chọn trải nghiệm của bạn</h1>
          <p className="text-gray-400">Luyện tập cùng AI Tutor, kiểm tra từ vựng, hoặc chinh phục thành ngữ — miễn phí.</p>
        </div>

        {/* Three experience cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200">

          {/* AI Tutor Card */}
          <Link href="/tutor" className="group block h-full">
            <div className="bg-gray-900 border border-gray-700 hover:border-red-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 h-full flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center mb-6 group-hover:bg-red-600/30 transition">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">AI Tutor</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 font-medium">AI</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Hỏi bất kỳ câu hỏi nào về các nội dung học tiếng Anh. AI của chúng tôi sẽ giải thích, sửa lỗi và hướng dẫn bạn tức thì.
                </p>
                <ul className="space-y-2 text-sm text-gray-500 text-left">
                  <li><span className="text-green-400 mr-2">✓</span> Giải đáp thắc mắc về Task 1 & 2</li>
                  <li><span className="text-green-400 mr-2">✓</span> Phân tích lỗi ngữ pháp & từ vựng</li>
                  <li><span className="text-green-400 mr-2">✓</span> Gợi ý cải thiện band score</li>
                </ul>
              </div>

              <div className="mt-8 flex items-center text-red-400 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                Bắt đầu chat
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Quiz Card */}
          <Link href="/quiz" className="group block h-full">
            <div className="bg-gray-900 border border-gray-700 hover:border-orange-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/20 h-full flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-600/30 flex items-center justify-center mb-6 group-hover:bg-orange-600/30 transition">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">Knowledge Quiz</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-600/30 font-medium">IELTS</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Kiểm tra và mở rộng kiến thức tổng quát của bạn theo chủ đề. Xem kết quả ngay và so sánh với bảng xếp hạng.
                </p>
                <ul className="space-y-2 text-sm text-gray-500 text-left">
                  <li><span className="text-green-400 mr-2">✓</span> Kiến thức theo chủ đề</li>
                  <li><span className="text-green-400 mr-2">✓</span> Kết quả ngay lập tức</li>
                  <li><span className="text-green-400 mr-2">✓</span> Thử thách cùng bạn bè</li>
                </ul>
              </div>

              <div className="mt-8 flex items-center text-orange-400 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                Bắt đầu Quiz
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Vocabulary Challenge Card */}
          <a href="/vocabulary-challenge/index.html" target="_self" className="group block h-full">
            <div className="bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 h-full flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-600/30 flex items-center justify-center mb-6 group-hover:bg-purple-600/30 transition">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">Vocabulary Challenge</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-600/30 font-medium">NEW</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Học thành ngữ tiếng Anh qua 4 giai đoạn: Flashcard → Trắc nghiệm → Gõ từ → Ghép câu. Có hệ thống lặp lại thông minh (SRS).
                </p>
                <ul className="space-y-2 text-sm text-gray-500 text-left">
                  <li><span className="text-green-400 mr-2">✓</span> Idioms phổ biến</li>
                  <li><span className="text-green-400 mr-2">✓</span> 4 chế độ luyện tập khác nhau</li>
                  <li><span className="text-green-400 mr-2">✓</span> Ghi nhớ thông minh với SRS</li>
                </ul>
              </div>

              <div className="mt-8 flex items-center text-purple-400 text-sm font-semibold group-hover:gap-3 gap-2 transition-all">
                Bắt đầu luyện tập
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
