import api from '../api'

export interface AgentData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  address?: string
}

export interface Agent {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  role: 'agent'
  is_active: boolean
  agent_orders_count?: number
}

export const adminApi = {
  // Agents
  getAgents: async (): Promise<{ success: boolean; data: Agent[] }> => {
    const response = await api.get('/admin/agents')
    return response.data
  },

  createAgent: async (data: AgentData): Promise<{ success: boolean; data: Agent; message: string }> => {
    const response = await api.post('/admin/agents', data)
    return response.data
  },

  updateAgent: async (id: number, data: Partial<AgentData>): Promise<{ success: boolean; data: Agent; message: string }> => {
    const response = await api.put(`/admin/agents/${id}`, data)
    return response.data
  },

  deleteAgent: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/agents/${id}`)
    return response.data
  },

  // Dashboard
  getDashboard: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },
}




