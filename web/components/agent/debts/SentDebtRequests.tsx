'use client'

import { DebtManualRequest } from '@/lib/api/agent'
import { formatCurrency, formatDateTime } from './utils'

interface SentDebtRequestsProps {
  requests: DebtManualRequest[]
}

export default function SentDebtRequests({ requests }: SentDebtRequestsProps) {
  if (requests.length === 0) return null

  return (
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Yêu cầu công nợ đang chờ khách hàng xác nhận ({requests.length})
      </h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-sm border border-blue-200 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Đến: {request.customer?.name || 'Khách hàng'}
                  </p>
                  {request.customer?.phone && (
                    <span className="text-xs text-gray-500">
                      ({request.customer.phone})
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-blue-600 mb-1">
                  {formatCurrency(parseFloat(request.amount))} đ
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  {request.notes}
                </p>
                <p className="text-xs text-gray-500">
                  Gửi lúc: {request.created_at ? formatDateTime(request.created_at) : '-'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium whitespace-nowrap">
                  Đang chờ xác nhận
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
