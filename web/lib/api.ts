import axios from 'axios'
import { getApiUrl } from './config'

// Create axios instance with dynamic baseURL
// baseURL sẽ được set lại trong interceptor để đảm bảo luôn đúng
const api = axios.create({
  baseURL: 'https://api.websi.vn/api', // Default to production, sẽ được override trong interceptor
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token and update baseURL dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Re-evaluate API URL on each request to ensure it's always correct
      // Điều này đảm bảo API URL luôn được detect đúng dựa trên hostname hiện tại
      const apiUrl = getApiUrl()
      config.baseURL = apiUrl
      
      // Debug log (chỉ trong development)
      if (process.env.NODE_ENV === 'development') {
        console.log('API URL:', apiUrl)
      }
      
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    // Don't set Content-Type for FormData - let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        // Clear auth storage
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

