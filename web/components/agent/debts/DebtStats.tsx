'use client'

import { DebtStats as DebtStatsType } from '@/lib/api/agent'
import { formatCurrency } from './utils'

interface DebtStatsProps {
  stats: DebtStatsType | null
}

export default function DebtStats({ stats }: DebtStatsProps) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="text-xs text-gray-600 mb-1">Tổng công nợ</div>
        <div className="text-xl font-bold text-gray-900">{stats.total_debts}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="text-xs text-gray-600 mb-1">Tổng số tiền</div>
        <div className="text-lg font-bold text-blue-600">{formatCurrency(stats.total_amount)} đ</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="text-xs text-gray-600 mb-1">Đã thanh toán</div>
        <div className="text-lg font-bold text-green-600">{formatCurrency(stats.total_paid)} đ</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="text-xs text-gray-600 mb-1">Còn lại</div>
        <div className="text-lg font-bold text-red-600">{formatCurrency(stats.total_remaining)} đ</div>
      </div>
    </div>
  )
}
