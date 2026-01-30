'use client'

import { DebtManualEntry, Debt } from '@/lib/api/agent'

// Format manual debt entry ID as CN-XXX
const formatManualDebtId = (id: number) => {
  return `CN-${id.toString().padStart(3, '0')}`
}

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

interface ManualDebtEntryDetailModalProps {
  entry: DebtManualEntry | null
  debt?: Debt | null
  onClose: () => void
}

export default function ManualDebtEntryDetailModal({
  entry,
  debt,
  onClose,
}: ManualDebtEntryDetailModalProps) {
  if (!entry) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Chi tiết {formatManualDebtId(entry.id)}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin cơ bản */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Thông tin công nợ thủ công</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Mã công nợ:</span>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {formatManualDebtId(entry.id)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Số tiền:</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {formatCurrency(parseFloat(entry.amount))} đ
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Người tạo:</span>
                    <p className="text-gray-900 mt-1">
                      {entry.createdBy?.name || 'Đại lý'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ngày tạo:</span>
                    <p className="text-gray-900 mt-1">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {entry.notes || 'Không có ghi chú'}
                </p>
              </div>

              {/* Thông tin liên quan */}
              {debt && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Công nợ tổng</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Mã công nợ tổng:</span> #{debt.id}
                    </p>
                    {debt.agent && (
                      <p>
                        <span className="font-medium">Đại lý:</span> {debt.agent.name}
                      </p>
                    )}
                    {debt.customer && (
                      <p>
                        <span className="font-medium">Khách hàng:</span> {debt.customer.name}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Tổng tiền công nợ:</span>{' '}
                      {formatCurrency(parseFloat(debt.total_amount))} đ
                    </p>
                    <p>
                      <span className="font-medium">Đã thanh toán:</span>{' '}
                      <span className="text-green-600">
                        {formatCurrency(parseFloat(debt.paid_amount))} đ
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Còn lại:</span>{' '}
                      <span className="text-red-600">
                        {formatCurrency(parseFloat(debt.remaining_amount))} đ
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
