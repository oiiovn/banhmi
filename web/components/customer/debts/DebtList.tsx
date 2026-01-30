'use client'

import { Debt } from '@/lib/api/agent'
import { customerApi } from '@/lib/api/customer'
import { STATUS_COLORS, STATUS_LABELS } from './constants'
import { formatCurrency } from './utils'

interface DebtListProps {
  debts: Debt[]
  loading: boolean
  error: string | null
  onViewDetail: (debt: Debt) => void
  onPayment: (debt: Debt) => void
  onRetry?: () => void
}

export default function DebtList({
  debts,
  loading,
  error,
  onViewDetail,
  onPayment,
  onRetry,
}: DebtListProps) {
  const handleViewDetail = async (debt: Debt) => {
    try {
      const response = await customerApi.getDebt(debt.id)
      if (response.success) {
        const debtData = {
          ...response.data,
          debtOrders: response.data.debt_orders || response.data.debtOrders || [],
          debtManualEntries: response.data.debt_manual_entries || response.data.debtManualEntries || [],
          payments: response.data.payments || [],
        }
        onViewDetail(debtData)
      }
    } catch (error) {
      console.error('Error fetching debt details:', error)
      onViewDetail(debt)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Đang tải công nợ...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Thử lại
          </button>
        )}
      </div>
    )
  }

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="w-24 h-24 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chưa có công nợ</h2>
        <p className="text-gray-600">Bạn chưa có công nợ nào</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-2 pb-4">
        {debts.map((debt) => (
          <div
            key={debt.id}
            onClick={() => handleViewDetail(debt)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 cursor-pointer active:bg-white"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {debt.agent?.name || 'Chưa có đại lý'}
                </h3>
                <p className="text-xs text-gray-500">
                  {debt.debtOrders && debt.debtOrders.length > 0
                    ? `Số đơn hàng: ${debt.debtOrders.length} đơn`
                    : debt.order_id
                    ? 'Số đơn hàng: 1 đơn'
                    : '-'}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                  STATUS_COLORS[debt.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {STATUS_LABELS[debt.status] || debt.status}
              </span>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-medium text-gray-900">{formatCurrency(debt.total_amount)} đ</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Đã trả:</span>
                <span className="font-medium text-green-600">{formatCurrency(debt.paid_amount)} đ</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Còn lại:</span>
                <span className="font-bold text-red-600">{formatCurrency(debt.remaining_amount)} đ</span>
              </div>
            </div>
            {debt.status !== 'paid' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPayment(debt)
                }}
                className="w-full mt-2 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition"
              >
                Thanh toán
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Công nợ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã trả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Còn lại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {debts.map((debt) => (
              <tr key={debt.id} className="hover:bg-white">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {debt.agent?.name || 'Chưa có đại lý'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {debt.debtOrders && debt.debtOrders.length > 0 ? (
                    <span className="font-medium text-primary-600">{debt.debtOrders.length} đơn</span>
                  ) : debt.order_id ? (
                    <span>1 đơn</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(debt.total_amount)} đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {formatCurrency(debt.paid_amount)} đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {formatCurrency(debt.remaining_amount)} đ
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      STATUS_COLORS[debt.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[debt.status] || debt.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleViewDetail(debt)}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Xem chi tiết
                  </button>
                  {debt.status !== 'paid' && (
                    <button
                      onClick={() => onPayment(debt)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Thanh toán
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
