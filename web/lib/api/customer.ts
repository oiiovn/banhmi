import api from '../api'
import { Debt, DebtStats, Payment, PaymentStats, PaymentData } from './agent'

export const customerApi = {
  // Debts
  getDebts: async (status?: string): Promise<{ success: boolean; data: Debt[]; stats: DebtStats }> => {
    const params = status ? { status } : {}
    const response = await api.get('/debts', { params })
    return response.data
  },

  getDebt: async (id: number): Promise<{ success: boolean; data: Debt }> => {
    const response = await api.get(`/debts/${id}`)
    return response.data
  },

  // Payments
  getPayments: async (debtId?: number, fromDate?: string, toDate?: string): Promise<{ success: boolean; data: Payment[]; stats: PaymentStats }> => {
    const params: any = {}
    if (debtId) params.debt_id = debtId
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    const response = await api.get('/payments', { params })
    return response.data
  },

  getPayment: async (id: number): Promise<{ success: boolean; data: Payment }> => {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  createPayment: async (data: PaymentData): Promise<{ success: boolean; data: Payment; message: string }> => {
    const response = await api.post('/payments', data)
    return response.data
  },
}





