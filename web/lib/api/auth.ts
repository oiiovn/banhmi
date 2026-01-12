import api from '../api'
import { useAuthStore, User } from '../store/authStore'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  address?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: {
      id: number
      name: string
      email: string
      phone?: string
      address?: string
      role: 'admin' | 'agent' | 'customer'
      is_active: boolean
    }
    token: string
  }
  message?: string
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', data)
    if (response.data.success) {
      const { login } = useAuthStore.getState()
      login(response.data.data.token, response.data.data.user)
      // Also store in localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token)
      }
    }
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data)
    if (response.data.success) {
      const { login } = useAuthStore.getState()
      login(response.data.data.token, response.data.data.user)
      // Also store in localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token)
      }
    }
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      const { logout } = useAuthStore.getState()
      logout()
    }
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get<{ success: boolean; data: User }>('/user')
    if (response.data.success) {
      const { updateUser } = useAuthStore.getState()
      // Update user data in store
      updateUser(response.data.data)
    }
    return response.data
  },
}

