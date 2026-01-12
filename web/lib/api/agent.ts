import api from '../api'

export interface AgentStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  preparing_orders: number
  ready_orders: number
  delivered_orders: number
  total_revenue: number
  total_profit: number
}

export interface OrderAuditLog {
  id: number
  order_id: number
  user_id: number
  action: string
  entity_type: string | null
  entity_id: number | null
  old_value: any
  new_value: any
  description: string | null
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
  }
}

export interface Order {
  id: number
  user_id: number
  agent_id: number | null
  total_amount: string
  discount?: string
  status: string
  delivery_address: string
  phone: string
  notes: string | null
  accepted_at?: string | null
  accepted_by?: number | null
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
    email: string
    phone: string | null
  }
  items: Array<{
    id: number
    product_id: number
    quantity: number
    price: string
    product: {
      id: number
      name: string
      image: string | null
      wholesale_price?: string
      unit?: string
      quantity_per_unit?: string
    }
  }>
  audit_logs?: OrderAuditLog[]
  accepted_by_user?: {
    id: number
    name: string
    email: string
  }
  agent?: {
    id: number
    name: string
    email: string
  }
  acceptedBy?: {
    id: number
    name: string
    email: string
  }
  profit?: number
}

export const agentApi = {
  getDashboard: async (): Promise<{ success: boolean; data: AgentStats }> => {
    const response = await api.get('/agent/dashboard')
    return response.data
  },

  getOrders: async (status?: string): Promise<{ success: boolean; data: Order[] }> => {
    const params = status ? { status } : {}
    const response = await api.get('/agent/orders', { params })
    return response.data
  },

  getPendingOrders: async (): Promise<{ success: boolean; data: Order[] }> => {
    const response = await api.get('/agent/orders/pending')
    return response.data
  },

  getPendingOrder: async (id: number): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get(`/agent/orders/pending/${id}`)
    return response.data
  },

  getOrder: async (id: number): Promise<{ success: boolean; data: Order }> => {
    const response = await api.get(`/agent/orders/${id}`)
    return response.data
  },

  updateOrderBeforeAccept: async (
    id: number,
    data: {
      items: Array<{
        item_id?: number
        product_id: number
        quantity: number
      }>
      discount?: number
    }
  ): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.put(`/agent/orders/${id}/edit`, data)
    return response.data
  },

  acceptOrder: async (id: number): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.post(`/agent/orders/${id}/accept`)
    return response.data
  },

  updateOrderStatus: async (
    id: number,
    status: string
  ): Promise<{ success: boolean; data: Order; message: string }> => {
    const response = await api.put(`/agent/orders/${id}/status`, { status })
    return response.data
  },

  // Products
  getProducts: async (categoryId?: number): Promise<{ success: boolean; data: Product[] }> => {
    const params = categoryId ? { category_id: categoryId } : {}
    const response = await api.get('/agent/products', { params })
    return response.data
  },

  getProduct: async (id: number): Promise<{ success: boolean; data: Product }> => {
    const response = await api.get(`/agent/products/${id}`)
    return response.data
  },

  createProduct: async (data: ProductData | FormData): Promise<{ success: boolean; data: Product; message: string }> => {
    // Don't set Content-Type for FormData - axios will set it automatically with boundary
    const config = data instanceof FormData 
      ? {} 
      : { headers: { 'Content-Type': 'application/json' } }
    const response = await api.post('/agent/products', data, config)
    return response.data
  },

  updateProduct: async (id: number, data: Partial<ProductData> | FormData): Promise<{ success: boolean; data: Product; message: string }> => {
    console.log('API: updateProduct called', { id, isFormData: data instanceof FormData })
    
    // Don't set Content-Type for FormData - axios will set it automatically with boundary
    const config: any = {}
    
    if (data instanceof FormData) {
      // For FormData, let axios set Content-Type with boundary automatically
      // Also need to set _method=PUT for Laravel to handle it correctly
      const formData = data as FormData
      formData.append('_method', 'PUT')
      console.log('Using FormData with _method=PUT')
    } else {
      config.headers = { 'Content-Type': 'application/json' }
      console.log('Using JSON data')
    }
    
    const response = await api.post(`/agent/products/${id}`, data, config)
    console.log('API: updateProduct response', response.data)
    return response.data
  },

  deleteProduct: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/agent/products/${id}`)
    return response.data
  },

  getCategories: async (): Promise<{ success: boolean; data: Category[] }> => {
    const response = await api.get('/agent/categories')
    return response.data
  },

  createCategory: async (data: CategoryData): Promise<{ success: boolean; data: Category; message: string }> => {
    const response = await api.post('/agent/categories', data)
    return response.data
  },

  updateCategory: async (id: number, data: Partial<CategoryData>): Promise<{ success: boolean; data: Category; message: string }> => {
    const response = await api.put(`/agent/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/agent/categories/${id}`)
    return response.data
  },

  // Debts
  getDebts: async (status?: string, customerId?: number): Promise<{ success: boolean; data: Debt[]; stats: DebtStats }> => {
    const params: any = {}
    if (status) params.status = status
    if (customerId) params.customer_id = customerId
    const response = await api.get('/agent/debts', { params })
    return response.data
  },

  getDebt: async (id: number): Promise<{ success: boolean; data: Debt }> => {
    const response = await api.get(`/agent/debts/${id}`)
    return response.data
  },

  updateDebt: async (id: number, data: { due_date?: string; notes?: string }): Promise<{ success: boolean; data: Debt; message: string }> => {
    const response = await api.put(`/agent/debts/${id}`, data)
    return response.data
  },

  // Payments
  getPayments: async (debtId?: number, customerId?: number, fromDate?: string, toDate?: string): Promise<{ success: boolean; data: Payment[]; stats: PaymentStats }> => {
    const params: any = {}
    if (debtId) params.debt_id = debtId
    if (customerId) params.customer_id = customerId
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    const response = await api.get('/agent/payments', { params })
    return response.data
  },

  getPayment: async (id: number): Promise<{ success: boolean; data: Payment }> => {
    const response = await api.get(`/agent/payments/${id}`)
    return response.data
  },

  createPayment: async (data: PaymentData): Promise<{ success: boolean; data: Payment; message: string }> => {
    const response = await api.post('/agent/payments', data)
    return response.data
  },

  getPendingPayments: async (): Promise<{ success: boolean; data: Payment[]; count: number }> => {
    const response = await api.get('/agent/payments/pending')
    return response.data
  },

  confirmPayment: async (id: number): Promise<{ success: boolean; data: Payment; message: string }> => {
    const response = await api.post(`/agent/payments/${id}/confirm`)
    return response.data
  },

  rejectPayment: async (id: number): Promise<{ success: boolean; data: Payment; message: string }> => {
    const response = await api.post(`/agent/payments/${id}/reject`)
    return response.data
  },
}

export interface CategoryData {
  name: string
  description?: string
  image?: string
}

export interface Product {
  id: number
  sku?: string
  name: string
  description?: string
  price: string
  wholesale_price?: string
  original_price?: string
  unit?: string
  quantity_per_unit?: string
  image?: string
  category_id: number
  is_available: boolean
  category?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  image?: string
}

export interface ProductData {
  sku?: string
  name: string
  description?: string
  price: number
  wholesale_price?: number
  original_price?: number
  unit?: string
  quantity_per_unit?: number
  image?: string
  category_id: number
  is_available?: boolean
}

export interface DebtOrder {
  id: number
  debt_id: number
  order_id: number
  amount: string
  order?: Order
}

export interface Debt {
  id: number
  order_id: number | null // Nullable for consolidated debt
  customer_id: number
  agent_id: number
  total_amount: string
  paid_amount: string
  remaining_amount: string
  status: 'pending' | 'partial' | 'paid' | 'cancelled'
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order?: Order // For backward compatibility (single order)
  orders?: Order[] // For consolidated debt (multiple orders)
  debtOrders?: DebtOrder[] // Pivot table records with order details
  debt_orders?: DebtOrder[] // Backend returns snake_case
  customer?: {
    id: number
    name: string
    email: string
    phone: string | null
  }
  agent?: {
    id: number
    name: string
    email: string
  }
  payments?: Payment[]
}

export interface DebtStats {
  total_debts: number
  total_amount: number
  total_paid: number
  total_remaining: number
  pending_count: number
  partial_count: number
  paid_count: number
}

export interface Payment {
  id: number
  debt_id: number
  customer_id: number
  agent_id: number
  amount: string
  payment_method: 'cash' | 'bank_transfer' | 'other'
  payment_date: string
  notes: string | null
  status?: 'pending_confirmation' | 'confirmed' | 'rejected'
  confirmed_at?: string | null
  confirmed_by?: number | null
  created_at: string
  updated_at: string
  debt?: Debt
  customer?: {
    id: number
    name: string
    email: string
  }
  agent?: {
    id: number
    name: string
    email: string
  }
  confirmedBy?: {
    id: number
    name: string
    email: string
  } | null
}

export interface PaymentStats {
  total_payments: number
  total_amount: number
}

export interface PaymentData {
  debt_id: number
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'other'
  payment_date: string
  notes?: string
}

