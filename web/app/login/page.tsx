'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, LoginData } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<LoginData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for auth store to hydrate
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Redirect if already authenticated (only after hydration)
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/')
    }
  }, [isHydrated, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof LoginData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setErrorMessage('')
  }

  const validate = (): boolean => {
    const newErrors: Partial<LoginData> = {}

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login(formData)
      
      if (response.success) {
        // Redirect based on user role
        const user = response.data.user
        if (user.role === 'admin') {
          router.push('/admin')
        } else if (user.role === 'agent') {
          router.push('/agent')
        } else {
          router.push('/')
        }
      } else {
        setErrorMessage(response.message || 'Đăng nhập thất bại')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setErrorMessage('Không thể kết nối đến server. Vui lòng kiểm tra API đang chạy tại http://localhost:8000')
        setIsLoading(false)
        return
      }
      
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Đã xảy ra lỗi. Vui lòng thử lại.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until hydrated to avoid flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-4xl font-bold text-primary-600">🍞 Banhmi</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              đăng ký tài khoản mới
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {errorMessage}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Mật khẩu"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Tài khoản mẫu:
            </p>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>Admin: admin@banhmi.com / admin123</p>
              <p>Đại lý: agent1@banhmi.com / agent123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

