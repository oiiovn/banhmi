'use client'

import { useMemo } from 'react'
import { Debt } from '@/lib/api/agent'
import { TransferFormState } from './types'
import { formatCurrency } from './utils'

interface TransferModalProps {
  isOpen: boolean
  debts: Debt[]
  form: TransferFormState
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
  onFormChange: (form: TransferFormState) => void
}

export default function TransferModal({
  isOpen,
  debts,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  onFormChange,
}: TransferModalProps) {
  // Tính toán thông tin bù trừ
  const offsetInfo = useMemo(() => {
    if (!form.from_debt_id || !form.to_debt_id) return null

    const fromDebt = debts.find(d => d.id === form.from_debt_id)
    const toDebt = debts.find(d => d.id === form.to_debt_id)

    if (!fromDebt || !toDebt) return null

    const fromRemaining = parseFloat(fromDebt.remaining_amount)
    const toRemaining = parseFloat(toDebt.remaining_amount)
    const maxOffset = Math.min(fromRemaining, toRemaining)
    const inputAmount = parseFloat(form.amount) || 0

    return {
      fromDebt,
      toDebt,
      fromRemaining,
      toRemaining,
      maxOffset,
      inputAmount,
      // Kết quả sau bù trừ
      fromAfter: Math.max(0, fromRemaining - inputAmount),
      toAfter: Math.max(0, toRemaining - inputAmount),
      isValidAmount: inputAmount > 0 && inputAmount <= maxOffset,
    }
  }, [form, debts])

  // Auto-fill max offset amount
  const handleAutoFillMax = () => {
    if (offsetInfo?.maxOffset) {
      onFormChange({ ...form, amount: offsetInfo.maxOffset.toString() })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Bù trừ công nợ</h3>
                <p className="text-xs text-gray-500 mt-1">Giảm công nợ hai chiều giữa hai đại lý</p>
              </div>
              <button
                onClick={onClose}
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

            {/* Giải thích ngắn gọn */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Bù trừ công nợ:</span> Khi A nợ B và B cũng nợ A, 
                hai khoản nợ sẽ được trừ đi cùng một số tiền. Không có tiền thực được chuyển.
              </p>
            </div>

            <div className="space-y-4">
              {/* Công nợ bạn nợ người khác */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Công nợ <span className="text-red-600 font-semibold">bạn nợ</span> đại lý khác
                </label>
                <select
                  value={form.from_debt_id || ''}
                  onChange={(e) => onFormChange({ ...form, from_debt_id: parseInt(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Chọn công nợ bạn nợ --</option>
                  {debts
                    .filter(debt => parseFloat(debt.remaining_amount) > 0)
                    .map((debt) => (
                      <option key={debt.id} value={debt.id}>
                        Bạn nợ {debt.agent?.name || debt.customer?.name || 'N/A'}: {formatCurrency(debt.remaining_amount)} đ
                      </option>
                    ))}
                </select>
              </div>

              {/* Công nợ người khác nợ bạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Công nợ đại lý khác <span className="text-green-600 font-semibold">nợ bạn</span>
                </label>
                <select
                  value={form.to_debt_id || ''}
                  onChange={(e) => onFormChange({ ...form, to_debt_id: parseInt(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Chọn công nợ họ nợ bạn --</option>
                  {debts
                    .filter(debt => debt.id !== form.from_debt_id && parseFloat(debt.remaining_amount) > 0)
                    .map((debt) => (
                      <option key={debt.id} value={debt.id}>
                        {debt.customer?.name || 'N/A'} nợ bạn: {formatCurrency(debt.remaining_amount)} đ
                      </option>
                    ))}
                </select>
              </div>

              {/* Hiển thị max offset */}
              {offsetInfo && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Số tiền tối đa có thể bù trừ:</span>
                    <span className="font-bold text-purple-600">{formatCurrency(offsetInfo.maxOffset)} đ</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillMax}
                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Bù trừ tối đa
                  </button>
                </div>
              )}

              {/* Số tiền bù trừ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền bù trừ (đ)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={offsetInfo?.maxOffset || undefined}
                  value={form.amount}
                  onChange={(e) => onFormChange({ ...form, amount: e.target.value })}
                  placeholder="Nhập số tiền cần bù trừ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {offsetInfo && offsetInfo.inputAmount > offsetInfo.maxOffset && (
                  <p className="text-xs text-red-600 mt-1">
                    Số tiền không được vượt quá {formatCurrency(offsetInfo.maxOffset)} đ
                  </p>
                )}
              </div>

              {/* Preview kết quả */}
              {offsetInfo && offsetInfo.inputAmount > 0 && offsetInfo.isValidAmount && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-2">📊 Kết quả sau bù trừ:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bạn nợ {offsetInfo.fromDebt.agent?.name || offsetInfo.fromDebt.customer?.name}:</span>
                      <span>
                        <span className="line-through text-gray-400">{formatCurrency(offsetInfo.fromRemaining)}</span>
                        <span className="mx-1">→</span>
                        <span className="font-bold text-green-700">{formatCurrency(offsetInfo.fromAfter)} đ</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{offsetInfo.toDebt.customer?.name} nợ bạn:</span>
                      <span>
                        <span className="line-through text-gray-400">{formatCurrency(offsetInfo.toRemaining)}</span>
                        <span className="mx-1">→</span>
                        <span className="font-bold text-green-700">{formatCurrency(offsetInfo.toAfter)} đ</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                  placeholder="Ví dụ: Bù trừ công nợ tháng 1/2026..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !offsetInfo?.isValidAmount}
              className={`w-full sm:ml-3 sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ${
                isSubmitting || !offsetInfo?.isValidAmount ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu bù trừ'}
            </button>
            <button
              onClick={onClose}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
