'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'
import { agentApi, Debt, DebtStats, Payment, DebtTransfer } from '@/lib/api/agent'
import { ModalState, TransferFormState } from '@/components/agent/debts/types'
import { ToastMessage } from '@/components/Toast'

const initialModalState: ModalState = {
  isOpen: false,
  type: 'alert',
  message: '',
}

const initialTransferForm: TransferFormState = {
  from_debt_id: null,
  to_debt_id: null,
  amount: '',
  description: '',
}

export function useAgentDebts() {
  const router = useRouter()
  const { user, isAuthenticated, viewMode, setViewMode } = useAuthStore()
  
  // Data states
  const [debts, setDebts] = useState<Debt[]>([])
  const [stats, setStats] = useState<DebtStats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([])
  const [pendingDebtTransfers, setPendingDebtTransfers] = useState<DebtTransfer[]>([])
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  
  // Loading & Error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<Error | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  
  // Modal states
  const [modal, setModal] = useState<ModalState>(initialModalState)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferForm, setTransferForm] = useState<TransferFormState>(initialTransferForm)
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false)
  
  // Offset Modal states (MỚI)
  const [showOffsetModal, setShowOffsetModal] = useState(false)
  const [offsetCurrentDebt, setOffsetCurrentDebt] = useState<Debt | null>(null)
  const [offsetOppositeDebt, setOffsetOppositeDebt] = useState<Debt | null>(null)
  const [isSubmittingOffset, setIsSubmittingOffset] = useState(false)
  const [isLoadingOpposite, setIsLoadingOpposite] = useState(false)
  const [canOffset, setCanOffset] = useState(false) // Có quyền bù trừ không (nợ ít hơn)
  
  // Toast states
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [debtsRes, paymentsRes, transfersRes] = await Promise.allSettled([
        agentApi.getDebts(selectedStatus || undefined).catch((err) => {
          console.error('❌ Error fetching debts:', err)
          return { success: false, data: [], stats: null, error: err }
        }),
        agentApi.getPendingPayments().catch((err) => {
          console.error('❌ Error fetching pending payments:', err)
          return { success: false, data: [], count: 0, error: err }
        }),
        agentApi.getPendingDebtTransfers().catch((err) => {
          console.error('❌ Error fetching pending transfers:', err)
          return { success: false, data: [], error: err }
        }),
      ])

      // Xử lý kết quả debts
      if (debtsRes.status === 'fulfilled' && debtsRes.value.success) {
        setDebts(debtsRes.value.data || [])
        if (debtsRes.value.stats) {
          setStats(debtsRes.value.stats)
        }
      } else {
        const error: any = debtsRes.status === 'rejected' ? debtsRes.reason : (debtsRes.value as any)?.error
        if (error) {
          if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            setError('Lỗi kết nối mạng. Vui lòng kiểm tra API server có đang chạy tại http://localhost:8000 không.')
          } else if (error.response?.status === 401) {
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
            router.push('/login')
          } else {
            setError(error.response?.data?.message || error.message || 'Không thể tải dữ liệu công nợ')
          }
        }
        setDebts([])
        setStats(null)
      }

      // Xử lý kết quả payments
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
        setPendingPayments(paymentsRes.value.data || [])
      }

      // Xử lý kết quả transfers
      if (transfersRes.status === 'fulfilled' && transfersRes.value.success) {
        setPendingDebtTransfers(transfersRes.value.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra API server có đang chạy tại http://localhost:8000 không.')
      } else {
        setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu')
      }
      setDebts([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, router])

  // Hydration effect
  useEffect(() => {
    try {
      setIsHydrated(true)
    } catch (err) {
      console.error('Error in hydration:', err)
      setRenderError(err instanceof Error ? err : new Error('Lỗi khởi tạo trang'))
    }
  }, [])

  // Auth check effect
  useEffect(() => {
    try {
      if (!isHydrated) return

      if (!isAuthenticated || !user || user.role !== 'agent') {
        router.push('/login')
        return
      }
      
      if (viewMode !== 'agent') {
        setViewMode('agent')
      }
    } catch (err) {
      console.error('Error in auth check:', err)
      setRenderError(err instanceof Error ? err : new Error('Lỗi kiểm tra xác thực'))
    }
  }, [isHydrated, isAuthenticated, user, router, viewMode, setViewMode])

  // Data fetch effect
  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    )
    
    let timeoutId: NodeJS.Timeout | null = null
    let mounted = true

    if (isLocal) {
      timeoutId = setTimeout(() => {
        console.warn('⚠️ [LOCAL] Loading timeout (3s) - forcing loading to false')
        if (mounted) setLoading(false)
      }, 3000)
    } else {
      timeoutId = setTimeout(() => {
        console.warn('⚠️ [PROD] Loading timeout (10s) - forcing loading to false')
        if (mounted) setLoading(false)
      }, 10000)
    }

    try {
      if (!isHydrated || !isAuthenticated || !user || user.role !== 'agent') {
        if (timeoutId) clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      authApi.getCurrentUser().catch((err) => {
        console.error('Error getting current user:', err)
        setError('Lỗi khi lấy thông tin người dùng: ' + (err?.message || 'Unknown error'))
      })
      
      fetchData().finally(() => {
        if (timeoutId) clearTimeout(timeoutId)
      })
    } catch (err) {
      console.error('Error in data fetch effect:', err)
      setRenderError(err instanceof Error ? err : new Error('Lỗi tải dữ liệu'))
      if (mounted) setLoading(false)
      if (timeoutId) clearTimeout(timeoutId)
    }

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isHydrated, isAuthenticated, user?.id, selectedStatus, fetchData])

  // Handlers
  const handleConfirmPayment = useCallback(async (paymentId: number) => {
    try {
      const response = await agentApi.confirmPayment(paymentId)
      if (response.success) {
        addToast('success', 'Đã xác nhận thanh toán thành công!')
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể xác nhận thanh toán: ' + (error.response?.data?.message || error.message))
    }
  }, [fetchData, addToast])

  const handleRejectPayment = useCallback(async (paymentId: number) => {
    try {
      const response = await agentApi.rejectPayment(paymentId)
      if (response.success) {
        addToast('success', 'Đã từ chối thanh toán!')
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể từ chối thanh toán: ' + (error.response?.data?.message || error.message))
    }
  }, [fetchData, addToast])

  // Handler mở Offset Modal (MỚI) - Gọi API để tìm công nợ đối ứng
  const handleOpenOffsetModal = useCallback(async (debt: Debt) => {
    setOffsetCurrentDebt(debt)
    setOffsetOppositeDebt(null)
    setCanOffset(false)
    setShowOffsetModal(true)
    setIsLoadingOpposite(true)
    
    try {
      const response = await agentApi.findOppositeDebt(debt.id)
      if (response.success) {
        if (response.data.opposite_debt) {
          setOffsetOppositeDebt(response.data.opposite_debt)
        }
        // Kiểm tra xem có quyền bù trừ không (nợ ít hơn hoặc bằng)
        setCanOffset(response.data.can_offset === true)
      }
    } catch (error) {
      console.error('Error finding opposite debt:', error)
    } finally {
      setIsLoadingOpposite(false)
    }
  }, [])

  // Handler đóng Offset Modal
  const handleCloseOffsetModal = useCallback(() => {
    setShowOffsetModal(false)
    setOffsetCurrentDebt(null)
    setOffsetOppositeDebt(null)
    setCanOffset(false)
  }, [])

  // Handler submit bù trừ (MỚI - trực tiếp, không cần xác nhận từ đối tác)
  const handleSubmitOffset = useCallback(async (
    currentDebtId: number, 
    oppositeDebtId: number, 
    amount: number,
    description?: string
  ) => {
    setIsSubmittingOffset(true)
    try {
      const response = await agentApi.createDebtTransfer({
        from_debt_id: currentDebtId,
        to_debt_id: oppositeDebtId,
        amount: amount,
        description: description || 'Bù trừ công nợ',
      })

      if (response.success) {
        addToast('success', 'Đã tạo yêu cầu bù trừ công nợ! Đang chờ đại lý kia xác nhận.')
        handleCloseOffsetModal()
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể bù trừ công nợ: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmittingOffset(false)
    }
  }, [fetchData, handleCloseOffsetModal, addToast])

  // Legacy handlers (giữ lại cho PendingTransfers)
  const handleCreateTransfer = useCallback(async () => {
    if (!transferForm.from_debt_id || !transferForm.to_debt_id || !transferForm.amount) {
      addToast('error', 'Vui lòng điền đầy đủ thông tin.')
      return
    }

    const amount = parseFloat(transferForm.amount)
    if (isNaN(amount) || amount <= 0) {
      addToast('error', 'Số tiền phải lớn hơn 0.')
      return
    }

    setIsSubmittingTransfer(true)
    try {
      const response = await agentApi.createDebtTransfer({
        from_debt_id: transferForm.from_debt_id,
        to_debt_id: transferForm.to_debt_id,
        amount: amount,
        description: transferForm.description || undefined,
      })

      if (response.success) {
        addToast('success', 'Đã tạo yêu cầu bù trừ công nợ! Đang chờ đại lý kia xác nhận.')
        setShowTransferModal(false)
        setTransferForm(initialTransferForm)
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể tạo yêu cầu bù trừ: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmittingTransfer(false)
    }
  }, [transferForm, fetchData, addToast])

  const handleConfirmTransfer = useCallback(async (transferId: number) => {
    try {
      const response = await agentApi.confirmDebtTransfer(transferId)
      if (response.success) {
        addToast('success', 'Bù trừ công nợ thành công! Công nợ hai bên đã được cập nhật.')
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể bù trừ công nợ: ' + (error.response?.data?.message || error.message))
    }
  }, [fetchData, addToast])

  const handleRejectTransfer = useCallback(async (transferId: number) => {
    try {
      const response = await agentApi.rejectDebtTransfer(transferId)
      if (response.success) {
        addToast('success', 'Đã từ chối yêu cầu bù trừ công nợ!')
        fetchData()
      }
    } catch (error: any) {
      addToast('error', 'Không thể từ chối: ' + (error.response?.data?.message || error.message))
    }
  }, [fetchData, addToast])

  const handleViewDebtDetail = useCallback(async (debt: Debt) => {
    try {
      const response = await agentApi.getDebt(debt.id)
      if (response.success) {
        const debtData = {
          ...response.data,
          debtOrders: response.data.debt_orders || response.data.debtOrders || [],
        }
        setSelectedDebt(debtData)
      }
    } catch (error) {
      console.error('Error fetching debt details:', error)
      setSelectedDebt(debt)
    }
  }, [])

  return {
    // Data
    debts,
    stats,
    pendingPayments,
    pendingDebtTransfers,
    selectedDebt,
    
    // Loading & Error states
    loading,
    error,
    renderError,
    isHydrated,
    
    // Modal states
    modal,
    showTransferModal,
    transferForm,
    isSubmittingTransfer,
    
    // Offset Modal states (MỚI)
    showOffsetModal,
    offsetCurrentDebt,
    offsetOppositeDebt,
    isSubmittingOffset,
    isLoadingOpposite,
    canOffset,
    
    // Toast states
    toasts,
    removeToast,
    addToast,
    
    // Actions
    fetchData,
    setSelectedDebt,
    setModal,
    setShowTransferModal,
    setTransferForm,
    setRenderError,
    
    // Handlers
    handleConfirmPayment,
    handleRejectPayment,
    handleCreateTransfer,
    handleConfirmTransfer,
    handleRejectTransfer,
    handleViewDebtDetail,
    
    // Offset handlers (MỚI)
    handleOpenOffsetModal,
    handleCloseOffsetModal,
    handleSubmitOffset,
  }
}
