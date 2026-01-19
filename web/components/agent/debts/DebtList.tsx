'use client'

import { Debt } from '@/lib/api/agent'
import { formatCurrency } from './utils'
import { STATUS_COLORS, STATUS_LABELS } from './constants'

interface DebtListProps {
  debts: Debt[]
  loading: boolean
  error: string | null
  onViewDetail: (debt: Debt) => void
  onOffset: (debt: Debt) => void  // Thêm handler bù trừ
  onRetry: () => void
}

export default function DebtList({ debts, loading, error, onViewDetail, onOffset, onRetry }: DebtListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">Đang tải...</div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-sm text-gray-500">Không có công nợ nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {debts.map((debt) => {
        // Sử dụng can_offset từ API (đã tính sẵn logic: nợ ít hơn mới được bù trừ)
        const canOffset = debt.can_offset === true
        
        return (
          <div
            key={debt.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            {/* Content */}
            <div className="p-3">
              {/* Header: Tên đối tác + Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {debt.customer?.name || '-'}
                  </h3>
                  <span
                    className={
                      'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ' +
                      (STATUS_COLORS[debt.status] || 'bg-gray-100 text-gray-800')
                    }
                  >
                    {STATUS_LABELS[debt.status] || debt.status}
                  </span>
                </div>
              </div>

              {/* Số tiền */}
              <div className="flex items-center gap-4 text-xs mb-3">
                <div>
                  <span className="text-gray-500">Tổng:</span>{' '}
                  <span className="font-medium text-gray-900">{formatCurrency(debt.total_amount)} đ</span>
                </div>
                <div>
                  <span className="text-gray-500">Đã trả:</span>{' '}
                  <span className="font-medium text-green-600">{formatCurrency(debt.paid_amount)} đ</span>
                </div>
                <div>
                  <span className="text-gray-500">Còn lại:</span>{' '}
                  <span className="font-bold text-red-600">{formatCurrency(debt.remaining_amount)} đ</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetail(debt)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                >
                  Chi tiết
                </button>
                {canOffset && (
                  <button
                    onClick={() => onOffset(debt)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium"
                  >
                    ⚖️ Bù trừ
                  </button>
                )}
                {debt.has_pending_transfer && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                    ⏳ Đang chờ bù trừ
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
