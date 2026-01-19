'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'

export default function AgentHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, viewMode, setViewMode } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    await authApi.logout()
    router.push('/')
  }

  const handleSwitchToCustomer = () => {
    setViewMode('customer')
    router.push('/')
  }

  if (!isHydrated || !isAuthenticated || !user || user.role !== 'agent') {
    return null
  }

  // Nếu đang ở chế độ customer view, không hiển thị agent header
  if (viewMode === 'customer') {
    return null
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Bỏ logo và text - để trống hoặc có thể thêm icon nhỏ */}
          <div className="flex-1"></div>
          
          <nav className="flex gap-4 items-center">
            {/* Desktop View - Hiển thị đầy đủ */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/agent"
                className={`text-sm font-medium transition ${
                  pathname === '/agent'
                    ? 'text-primary-600 font-bold'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/agent/orders"
                className={`text-sm font-medium transition ${
                  pathname === '/agent/orders'
                    ? 'text-primary-600 font-bold'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Đơn hàng
              </Link>
              <Link
                href="/agent/products"
                className={`text-sm font-medium transition ${
                  pathname === '/agent/products'
                    ? 'text-primary-600 font-bold'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Sản phẩm
              </Link>
              <Link
                href="/agent/debts"
                className={`text-sm font-medium transition ${
                  pathname === '/agent/debts'
                    ? 'text-primary-600 font-bold'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Công nợ
              </Link>
              <button
                onClick={handleSwitchToCustomer}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Chuyển sang Khách hàng
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs text-gray-500">(Đại lý)</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-primary-600 text-sm font-medium"
              >
                Đăng xuất
              </button>
            </div>

            {/* Mobile View - Dropdown menu */}
            <div className="md:hidden flex items-center gap-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600"
              >
                <span>{user.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/agent"
                    className={`block px-4 py-2 text-sm ${
                      pathname === '/agent'
                        ? 'text-primary-600 font-bold bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/agent/orders"
                    className={`block px-4 py-2 text-sm ${
                      pathname === '/agent/orders'
                        ? 'text-primary-600 font-bold bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <Link
                    href="/agent/products"
                    className={`block px-4 py-2 text-sm ${
                      pathname === '/agent/products'
                        ? 'text-primary-600 font-bold bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Sản phẩm
                  </Link>
                  <Link
                    href="/agent/debts"
                    className={`block px-4 py-2 text-sm ${
                      pathname === '/agent/debts'
                        ? 'text-primary-600 font-bold bg-primary-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Công nợ
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      handleSwitchToCustomer()
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Chuyển sang Khách hàng
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

