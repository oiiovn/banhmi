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
    const protocol = window.location.protocol
    
    // Nếu đang ở trên domain websi.vn (production cụ thể)
    if (origin.includes('websi.vn') || hostname.includes('websi.vn')) {
      // Thử subdomain api.websi.vn trước (phổ biến nhất)
      // Nếu không hoạt động, có thể thử cùng domain websi.vn/api
      const domain = hostname.replace('www.', '')
      return `${protocol}//api.${domain}/api`
    }
    
    // Nếu không phải localhost, local IP -> tự động detect API URL dựa trên domain hiện tại
    if (
      hostname !== 'localhost' && 
      hostname !== '127.0.0.1' && 
      !hostname.startsWith('192.168.') &&
      !hostname.startsWith('10.') &&
      !hostname.startsWith('172.') &&
      hostname !== '' &&
      hostname !== '0.0.0.0'
    ) {
      // Tự động detect API URL dựa trên domain hiện tại
      // Thử các pattern phổ biến:
      
      // Pattern 1: Nếu đang ở subdomain www hoặc không có subdomain
      // Thử dùng api.{hostname} hoặc cùng domain
      if (hostname.startsWith('www.')) {
        // Nếu có www, bỏ www và thêm api
        const domain = hostname.replace('www.', '')
        return `${protocol}//api.${domain}/api`
      } else if (hostname.startsWith('api.')) {
        // Nếu đã ở subdomain api, dùng cùng domain
        return `${origin}/api`
      } else {
        // Pattern 2: Thử subdomain api trước
        // Nếu không có subdomain, thử api.{hostname}
        return `${protocol}//api.${hostname}/api`
      }
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

