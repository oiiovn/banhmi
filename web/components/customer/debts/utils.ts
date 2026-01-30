// Format currency
export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Format date
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

// Format order ID as BM-XXX
export const formatOrderId = (id: number) => {
  return `BM-${id.toString().padStart(3, '0')}`
}

// Format manual debt entry ID as CN-XXX
export const formatManualDebtId = (id: number) => {
  return `CN-${id.toString().padStart(3, '0')}`
}
