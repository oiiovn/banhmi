'use client'

import { useRouter } from 'next/navigation'
import { Debt, Payment } from '@/lib/api/agent'
import { formatCurrency, formatDate, formatOrderId, formatManualDebtId } from './utils'
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_METHOD_LABELS } from './constants'

interface DebtDetailModalProps {
  debt: Debt | null
  onClose: () => void
  onPayment: (debt: Debt) => void
  onManualEntryClick: (entry: any) => void
  highlightedPaymentId?: number | null
  paymentRowRef?: React.RefObject<HTMLTableRowElement>
}

export default function DebtDetailModal({
  debt,
  onClose,
  onPayment,
  onManualEntryClick,
  highlightedPaymentId,
  paymentRowRef,
}: DebtDetailModalProps) {
  const router = useRouter()

  if (!debt) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết công nợ #{debt.id}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <DebtInfo debt={debt} />
              <OrdersList debt={debt} onManualEntryClick={onManualEntryClick} />
              <PaymentHistory
                debt={debt}
                highlightedPaymentId={highlightedPaymentId}
                paymentRowRef={paymentRowRef}
                onNavigate={(url) => router.push(url)}
              />
              {debt.status !== 'paid' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onPayment(debt)}
                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Thanh toán
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
function DebtInfo({ debt }: { debt: Debt }) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Thông tin công nợ</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Đại lý:</span> {debt.agent?.name || '-'}
        </div>
        {debt.debtOrders && debt.debtOrders.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Số đơn hàng:</span> {debt.debtOrders.length} đơn
          </div>
        )}
        <div>
          <span className="font-medium">Tổng tiền:</span>{' '}
          <span className="font-bold">{formatCurrency(debt.total_amount)} đ</span>
        </div>
        <div>
          <span className="font-medium">Đã thanh toán:</span>{' '}
          <span className="text-green-600 font-bold">{formatCurrency(debt.paid_amount)} đ</span>
        </div>
        <div>
          <span className="font-medium">Còn lại:</span>{' '}
          <span className="text-red-600 font-bold">{formatCurrency(debt.remaining_amount)} đ</span>
        </div>
        <div>
          <span className="font-medium">Trạng thái:</span>{' '}
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[debt.status] || 'bg-gray-100 text-gray-800'}`}>
            {STATUS_LABELS[debt.status] || debt.status}
          </span>
        </div>
      </div>
    </div>
  )
}

function OrdersList({ 
  debt, 
  onManualEntryClick 
}: { 
  debt: Debt
  onManualEntryClick: (entry: any) => void
}) {
  const router = useRouter()
  const debtOrders = debt.debtOrders || debt.debt_orders || []
  const debtManualEntries = debt.debtManualEntries || debt.debt_manual_entries || []
  const hasOrders = debtOrders.length > 0 || debt.order_id
  const hasManualEntries = debtManualEntries.length > 0
  const hasAnyHistory = hasOrders || hasManualEntries

  // Merge và sort chung đơn hàng và CN theo thời gian gộp
  const mergedItems = [
    ...debtOrders.map((item: any) => ({
      ...item,
      type: 'order' as const,
      sortDate: item.created_at ? new Date(item.created_at).getTime() : 0,
    })),
    ...debtManualEntries.map((item: any) => ({
      ...item,
      type: 'manual' as const,
      sortDate: item.created_at ? new Date(item.created_at).getTime() : 0,
    })),
  ]

  mergedItems.sort((a, b) => b.sortDate - a.sortDate)

  if (!hasAnyHistory) {
    return (
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Lịch sử gộp công nợ</h4>
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
          <p className="text-sm">Chưa có lịch sử gộp công nợ</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">
        {(debtOrders.length > 0 || hasManualEntries) ? 'Lịch sử gộp công nợ' : debt.order_id ? 'Thông tin đơn hàng' : 'Lịch sử gộp công nợ'}
      </h4>
      {debtOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Lưu ý:</span> Các đơn hàng này đã được tự động gộp vào công nợ tổng khi khách hàng xác nhận nhận hàng.
          </p>
        </div>
      )}
      {hasManualEntries && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">💡 Lưu ý:</span> Các công nợ thủ công này đã được đại lý tạo và gộp vào công nợ tổng.
          </p>
        </div>
      )}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="max-h-[200px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại / Mã đơn hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt / Người tạo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gộp vào công nợ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mergedItems.map((item: any) => {
                if (item.type === 'order') {
                  return (
                    <tr 
                      key={`order-${item.id}`} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (item.order_id) {
                          router.push(`/orders?orderId=${item.order_id}&returnTo=debt&debtId=${debt.id}`)
                        }
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatOrderId(item.order_id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {item.order?.created_at
                          ? new Date(item.order.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount)} đ
                      </td>
                    </tr>
                  )
                } else {
                  return (
                    <tr
                      key={`manual-${item.id}`}
                      className="hover:bg-gray-50 bg-purple-50 cursor-pointer"
                      onClick={() => onManualEntryClick(item)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-900">
                        {formatManualDebtId(item.id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {item.createdBy?.name || 'Đại lý'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount)} đ
                      </td>
                    </tr>
                  )
                }
              })}
              {debtOrders.length === 0 && debtManualEntries.length === 0 && debt.order_id && (
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (debt.order_id) {
                      router.push(`/orders?orderId=${debt.order_id}&returnTo=debt&debtId=${debt.id}`)
                    }
                  }}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatOrderId(debt.order_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {debt.created_at
                      ? new Date(debt.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {debt.created_at
                      ? new Date(debt.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(debt.total_amount)} đ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentHistory({
  debt,
  highlightedPaymentId,
  paymentRowRef,
  onNavigate,
}: {
  debt: Debt
  highlightedPaymentId?: number | null
  paymentRowRef?: React.RefObject<HTMLTableRowElement>
  onNavigate: (url: string) => void
}) {
  const payments = debt.payments || []

  const getStatusInfo = (payment: Payment) => {
    const byText = payment.confirmedBy ? ' bởi ' + payment.confirmedBy.name : ''
    if (!payment.status || payment.status === 'confirmed') {
      return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', by: byText }
    }
    if (payment.status === 'pending_confirmation') {
      return { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', by: '' }
    }
    if (payment.status === 'rejected') {
      return { label: 'Từ chối', color: 'bg-red-100 text-red-800', by: byText }
    }
    return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', by: byText }
  }

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Lịch sử thanh toán</h4>
      <div className="bg-white border rounded-lg overflow-hidden">
        {payments.length > 0 ? (
          <div className="max-h-[200px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...payments]
                  .sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                    return dateB - dateA
                  })
                  .map((payment: Payment) => {
                    const statusInfo = getStatusInfo(payment)
                    const isHighlighted = highlightedPaymentId === payment.id
                    const isDebtOffset = payment.payment_method === 'debt_offset'
                    return (
                      <tr
                        key={payment.id}
                        ref={isHighlighted ? paymentRowRef : null}
                        className={`hover:bg-gray-50 cursor-pointer transition-all ${
                          isHighlighted
                            ? 'bg-yellow-100 border-l-4 border-yellow-500 shadow-md'
                            : isDebtOffset
                            ? 'bg-purple-50'
                            : ''
                        }`}
                        onClick={() => onNavigate(`/payments?id=${payment.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <span className={isDebtOffset ? 'text-purple-600' : 'text-green-600'}>
                            {isDebtOffset ? 'Đã bù trừ: ' : ''}{formatCurrency(payment.amount)} đ
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={isDebtOffset ? 'text-purple-700 font-medium' : 'text-gray-900'}>
                            {PAYMENT_METHOD_LABELS[payment.payment_method] || 'Khác'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            {statusInfo.by && <span className="text-xs text-gray-500">{statusInfo.by}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={payment.notes || ''}>
                          {payment.notes || '-'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">Chưa có lịch sử thanh toán</p>
          </div>
        )}
      </div>
    </div>
  )
}
