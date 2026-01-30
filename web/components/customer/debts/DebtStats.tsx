'use client'

import { DebtStats as DebtStatsType } from '@/lib/api/agent'
import { formatCurrency } from './utils'

interface DebtStatsProps {
  stats: DebtStatsType | null
}

export default function DebtStats({ stats }: DebtStatsProps) {
  if (!stats) return null

  return (
    <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Tổng công nợ</div>
        <div className="text-2xl font-bold text-gray-900">{stats.total_debts}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Tổng số tiền</div>
        <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_amount)} đ</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Đã thanh toán</div>
        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid)} đ</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Còn lại</div>
        <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_remaining)} đ</div>
      </div>
    </div>
  )
}
