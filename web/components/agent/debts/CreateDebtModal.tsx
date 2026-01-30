'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from './utils'

interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
}

interface CreateDebtModalProps {
  isOpen: boolean
  customers: Customer[]
  isLoadingCustomers: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (customerId: number, amount: number, notes: string) => void
}

export default function CreateDebtModal({
  isOpen,
  customers,
  isLoadingCustomers,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateDebtModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('')
  const [amount, setAmount] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [errors, setErrors] = useState<{
    customer?: string
    amount?: string
    notes?: string
  }>({})

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomerId('')
      setAmount('')
      setNotes('')
      setErrors({})
    }
  }, [isOpen])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!selectedCustomerId) {
      newErrors.customer = 'Vui lòng chọn khách hàng'
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Vui lòng nhập số tiền hợp lệ (lớn hơn 0)'
    }

    if (!notes || notes.trim().length === 0) {
      newErrors.notes = 'Ghi chú là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit(
      Number(selectedCustomerId),
      parseFloat(amount),
      notes.trim()
    )
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Chỉ cho phép số và dấu chấm
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      if (errors.amount) {
        setErrors({ ...errors, amount: undefined })
      }
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
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tạo công nợ mới</h3>
                  <p className="text-xs text-gray-500 mt-1">Khách hàng sẽ cần xác nhận công nợ này</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Thông báo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Lưu ý:</span> Công nợ này sẽ được tạo với trạng thái &quot;Chờ xác nhận&quot;. 
                  Khách hàng cần xác nhận hoặc từ chối công nợ này trước khi nó được áp dụng.
                </p>
              </div>

              {/* Chọn khách hàng */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn khách hàng <span className="text-red-500">*</span>
                </label>
                {isLoadingCustomers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Đang tải danh sách khách hàng...</span>
                  </div>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedCustomerId(v === '' ? '' : Number(v))
                      if (errors.customer) {
                        setErrors({ ...errors, customer: undefined })
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.customer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {errors.customer && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer}</p>
                )}
                {customers.length === 0 && !isLoadingCustomers && (
                  <p className="mt-1 text-sm text-yellow-600">
                    Không có khách hàng nào. Khách hàng sẽ xuất hiện sau khi có đơn hàng với bạn.
                  </p>
                )}
              </div>

              {/* Nhập số tiền */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {amount && !errors.amount && (
                    <div className="mt-1 text-sm text-gray-600">
                      = {formatCurrency(parseFloat(amount) || 0)} đ
                    </div>
                  )}
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Ghi chú */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    if (errors.notes) {
                      setErrors({ ...errors, notes: undefined })
                    }
                  }}
                  placeholder="Nhập ghi chú về công nợ này..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.notes ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Ghi chú là bắt buộc để giải thích lý do tạo công nợ này
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingCustomers}
                className={`w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium ${
                  isSubmitting || isLoadingCustomers ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo công nợ'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
