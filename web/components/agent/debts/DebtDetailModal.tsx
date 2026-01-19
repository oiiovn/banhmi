'use client'

import { useRouter } from 'next/navigation'
import { Debt } from '@/lib/api/agent'
import { formatCurrency, formatDate, formatDateTime } from './utils'
import { STATUS_COLORS, STATUS_LABELS } from './constants'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  debt_offset: 'Bù trừ công nợ',
  other: 'Khác',
}

// Format order ID as BM-XXX
const formatOrderId = (id: number) => {
  return `BM-${id.toString().padStart(3, '0')}`
}

interface DebtDetailModalProps {
  debt: Debt | null
  onClose: () => void
}

export default function DebtDetailModal({ debt, onClose }: DebtDetailModalProps) {
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

            <div className="space-y-4">
              {/* Debt Info */}
              <DebtInfo debt={debt} />

              {/* Orders List */}
              <OrdersList debt={debt} />

              {/* Payment History */}
              <PaymentHistory debt={debt} onNavigate={(url) => router.push(url)} />
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
          <span className="font-medium">Khách hàng:</span> {debt.customer?.name || '-'}
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
          <span className="text-green-600 font-bold">
            {formatCurrency(debt.paid_amount)} đ
          </span>
        </div>
        <div>
          <span className="font-medium">Còn lại:</span>{' '}
          <span className="text-red-600 font-bold">
            {formatCurrency(debt.remaining_amount)} đ
          </span>
        </div>
        <div>
          <span className="font-medium">Trạng thái:</span>{' '}
          <span
            className={'px-2 py-1 rounded-full text-xs font-bold ' + (STATUS_COLORS[debt.status] || 'bg-gray-100 text-gray-800')}
          >
            {STATUS_LABELS[debt.status] || debt.status}
          </span>
        </div>
      </div>
    </div>
  )
}

function OrdersList({ debt }: { debt: Debt }) {
  const hasOrders = (debt.debtOrders && debt.debtOrders.length > 0) || 
                    (debt.order_id && (!debt.debtOrders || debt.debtOrders.length === 0))
  
  if (!hasOrders) return null

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">
        {debt.debtOrders && debt.debtOrders.length > 0
          ? 'Lịch sử gộp công nợ'
          : 'Thông tin đơn hàng'}
      </h4>
      {debt.debtOrders && debt.debtOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Lưu ý:</span> Các đơn hàng này đã được tự động gộp vào công nợ tổng khi khách hàng xác nhận nhận hàng.
          </p>
        </div>
      )}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="max-h-[200px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày đặt hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày gộp vào công nợ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debt.debtOrders && debt.debtOrders.length > 0 ? (
                [...debt.debtOrders]
                  .sort((a, b) => {
                    const dateA = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0
                    const dateB = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0
                    return dateB - dateA
                  })
                  .map((debtOrder) => (
                    <tr key={debtOrder.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatOrderId(debtOrder.order_id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {debtOrder.order?.created_at
                          ? new Date(debtOrder.order.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {(debtOrder as any).created_at
                          ? formatDateTime((debtOrder as any).created_at)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(debtOrder.amount)} đ
                      </td>
                    </tr>
                  ))
              ) : debt.order_id ? (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatOrderId(debt.order_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {debt.order?.created_at
                      ? new Date(debt.order.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : debt.created_at
                      ? new Date(debt.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {debt.created_at ? formatDateTime(debt.created_at) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(debt.total_amount)} đ
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PaymentHistory({ debt, onNavigate }: { debt: Debt; onNavigate: (url: string) => void }) {
  if (!debt.payments || debt.payments.length === 0) return null

  const getStatusInfo = (status?: string, confirmedByName?: string) => {
    const byText = confirmedByName ? ' bởi ' + confirmedByName : ''
    if (!status || status === 'confirmed') {
      return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', by: byText }
    }
    if (status === 'pending_confirmation') {
      return { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', by: '' }
    }
    if (status === 'rejected') {
      return { label: 'Từ chối', color: 'bg-red-100 text-red-800', by: byText }
    }
    return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800', by: byText }
  }

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Lịch sử thanh toán</h4>
      <div className="bg-white border rounded-lg overflow-hidden">
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
              {[...debt.payments]
                .sort((a, b) => {
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                  return dateB - dateA
                })
                .map((payment) => {
                  const statusInfo = getStatusInfo(payment.status, payment.confirmedBy?.name)
                  const paymentUrl = '/payments?id=' + payment.id
                  const isDebtOffset = payment.payment_method === 'debt_offset'
                  
                  return (
                    <tr 
                      key={payment.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isDebtOffset ? 'bg-purple-50' : ''}`}
                      onClick={() => onNavigate(paymentUrl)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col">
                          <span className={isDebtOffset ? 'text-purple-600' : 'text-green-600'}>
                            {isDebtOffset ? 'Đã bù trừ: ' : ''}{formatCurrency(payment.amount)} đ
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={isDebtOffset ? 'text-purple-700 font-medium' : 'text-gray-900'}>
                          {PAYMENT_METHOD_LABELS[payment.payment_method] || 'Khác'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={'px-2 py-1 text-xs font-medium rounded-full ' + statusInfo.color}>
                            {statusInfo.label}
                          </span>
                          {statusInfo.by && (
                            <span className="text-xs text-gray-500">{statusInfo.by}</span>
                          )}
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
      </div>
    </div>
  )
}
