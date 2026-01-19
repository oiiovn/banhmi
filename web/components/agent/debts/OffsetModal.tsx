'use client'

import { useMemo } from 'react'
import { Debt } from '@/lib/api/agent'
import { formatCurrency } from './utils'

interface OffsetModalProps {
  isOpen: boolean
  currentDebt: Debt | null        // Công nợ đang xem: khách hàng X nợ bạn (bạn là agent)
  oppositeDebt: Debt | null       // Công nợ đối ứng: bạn nợ khách hàng X (bạn là customer)
  isSubmitting: boolean
  isLoading?: boolean             // Đang tìm công nợ đối ứng
  canOffset?: boolean             // Có quyền bù trừ không (nợ ít hơn)
  onClose: () => void
  onSubmit: (currentDebtId: number, oppositeDebtId: number, amount: number, description?: string) => void
}

export default function OffsetModal({
  isOpen,
  currentDebt,
  oppositeDebt,
  isSubmitting,
  isLoading = false,
  canOffset = false,
  onClose,
  onSubmit,
}: OffsetModalProps) {
  // Lấy tên đối tác (customer của currentDebt)
  const partnerName = currentDebt?.customer?.name || 'Đối tác'

  // Tính toán thông tin bù trừ
  const offsetInfo = useMemo(() => {
    if (!currentDebt || !oppositeDebt) return null

    // currentRemaining: số tiền đối tác (customer) nợ bạn (agent)
    const theyOweYou = parseFloat(currentDebt.remaining_amount)
    // oppositeRemaining: số tiền bạn nợ đối tác
    const youOweThem = parseFloat(oppositeDebt.remaining_amount)
    const offsetAmount = Math.min(theyOweYou, youOweThem)

    return {
      theyOweYou,
      youOweThem,
      offsetAmount,
      // Kết quả sau bù trừ
      theyOweYouAfter: theyOweYou - offsetAmount,
      youOweThemAfter: youOweThem - offsetAmount,
    }
  }, [currentDebt, oppositeDebt])

  const handleSubmit = () => {
    if (!currentDebt || !oppositeDebt || !offsetInfo) return
    // Gọi API: from_debt = công nợ bạn nợ họ (opposite), to_debt = công nợ họ nợ bạn (current)
    // Backend sẽ trừ cả hai
    onSubmit(oppositeDebt.id, currentDebt.id, offsetInfo.offsetAmount)
  }

  if (!isOpen || !currentDebt) return null

  // Đang loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          ></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Bù trừ công nợ</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Đang tìm công nợ đối ứng...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Không có công nợ đối ứng
  if (!oppositeDebt) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          ></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Bù trừ công nợ</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Không thể bù trừ:</span> Không tìm thấy công nợ đối ứng.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Bù trừ công nợ chỉ có thể thực hiện khi bạn cũng nợ <strong>{partnerName}</strong>.
                </p>
              </div>

              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Có công nợ đối ứng nhưng bạn nợ NHIỀU HƠN → không được đề xuất bù trừ
  if (!canOffset) {
    const youOweThem = parseFloat(oppositeDebt.remaining_amount)
    const theyOweYou = parseFloat(currentDebt.remaining_amount)
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          ></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Bù trừ công nợ</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Thông tin công nợ */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{partnerName} nợ bạn:</span>
                  <span className="font-bold text-green-600">{formatCurrency(theyOweYou)} đ</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Bạn nợ {partnerName}:</span>
                  <span className="font-bold text-red-600">{formatCurrency(youOweThem)} đ</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 font-semibold mb-2">
                  ⚠️ Bạn không thể đề xuất bù trừ
                </p>
                <p className="text-xs text-orange-700">
                  Bạn đang nợ <strong>{partnerName}</strong> nhiều hơn số tiền họ nợ bạn.
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  Theo quy tắc, <strong>người nợ ít hơn</strong> mới được quyền đề xuất bù trừ. 
                  Trong trường hợp này, <strong>{partnerName}</strong> sẽ là người đề xuất bù trừ với bạn.
                </p>
              </div>

              <div className="mt-4">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bù trừ công nợ</h3>
                <p className="text-xs text-gray-500 mt-1">Giữa bạn và {partnerName}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Giải thích */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">⚖️ Bù trừ công nợ:</span> Hai khoản nợ đối ứng sẽ được trừ đi cùng một số tiền. Không có tiền thực được chuyển.
              </p>
            </div>

            {/* Thông tin TRƯỚC bù trừ */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Trước bù trừ:</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {partnerName} <span className="text-green-600 font-medium">nợ bạn</span>:
                  </span>
                  <span className="font-bold text-green-600">{formatCurrency(offsetInfo?.theyOweYou || 0)} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    <span className="text-red-600 font-medium">Bạn nợ</span> {partnerName}:
                  </span>
                  <span className="font-bold text-red-600">{formatCurrency(offsetInfo?.youOweThem || 0)} đ</span>
                </div>
              </div>
            </div>

            {/* Số tiền bù trừ */}
            <div className="mb-4">
              <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-700 mb-1">Số tiền bù trừ (tự động tính)</p>
                <p className="text-2xl font-bold text-purple-800">{formatCurrency(offsetInfo?.offsetAmount || 0)} đ</p>
                <p className="text-xs text-purple-600 mt-1">
                  = min({formatCurrency(offsetInfo?.theyOweYou || 0)}, {formatCurrency(offsetInfo?.youOweThem || 0)})
                </p>
              </div>
            </div>

            {/* Kết quả SAU bù trừ */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sau bù trừ:</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{partnerName} nợ bạn:</span>
                  <span className={`font-bold ${(offsetInfo?.theyOweYouAfter || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formatCurrency(offsetInfo?.theyOweYouAfter || 0)} đ
                    {(offsetInfo?.theyOweYouAfter || 0) === 0 && <span className="ml-1">✓</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bạn nợ {partnerName}:</span>
                  <span className={`font-bold ${(offsetInfo?.youOweThemAfter || 0) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {formatCurrency(offsetInfo?.youOweThemAfter || 0)} đ
                    {(offsetInfo?.youOweThemAfter || 0) === 0 && <span className="ml-1">✓</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Ghi chú kết quả */}
            {(offsetInfo?.youOweThemAfter || 0) === 0 && (offsetInfo?.theyOweYouAfter || 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  Sau bù trừ, bạn không còn nợ {partnerName}. 
                  {partnerName} vẫn còn nợ bạn <strong>{formatCurrency(offsetInfo?.theyOweYouAfter || 0)} đ</strong>.
                </p>
              </div>
            )}
            {(offsetInfo?.theyOweYouAfter || 0) === 0 && (offsetInfo?.youOweThemAfter || 0) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  Sau bù trừ, {partnerName} không còn nợ bạn. 
                  Bạn vẫn còn nợ {partnerName} <strong>{formatCurrency(offsetInfo?.youOweThemAfter || 0)} đ</strong>.
                </p>
              </div>
            )}
            {(offsetInfo?.theyOweYouAfter || 0) === 0 && (offsetInfo?.youOweThemAfter || 0) === 0 && (
              <div className="bg-green-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-700 font-medium">
                  Sau bù trừ, cả hai bên đều không còn nợ nhau!
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !offsetInfo?.offsetAmount}
              className={`w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium ${
                isSubmitting || !offsetInfo?.offsetAmount ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu bù trừ'}
            </button>
            <button
              onClick={onClose}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
