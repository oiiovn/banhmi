'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'
import { agentApi, Order, AgentStats, Product } from '@/lib/api/agent'
import AgentHeader from '@/components/AgentHeader'
import Modal from '@/components/Modal'
import { Toast, useToast } from '@/components/Toast'
import Image from 'next/image'
import { getImageUrl } from '@/lib/config'

const ORDER_STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'preparing', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-orange-100 text-orange-800', // Giữ cho tương thích với dữ liệu cũ
  delivered_by_agent: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang giao',
  ready: 'Đang giao', // "ready" hiển thị là "Đang giao"
  delivered_by_agent: 'Chờ khách xác nhận',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed', // Cho phép chuyển từ pending → confirmed
  confirmed: 'preparing',
  preparing: 'delivered_by_agent',
  ready: 'delivered_by_agent', // Cho tương thích với dữ liệu cũ
}

export default function AgentOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, viewMode, setViewMode } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const loadingRef = useRef(false)
  const mountedRef = useRef(true)
  const [modal, setModal] = useState<{
    isOpen: boolean
    type: 'alert' | 'confirm'
    title?: string
    message: string
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    type: 'alert',
    message: '',
  })
  const toast = useToast()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    if (!isAuthenticated || !user || user.role !== 'agent') {
      router.push('/login')
      return
    }
    
    // Tự động chuyển sang agent mode khi vào trang agent
    if (viewMode !== 'agent') {
      setViewMode('agent')
    }
  }, [isHydrated, isAuthenticated, user, router, viewMode, setViewMode])

  const fetchData = async () => {
    if (!mountedRef.current) return
    
    try {
      const [ordersRes, pendingRes, statsRes] = await Promise.all([
        agentApi.getOrders(selectedStatus || undefined).catch((err) => {
          console.error('❌ Error fetching orders:', err)
          return { success: false, data: null }
        }),
        agentApi.getPendingOrders().catch((err) => {
          console.error('❌ Error fetching pending orders:', err)
          return { success: false, data: null }
        }),
        agentApi.getDashboard().catch((err) => {
          console.error('❌ Error fetching dashboard:', err)
          return { success: false, data: null }
        }),
      ])

      if (!mountedRef.current) return

      if (ordersRes && ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data)
      } else {
        console.warn('⚠️ Orders data not available or failed')
      }
      
      if (pendingRes && pendingRes.success && pendingRes.data) {
        setPendingOrders(pendingRes.data)
      } else {
        console.warn('⚠️ Pending orders data not available or failed')
      }
      
      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      } else {
        console.warn('⚠️ Stats data not available or failed')
      }
    } catch (error) {
      console.error('❌ Error in fetchData:', error)
    }
    // KHÔNG set loading false ở đây - để useEffect finally block xử lý
  }

  useEffect(() => {
    mountedRef.current = true
    
    if (!isHydrated || !isAuthenticated || !user || user.role !== 'agent') {
      setLoading(false)
      loadingRef.current = false
      return
    }

    authApi.getCurrentUser().catch(console.error)
    
    let timeoutId: NodeJS.Timeout | null = null
    
    const loadData = async () => {
      if (!mountedRef.current) return
      
      loadingRef.current = true
      setLoading(true)
      
      try {
        await fetchData()
      } catch (error) {
        console.error('Error in loadData:', error)
      } finally {
        if (mountedRef.current) {
          loadingRef.current = false
          setLoading(false)
        }
      }
    }
    
    // Timeout để tránh kẹt vô hạn
    timeoutId = setTimeout(() => {
      if (mountedRef.current && loadingRef.current) {
        console.warn('⚠️ Loading timeout - forcing loading to false')
        loadingRef.current = false
        setLoading(false)
      }
    }, 10000) // 10 giây timeout
    
    loadData()
    
    return () => {
      mountedRef.current = false
      loadingRef.current = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated, user?.id, selectedStatus])

  const handleAcceptOrder = async (orderId: number) => {
    // Mở modal chỉnh sửa thay vì nhận đơn ngay
    try {
      const response = await agentApi.getPendingOrder(orderId)
      if (response.success) {
        setEditingOrder(response.data)
        // Load available products for selection
        const productsRes = await agentApi.getProducts()
        if (productsRes.success) {
          setAvailableProducts(productsRes.data)
        }
      }
    } catch (error: any) {
      toast.error('Không thể tải chi tiết đơn hàng: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEditOrderFromDetail = async (order: Order) => {
    // Đóng modal chi tiết và mở modal chỉnh sửa
    setSelectedOrder(null)
    try {
      // Chỉ có thể sửa các đơn hàng pending (chưa được nhận)
      const response = await agentApi.getPendingOrder(order.id)
      if (response.success) {
        setEditingOrder(response.data)
        // Load available products for selection
        const productsRes = await agentApi.getProducts()
        if (productsRes.success) {
          setAvailableProducts(productsRes.data)
        }
      }
    } catch (error: any) {
      toast.error('Chỉ có thể chỉnh sửa đơn hàng chưa được nhận. ' + (error.response?.data?.message || error.message || ''))
    }
  }

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return

    try {
      // Separate existing items (with real IDs) and new items (with temporary negative IDs)
      const existingItems = editingOrder.items.filter((item) => item.id && item.id > 0)
      const newItems = editingOrder.items.filter((item) => !item.id || item.id < 0)

      const items = [
        // Existing items with item_id
        ...existingItems.map((item) => ({
          item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price || '0'), // Gửi giá để có thể sửa
        })),
        // New items without item_id
        ...newItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price || '0'), // Gửi giá để có thể sửa
        })),
      ]

      const discount = parseFloat(editingOrder.discount || '0')
      const notes = editingOrder.notes || ''

      const response = await agentApi.updateOrderBeforeAccept(editingOrder.id, {
        items,
        discount,
        notes,
      })

      if (response.success) {
        setEditingOrder(response.data)
        toast.success('Đã cập nhật đơn hàng!')
        // Reload pending orders to reflect changes
        const pendingRes = await agentApi.getPendingOrders()
        if (pendingRes.success) {
          setPendingOrders(pendingRes.data)
        }
      }
    } catch (error: any) {
      toast.error('Không thể cập nhật đơn hàng: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleConfirmAcceptOrder = async () => {
    if (!editingOrder) return

    try {
      const notes = editingOrder.notes || ''
      const response = await agentApi.acceptOrder(editingOrder.id, notes)
      if (response.success) {
        toast.success('Đã nhận đơn hàng thành công!')
        setEditingOrder(null)
        fetchData()
      }
    } catch (error: any) {
      toast.error('Không thể nhận đơn hàng: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await agentApi.updateOrderStatus(orderId, newStatus)
      if (response.success) {
        toast.success(`Đã cập nhật: ${STATUS_LABELS[newStatus]}`)
        fetchData()
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(response.data)
        }
      }
    } catch (error: any) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }
  
  // Hàm hủy đơn với xác nhận modal (vì đây là hành động quan trọng)
  const handleCancelOrder = (orderId: number, closeDetailModal?: boolean) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận hủy đơn',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      onConfirm: async () => {
        try {
          const response = await agentApi.updateOrderStatus(orderId, 'cancelled')
          if (response.success) {
            toast.success('Đã hủy đơn hàng')
            fetchData()
            if (closeDetailModal) {
              setSelectedOrder(null)
            }
          }
        } catch (error: any) {
          toast.error('Lỗi: ' + (error.response?.data?.message || error.message))
        }
      },
    })
  }

  const formatPrice = (price: string | number) => {
    return parseFloat(price.toString()).toLocaleString('vi-VN') + ' đ'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusLabel = (status: string, order?: Order) => {
    if (status === 'delivered_by_agent' && order?.user?.name) {
      return `Chờ ${order.user.name} xác nhận`
    }
    if (status === 'confirmed' && order) {
      // Ưu tiên agent name, nếu không có thì dùng acceptedBy name
      const agentName = order.agent?.name || order.acceptedBy?.name
      if (agentName) {
        return `${agentName} đã xác nhận`
      }
    }
    return STATUS_LABELS[status] || status
  }

  const formatQuantityWithUnit = (item: any) => {
    const product = item.product
    const quantity = item.quantity
    
    if (product.quantity_per_unit && product.unit) {
      const qtyPerUnit = parseFloat(product.quantity_per_unit)
      const totalQty = qtyPerUnit * quantity
      // Loại bỏ .00 nếu có
      const formattedQtyPerUnit = qtyPerUnit % 1 === 0 ? qtyPerUnit.toString() : qtyPerUnit.toFixed(2).replace(/\.?0+$/, '')
      const formattedTotal = totalQty % 1 === 0 ? totalQty.toString() : totalQty.toFixed(2).replace(/\.?0+$/, '')
      return `${product.name}: ${formattedQtyPerUnit} ${product.unit} × ${quantity} = ${formattedTotal} ${product.unit}`
    }
    return `${product.name} x ${quantity}`
  }

  const calculateItemTotal = (item: any) => {
    const price = parseFloat(item.price)
    const quantity = item.quantity
    
    // Giá là giá cho 1 quantity_per_unit (nếu có) hoặc 1 đơn vị (nếu không có)
    // Ví dụ: 35.000 đ/100 Cái, quantity = 2 → 35.000 × 2 = 70.000 đ
    return price * quantity
  }

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

  // Hiển thị loading khi đang kiểm tra authentication thay vì return null
  if (!isAuthenticated || !user || user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AgentHeader />

      <div className="container mx-auto px-4 py-4 pb-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        </div>

        {/* Statistics Pills - Horizontal Scrollable */}
        {stats && (
          <div className="mb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2 min-w-max">
              <button
                onClick={() => setSelectedStatus('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === ''
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tất cả <span className="ml-1 font-bold">{stats.total_orders + pendingOrders.length}</span>
              </button>
              <button
                onClick={() => setSelectedStatus('new')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === 'new'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Đơn mới <span className="ml-1 font-bold">{pendingOrders.length}</span>
              </button>
              <button
                onClick={() => setSelectedStatus('confirmed')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === 'confirmed'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Đã xác nhận <span className="ml-1 font-bold">{stats.confirmed_orders}</span>
              </button>
              <button
                onClick={() => setSelectedStatus('preparing')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === 'preparing'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Đang giao <span className="ml-1 font-bold">{stats.preparing_orders}</span>
              </button>
              <button
                onClick={() => setSelectedStatus('delivered')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === 'delivered'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Đã giao <span className="ml-1 font-bold">{stats.delivered_orders}</span>
              </button>
            </div>
          </div>
        )}

        {/* Pending Orders (chưa có agent) */}
        {pendingOrders.length > 0 && (selectedStatus === '' || selectedStatus === 'new') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <h2 className="text-sm font-bold text-yellow-900 mb-2">
              Đơn hàng chờ nhận ({pendingOrders.length})
            </h2>
            <div className="space-y-2">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">Đơn #{order.id}</p>
                    <p className="text-xs text-gray-600 truncate">{order.user.name}</p>
                    <p className="text-xs font-bold text-primary-600 mt-1">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition text-xs font-medium whitespace-nowrap"
                  >
                    Nhận đơn
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders List */}
        {selectedStatus === 'new' ? (
          // Hiển thị pending orders khi chọn "Đơn mới"
          pendingOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="w-24 h-24 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Không có đơn hàng mới</h2>
              <p className="text-gray-600">Hiện tại không có đơn hàng nào chờ nhận</p>
            </div>
          ) : null
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h2>
            <p className="text-gray-600">
              {selectedStatus
                ? `Không có đơn hàng với trạng thái "${ORDER_STATUSES.find((s) => s.value === selectedStatus)?.label}"`
                : 'Bạn chưa có đơn hàng nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Header */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">Đơn #{order.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(order.status, order)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Customer Info & Total */}
                  <div className="mb-3 pb-3 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{order.user.name}</p>
                      {order.user.phone || order.phone ? (
                        <p className="text-xs text-gray-600">{order.user.phone || order.phone}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Tổng tiền</p>
                      <p className="text-base font-bold text-primary-600">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-medium transition"
                    >
                      Chi tiết
                    </button>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, NEXT_STATUS[order.status]!)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          order.status === 'pending'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : order.status === 'confirmed'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {order.status === 'pending' && '✓ Xác nhận đơn'}
                        {order.status === 'confirmed' && '🚚 Bắt đầu giao'}
                        {(order.status === 'preparing' || order.status === 'ready') && '✓ Xác nhận đã giao'}
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-medium transition"
                      >
                        ✕ Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Order Modal (Before Accept) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setEditingOrder(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa đơn hàng #{editingOrder.id} - Trước khi nhận
                  </h3>
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Tên:</span> {editingOrder.user.name}</p>
                    <p><span className="font-medium">SĐT:</span> {editingOrder.user.phone || editingOrder.phone}</p>
                    <p className="col-span-2"><span className="font-medium">Địa chỉ:</span> {editingOrder.delivery_address}</p>
                    {editingOrder.notes && (
                      <p className="col-span-2"><span className="font-medium">Ghi chú:</span> {editingOrder.notes}</p>
                    )}
                  </div>
                </div>

                {/* Order Items - Editable */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">Danh sách sản phẩm</h4>
                    <button
                      onClick={() => {
                        if (!editingOrder || availableProducts.length === 0) return
                        const firstProduct = availableProducts[0]
                        const newItems = [
                          ...editingOrder.items,
                          {
                            id: -Date.now(), // Temporary negative ID to distinguish from real IDs
                            product_id: firstProduct.id,
                            quantity: 1,
                            price: firstProduct.wholesale_price || firstProduct.price || '0',
                            product: {
                              id: firstProduct.id,
                              name: firstProduct.name,
                              image: firstProduct.image || null,
                            },
                          },
                        ]
                        setEditingOrder({ ...editingOrder, items: newItems })
                      }}
                      className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={availableProducts.length === 0}
                    >
                      + Thêm sản phẩm
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editingOrder.items.map((item, index) => (
                      <div key={item.id || index} className="flex gap-4 p-4 bg-gray-50 rounded-lg items-center">
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) => {
                              const productId = parseInt(e.target.value)
                              const product = availableProducts.find((p) => p.id === productId)
                              if (product && editingOrder) {
                                const newItems = [...editingOrder.items]
                                newItems[index] = {
                                  ...newItems[index],
                                  product_id: productId,
                                  product: {
                                    id: product.id,
                                    name: product.name,
                                    image: product.image || null,
                                  },
                                  price: product.wholesale_price || product.price || '0',
                                }
                                setEditingOrder({ ...editingOrder, items: newItems })
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {availableProducts.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {formatPrice(product.wholesale_price || product.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Giá:</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={parseFloat(item.price || '0')}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0
                              if (editingOrder) {
                                const newItems = [...editingOrder.items]
                                newItems[index] = { ...newItems[index], price: price.toString() }
                                setEditingOrder({ ...editingOrder, items: newItems })
                              }
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Số lượng:</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseFloat(e.target.value) || 0.1
                              if (editingOrder) {
                                const newItems = [...editingOrder.items]
                                newItems[index] = { ...newItems[index], quantity }
                                setEditingOrder({ ...editingOrder, items: newItems })
                              }
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-900 min-w-[120px] text-right">
                          {formatPrice(calculateItemTotal(item))}
                        </div>
                        <button
                          onClick={() => {
                            if (editingOrder) {
                              const newItems = editingOrder.items.filter((_, i) => i !== index)
                              setEditingOrder({ ...editingOrder, items: newItems })
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-medium px-2"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiết khấu (đ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={parseFloat(editingOrder.discount || '0')}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0
                      setEditingOrder({ ...editingOrder, discount: discount.toString() })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => {
                      setEditingOrder({ ...editingOrder, notes: e.target.value })
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nhập ghi chú cho đơn hàng..."
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng tiền:</span>
                    <span className="text-primary-600">
                      {formatPrice(
                        Math.max(
                          0,
                          editingOrder.items.reduce(
                            (sum, item) => sum + calculateItemTotal(item),
                            0
                          ) - parseFloat(editingOrder.discount || '0')
                        )
                      )}
                    </span>
                  </div>
                </div>

                {/* Audit Logs */}
                {editingOrder.audit_logs && editingOrder.audit_logs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Lịch sử thay đổi</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        {editingOrder.audit_logs.map((log) => (
                          <div key={log.id} className="flex justify-between items-start pb-2 border-b border-gray-200 last:border-0">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{log.description}</p>
                              <p className="text-xs text-gray-500">
                                {log.user.name} - {formatDate(log.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveOrderEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={handleConfirmAcceptOrder}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                  >
                    Xác nhận nhận đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedOrder(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-4 pb-4 sm:p-4 sm:pb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    Chi tiết đơn hàng #{selectedOrder.id}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Thông tin khách hàng</h4>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">Tên:</span> {selectedOrder.user.name}
                      </p>
                      <p>
                        <span className="font-medium">SĐT:</span> {selectedOrder.user.phone || selectedOrder.phone}
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ:</span> {selectedOrder.delivery_address}
                      </p>
                      {selectedOrder.notes && (
                        <p>
                          <span className="font-medium">Ghi chú:</span> {selectedOrder.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Thông tin đơn hàng</h4>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">Trạng thái:</span>{' '}
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs leading-4 font-medium rounded ${
                            STATUS_COLORS[selectedOrder.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getStatusLabel(selectedOrder.status, selectedOrder)}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Tổng tiền:</span>{' '}
                        <span className="text-sm font-bold text-primary-600">
                          {formatPrice(selectedOrder.total_amount)}
                        </span>
                      </p>
                      {selectedOrder.profit !== undefined && (
                        <p>
                          <span className="font-medium">Lợi nhuận:</span>{' '}
                          <span className="text-sm font-bold text-purple-600">
                            {formatPrice(selectedOrder.profit)}
                          </span>
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Ngày đặt:</span> {formatDate(selectedOrder.created_at)}
                      </p>
                      <p>
                        <span className="font-medium">Cập nhật:</span> {formatDate(selectedOrder.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Sản phẩm</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        {getImageUrl(item.product.image) ? (
                          <Image
                            src={getImageUrl(item.product.image)!}
                            alt={item.product.name}
                            width={50}
                            height={50}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                            }}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🍞</span>
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h5>
                          <p className="text-xs text-gray-600">
                            {formatQuantityWithUnit(item)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatPrice(item.price)} × {item.quantity} ={' '}
                            <span className="font-medium">{formatPrice(calculateItemTotal(item))}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Đóng
                  </button>
                  {/* Chỉ hiển thị nút Sửa đơn cho các đơn hàng pending (chưa được nhận hoặc đã nhận nhưng vẫn có thể sửa) */}
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleEditOrderFromDetail(selectedOrder)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Sửa đơn
                    </button>
                  )}
                  {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id, true)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Hủy đơn
                    </button>
                  )}
                  {NEXT_STATUS[selectedOrder.status] && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, NEXT_STATUS[selectedOrder.status]!)
                        setSelectedOrder(null)
                      }}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                      {selectedOrder.status === 'confirmed' && 'Bắt đầu giao'}
                      {(selectedOrder.status === 'preparing' || selectedOrder.status === 'ready') && 'Đã giao'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - chỉ dùng cho hủy đơn */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />

      {/* Toast notifications */}
      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}

