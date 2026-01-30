'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'
import { useCartStore } from '@/lib/store/cartStore'
import Image from 'next/image'
import CustomerHeader from '@/components/CustomerHeader'
import api from '@/lib/api'
import { getImageUrl } from '@/lib/config'

interface Category {
  id: number
  name: string
  description: string | null
  image: string | null
}

interface Product {
  id: number
  name: string
  description: string | null
  price: string
  wholesale_price: string | null
  unit: string | null
  quantity_per_unit: string | null
  image: string | null
  category_id: number
  is_available: boolean
  total_sold?: number
  agent?: {
    id: number
    name: string
  } | null
}

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, viewMode, setViewMode } = useAuthStore()
  const { addItem, getItemCount } = useCartStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [pendingConfirmOrders, setPendingConfirmOrders] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(true)
  const [renderError, setRenderError] = useState<Error | null>(null)

  // Wait for auth store to hydrate from localStorage
  useEffect(() => {
    // Set hydrated ngay lập tức để trang có thể render
    // Không cần chờ auth store hydrate vì Zustand tự động hydrate
    setIsHydrated(true)
  }, [])

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      router.push('/admin')
      return
    }
    // Agent can view customer home page - tự động chuyển sang customer mode nếu đang ở agent mode
    if (isAuthenticated && user && user.role === 'agent' && viewMode === 'agent') {
      setViewMode('customer')
    }
  }, [isAuthenticated, user, router, viewMode, setViewMode])

  useEffect(() => {
    // Đảm bảo loading được set về false ngay sau khi mount
    // để trang có thể hiển thị ngay, không bị kẹt loading
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    )
    
    let timeoutId: NodeJS.Timeout | null = null
    let mounted = true

    const loadData = async () => {
      try {
        console.log('🔄 [page.tsx] loadData started')
        // Gọi cả hai API, nhưng không block nếu một trong hai lỗi
        const results = await Promise.allSettled([
          fetchCategories(),
          fetchProducts()
        ])
        
        // Log kết quả để debug
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ API call ${index === 0 ? 'categories' : 'products'} failed:`, result.reason)
          } else {
            console.log(`✅ API call ${index === 0 ? 'categories' : 'products'} succeeded`)
          }
        })
      } catch (error) {
        console.error('❌ Error loading data:', error)
      } finally {
        // Đảm bảo loading luôn được set về false, ngay cả khi API lỗi
        console.log('🔄 [page.tsx] loadData finally - setting loading to false')
        if (mounted) {
          setLoading(false)
        }
        // Clear timeout nếu API call hoàn thành trước timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }
    
    // Thêm timeout để tránh kẹt loading vô hạn (chỉ trên local)
    if (isLocal) {
      timeoutId = setTimeout(() => {
        console.warn('⚠️ [LOCAL] Loading timeout (3s) - forcing loading to false')
        if (mounted) {
          setLoading(false)
        }
      }, 3000) // 3 giây timeout cho local
    } else {
      // Trên production, timeout sau 10 giây
      timeoutId = setTimeout(() => {
        console.warn('⚠️ [PROD] Loading timeout (10s) - forcing loading to false')
        if (mounted) {
          setLoading(false)
        }
      }, 10000) // 10 giây timeout cho production
    }
    
    // Gọi loadData ngay khi mount, không phụ thuộc vào isAuthenticated
    loadData().catch((err) => {
      console.error('❌ loadData promise rejected:', err)
      if (mounted) {
        setLoading(false)
      }
    })
    
    // Refresh user data to get latest role
    if (isAuthenticated) {
      authApi.getCurrentUser().catch(console.error)
      fetchPendingConfirmOrders().catch(console.error)
    }

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPendingConfirmOrders = async () => {
    try {
      const response = await api.get('/orders', { params: { status: 'delivered_by_agent' } })
      if (response.data.success) {
        setPendingConfirmOrders(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching pending confirm orders:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      // Sử dụng api từ lib/api để tự động gửi token nếu có
      const response = await api.get('/categories')
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      // Không throw error để không block page load
      if (error.response?.status === 401) {
        // Unauthorized - có thể do token hết hạn, nhưng vẫn cho phép xem trang
        console.warn('⚠️ Unauthorized - token may be expired')
      }
    }
  }

  const fetchProducts = async (categoryId?: number) => {
    try {
      // Chỉ set loading khi fetch với category filter (không set khi initial load)
      if (categoryId !== undefined) {
        setLoading(true)
      }
      const params = categoryId ? { category_id: categoryId } : {}
      // Sử dụng api từ lib/api để tự động gửi token nếu có
      const response = await api.get('/products', { params })
      if (response.data.success) {
        setProducts(response.data.data)
      } else {
        console.warn('⚠️ API returned success=false:', response.data)
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      // Hiển thị lỗi nhưng vẫn cho phép xem trang
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('❌ Network error - API không thể kết nối')
      } else if (error.response?.status === 401) {
        console.warn('⚠️ Unauthorized - token may be expired')
      }
    } finally {
      // Set loading false khi fetch với category filter
      // KHÔNG set khi initial load vì loadData() sẽ set trong finally block
      if (categoryId !== undefined) {
        setLoading(false)
      }
    }
  }

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    fetchProducts(categoryId || undefined)
  }

  const handleAddToCart = (product: Product) => {
    if (!product.is_available) return
    
    // Yêu cầu đăng nhập trước khi thêm vào giỏ hàng
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      wholesale_price: product.wholesale_price,
      unit: product.unit,
      quantity_per_unit: product.quantity_per_unit,
      agent_id: product.agent?.id || null,
    })
  }

  // Don't render until hydrated to avoid flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Error boundary - hiển thị error thay vì crash
  if (renderError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra lỗi!</h2>
          <p className="text-gray-600 mb-4">{renderError.message}</p>
          <button
            onClick={() => {
              setRenderError(null)
              window.location.reload()
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  // Don't show customer home if user is admin (they will be redirected)
  if (isAuthenticated && user && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />

      {/* Notification Banner - Đơn hàng chờ xác nhận */}
      {isAuthenticated && pendingConfirmOrders.length > 0 && showNotification && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-2 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-yellow-900 line-clamp-2">
                    Bạn có {pendingConfirmOrders.length} đơn hàng đã giao đi. Hãy xác nhận đã nhận đơn hàng chưa?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  href="/orders?status=delivered_by_agent"
                  className="px-2 py-1.5 bg-yellow-600 text-white rounded text-xs font-medium whitespace-nowrap"
                  onClick={() => setShowNotification(false)}
                >
                  Xem đơn
                </Link>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="container mx-auto px-2 py-4 md:py-8">
        <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Danh mục sản phẩm</h3>
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-4 scrollbar-hide -mx-2 px-2">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3 py-1.5 md:px-6 md:py-3 rounded-lg whitespace-nowrap text-xs md:text-base font-medium transition-all flex-shrink-0 ${
              selectedCategory === null
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-3 py-1.5 md:px-6 md:py-3 rounded-lg whitespace-nowrap text-xs md:text-base font-medium transition-all flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-2 pb-20 md:pb-16 bg-gray-50/50 md:bg-transparent md:pt-0 pt-2">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900">Sản phẩm</h3>
          {selectedCategory && (
            <button
              onClick={() => handleCategoryClick(null)}
              className="text-primary-600 hover:text-primary-700 text-xs md:text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center py-8 md:py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary-600"></div>
            <p className="mt-3 md:mt-4 text-gray-500 text-sm md:text-base">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 md:py-16 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-sm md:text-lg">Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col h-full"
              >
                <div className="relative w-full aspect-square bg-gray-50 flex-shrink-0 overflow-hidden rounded-t-xl">
                  {getImageUrl(product.image) ? (
                    <img
                      src={getImageUrl(product.image)!}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-xl"
                      style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        console.error('❌ Lỗi load ảnh:', {
                          src: img.src,
                          original: product.image,
                          productName: product.name,
                          productId: product.id
                        })
                      }}
                      onLoad={() => {
                        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
                          console.log('✅ Load ảnh thành công:', {
                            src: getImageUrl(product.image),
                            productName: product.name
                          })
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 rounded-t-xl bg-gray-100">
                      <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold shadow">
                      Hết
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3 flex flex-col flex-grow border-t border-gray-100 bg-white">
                  <h4 className="font-semibold text-xs md:text-sm mb-1 text-gray-900 line-clamp-2 leading-tight">{product.name}</h4>
                  {product.agent && (
                    <p className="text-primary-600 text-[10px] md:text-xs mb-1 font-medium line-clamp-1">
                      Đại lý: {product.agent.name}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-gray-500 text-[10px] md:text-xs mb-2 line-clamp-2 flex-grow leading-snug">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto space-y-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-primary-600 font-bold text-sm md:text-base">
                        {product.wholesale_price
                          ? parseFloat(product.wholesale_price).toLocaleString('vi-VN') + ' đ'
                          : product.price
                          ? parseFloat(product.price).toLocaleString('vi-VN') + ' đ'
                          : 'Liên hệ'}
                      </span>
                      {product.unit && (
                        <span className="text-gray-400 text-[10px] md:text-xs">
                          / {product.quantity_per_unit && parseFloat(product.quantity_per_unit) > 0
                            ? `${parseFloat(product.quantity_per_unit)} ${product.unit}`
                            : product.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-500 text-[10px] md:text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        Đã bán: {Number(product.total_sold) || 0}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.is_available}
                        className={`flex-shrink-0 p-1.5 md:p-2 rounded-lg transition ${
                          product.is_available
                            ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {product.is_available ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-medium">Hết</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
