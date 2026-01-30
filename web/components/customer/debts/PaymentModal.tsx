'use client'

import { Debt, Payment, PaymentData } from '@/lib/api/agent'
import { formatCurrency } from './utils'

interface PaymentModalProps {
  debt: Debt | null
  paymentData: PaymentData
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
  onPaymentDataChange: (data: PaymentData) => void
}

export default function PaymentModal({
  debt,
  paymentData,
  isSubmitting,
  onClose,
  onSubmit,
  onPaymentDataChange,
}: PaymentModalProps) {
  if (!debt) return null

  const pendingAmount = debt.payments
    ? debt.payments
        .filter((p: Payment) => p.status === 'pending_confirmation')
        .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount), 0)
    : 0
  const availableAmount = parseFloat(debt.remaining_amount) - pendingAmount
  const maxAmount = availableAmount

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Thanh toán công nợ</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền còn lại</label>
                <div className="text-lg font-bold text-red-600">{formatCurrency(debt.remaining_amount)} đ</div>
                {pendingAmount > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-600">
                      <span className="text-yellow-600 font-medium">{formatCurrency(pendingAmount)} đ đang chờ xác nhận</span>
                      <span className="ml-2">(Có thể thanh toán: {formatCurrency(availableAmount)} đ)</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  max={maxAmount}
                  step="0.01"
                  value={paymentData.amount || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    onPaymentDataChange({ ...paymentData, amount: value ? parseFloat(value) : 0 })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập số tiền"
                />
                {pendingAmount > 0 && (
                  <p className="mt-1 text-xs text-gray-600">
                    Số tiền có thể thanh toán tối đa:{' '}
                    <span className="font-semibold text-primary-600">{formatCurrency(availableAmount)} đ</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) =>
                    onPaymentDataChange({
                      ...paymentData,
                      payment_method: e.target.value as 'cash' | 'bank_transfer' | 'other',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => onPaymentDataChange({ ...paymentData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => onPaymentDataChange({ ...paymentData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition"
                >
                  Hủy
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-primary-600 text-white rounded-lg transition ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
