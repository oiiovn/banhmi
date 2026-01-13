/**
 * Configuration utilities
 * Centralized configuration for the application
 */

/**
 * Auto-detect API URL based on environment
 * Logic này chạy ở client-side (browser) để detect đúng API URL
 */
const detectApiUrl = (): string => {
  // Priority 1: Environment variable (build time) - nếu có thì dùng luôn
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Priority 2: Check origin/hostname (client-side only)
  // Đây là cách chính xác nhất để detect production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const hostname = window.location.hostname
    
    // Nếu đang ở trên domain websi.vn (production)
    if (origin.includes('websi.vn') || hostname.includes('websi.vn')) {
      return 'https://api.websi.vn/api'
    }
    
    // Nếu không phải localhost, local IP, hoặc empty -> dùng production
    if (
      hostname !== 'localhost' && 
      hostname !== '127.0.0.1' && 
      !hostname.startsWith('192.168.') &&
      !hostname.startsWith('10.') &&
      !hostname.startsWith('172.') &&
      hostname !== '' &&
      hostname !== '0.0.0.0'
    ) {
      // Nếu không phải localhost -> có thể là production hoặc staging
      // Mặc định dùng production API
      return 'https://api.websi.vn/api'
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api'
}

/**
 * Get API base URL (without /api suffix)
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = detectApiUrl()
  return apiUrl.replace('/api', '')
}

/**
 * Get API full URL (with /api suffix)
 */
export const getApiUrl = (): string => {
  return detectApiUrl()
}

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get image domains from environment
 */
export const getImageDomains = (): string[] => {
  const domains = process.env.NEXT_PUBLIC_IMAGE_DOMAINS
  if (domains) {
    return domains.split(',').map(d => d.trim())
  }
  return ['localhost']
}

