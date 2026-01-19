export const DEBT_STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chưa thanh toán' },
  { value: 'partial', label: 'Thanh toán một phần' },
  { value: 'paid', label: 'Đã thanh toán' },
]

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
}
