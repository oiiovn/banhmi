'use client'

import { Payment } from '@/lib/api/agent'
import { formatCurrency, formatDate } from './utils'

interface PendingPaymentsProps {
  payments: Payment[]
  onConfirm: (paymentId: number) => void
  onReject: (paymentId: number) => void
}

export default function PendingPayments({ payments, onConfirm, onReject }: PendingPaymentsProps) {
  if (payments.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <h2 className="text-sm font-bold text-yellow-900 mb-2">
        Thanh toán chờ xác nhận ({payments.length})
      </h2>
      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-lg shadow-sm p-3 flex justify-between items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {payment.customer?.name || 'N/A'}
              </p>
              <p className="text-base font-bold text-primary-600">
                {formatCurrency(payment.amount)} đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {payment.payment_method === 'cash' ? 'Tiền mặt' :
                 payment.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 
                 payment.payment_method === 'debt_offset' ? 'Bù trừ công nợ' : 'Khác'} - {formatDate(payment.payment_date)}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onConfirm(payment.id)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium whitespace-nowrap"
              >
                Xác nhận
              </button>
              <button
                onClick={() => onReject(payment.id)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-medium whitespace-nowrap"
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
