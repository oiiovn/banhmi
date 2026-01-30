'use client'

import { DebtManualRequest } from '@/lib/api/agent'

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

// Format date time
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface PendingDebtRequestsProps {
  requests: DebtManualRequest[]
  onConfirm: (id: number) => void
  onReject: (id: number) => void
  isSubmitting?: boolean
}

export default function PendingDebtRequests({ 
  requests, 
  onConfirm, 
  onReject,
  isSubmitting = false 
}: PendingDebtRequestsProps) {
  if (requests.length === 0) return null

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Yêu cầu công nợ chờ xác nhận ({requests.length})
      </h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-sm border border-orange-200 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Từ: {request.agent?.name || 'Đại lý'}
                  </p>
                  {request.createdBy && (
                    <span className="text-xs text-gray-500">
                      (Tạo bởi: {request.createdBy.name})
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-orange-600 mb-1">
                  {formatCurrency(parseFloat(request.amount))} đ
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  {request.notes}
                </p>
                <p className="text-xs text-gray-500">
                  Yêu cầu tạo lúc: {request.created_at ? formatDateTime(request.created_at) : '-'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onConfirm(request.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
