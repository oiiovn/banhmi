import axios from 'axios'
import { getApiUrl } from './config'

// Create axios instance with dynamic baseURL
// baseURL sẽ được set lại trong interceptor để đảm bảo luôn đúng
// TÁCH BIỆT: Local sẽ dùng localhost, Production sẽ dùng api.websi.vn
const api = axios.create({
  baseURL: typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  ) ? 'http://localhost:8000/api' : 'https://api.websi.vn/api', // Default, sẽ được override trong interceptor
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 giây timeout cho mobile network
  withCredentials: false, // Không gửi credentials để tránh CORS issue
})

// Request interceptor to add token and update baseURL dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      
      // ===== LOCAL: LUÔN DÙNG localhost:8000 =====
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        // LOCAL: CỐ ĐỊNH dùng localhost:8000, không check env variables
        config.baseURL = 'http://localhost:8000/api'
        console.log('🌐 [LOCAL] API URL: http://localhost:8000/api')
      } else {
        // ===== PRODUCTION: Dùng API production =====
        let apiUrl = getApiUrl()
        
        // Đảm bảo URL đúng format (fix cho mobile browser)
        // QUAN TRỌNG: Normalize URL để đảm bảo luôn đúng format
        
        // Bước 1: Đảm bảo có protocol
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
          // Nếu không có protocol, thêm https:// (production luôn dùng https)
          apiUrl = `https://${apiUrl}`
        }
        
        // Bước 2: Sửa protocol nếu sai format (https:/.websi.vn -> https://api.websi.vn)
        apiUrl = apiUrl.replace(/^https?:[/]*([^/])/, (match, char) => {
          if (match.startsWith('https')) return `https://${char}`
          return `http://${char}`
        })
        
        // Bước 3: Loại bỏ // thừa (nhưng giữ // sau protocol)
        apiUrl = apiUrl.replace(/([^:])\/\/+/g, '$1//')
        
        // Bước 4: Đảm bảo URL kết thúc bằng /api
        apiUrl = apiUrl.replace(/\/+$/, '') // Loại bỏ / ở cuối
        if (!apiUrl.endsWith('/api')) {
          apiUrl = `${apiUrl}/api`
        }
        
        // Bước 5: Trên production, LUÔN dùng https:// (không phụ thuộc vào browser)
        apiUrl = apiUrl.replace(/^http:\/\//, 'https://')
        
        config.baseURL = apiUrl
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

