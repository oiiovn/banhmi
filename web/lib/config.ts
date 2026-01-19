/**
 * Configuration utilities
 * Centralized configuration for the application
 */

/**
 * Kiểm tra xem đang chạy trên LOCAL hay PRODUCTION
 * Tách biệt hoàn toàn để tránh xung đột
 */
const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: chỉ local khi đang development
    return process.env.NODE_ENV !== 'production'
  }
  
  const hostname = window.location.hostname
  
  // LOCAL: Chỉ các hostname này được coi là local
  return (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname === '0.0.0.0'
  )
}

/**
 * Auto-detect API URL based on environment
 * TÁCH BIỆT HOÀN TOÀN giữa LOCAL và PRODUCTION
 * Đảm bảo URL LUÔN đúng format cho mọi browser (desktop và mobile)
 */
const detectApiUrl = (): string => {
  // ===== LOCAL DEVELOPMENT =====
  if (isLocalEnvironment()) {
    // LOCAL: LUÔN LUÔN dùng localhost:8000
    // KHÔNG BAO GIỜ check env variables trên local
    return 'http://localhost:8000/api'
  }
  
  // ===== PRODUCTION =====
  // Chỉ chạy khi KHÔNG phải local
  if (typeof window === 'undefined') {
    // Server-side render trên production -> không nên xảy ra với static export
    // Nhưng nếu có thì dùng env variable
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.websi.vn/api'
  }
  
  const hostname = window.location.hostname
  
  // Priority 1: Kiểm tra trong window.__NEXT_DATA__ (cho static export)
  // Next.js sẽ embed env variables vào đây khi build
  const nextData = (window as any).__NEXT_DATA__
  if (nextData && nextData.env && nextData.env.NEXT_PUBLIC_API_URL) {
    const envUrl = nextData.env.NEXT_PUBLIC_API_URL
    // Đảm bảo URL từ env đúng format
    if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
      const finalUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`
      // Đảm bảo luôn dùng https:// cho production
      return finalUrl.replace(/^http:\/\//, 'https://')
    }
  }
  
  // Priority 2: Nếu đang ở trên domain websi.vn -> LUÔN dùng https://api.websi.vn/api
  // Đây là cách đơn giản và chắc chắn nhất
  if (hostname.includes('websi.vn')) {
    return 'https://api.websi.vn/api'
  }
  
  // Priority 3: Tự động detect dựa trên hostname (chỉ trên production)
  // QUAN TRỌNG: Luôn dùng https:// cho production, không phụ thuộc vào protocol từ browser
  // Điều này đảm bảo hoạt động đúng trên mọi mobile browser
  
  // Nếu không phải localhost -> tự động detect API URL
  if (hostname.startsWith('www.')) {
    const domain = hostname.replace('www.', '')
    // LUÔN dùng https:// cho production
    return `https://api.${domain}/api`
  } else if (hostname.startsWith('api.')) {
    // Nếu đang ở subdomain api. -> dùng origin hiện tại với https
    return `https://${hostname}/api`
  } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Chỉ detect nếu không phải localhost
    // LUÔN dùng https:// cho production
    return `https://api.${hostname}/api`
  }
  
  // KHÔNG BAO GIỜ fallback về localhost trên production
  // Nếu đến đây nghĩa là có vấn đề -> dùng default production
  console.error('⚠️ Không thể detect API URL. Hostname:', hostname)
  return 'https://api.websi.vn/api' // Default production - LUÔN dùng https://
}

/**
 * Get API base URL (without /api suffix)
 * Đảm bảo luôn trả về URL đúng format
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = detectApiUrl()
  // Loại bỏ /api ở cuối
  let baseUrl = apiUrl.replace(/\/api$/, '')
  
  // Đảm bảo URL có protocol đúng (http:// hoặc https://)
  // Tránh trường hợp thiếu // (ví dụ: https:/.websi.vn)
  if (baseUrl.startsWith('http:') && !baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http:', 'http://')
  }
  if (baseUrl.startsWith('https:') && !baseUrl.startsWith('https://')) {
    baseUrl = baseUrl.replace('https:', 'https://')
  }
  
  return baseUrl
}

/**
 * Get API full URL (with /api suffix)
 */
export const getApiUrl = (): string => {
  return detectApiUrl()
}

/**
 * Check if running in production
 * Sử dụng hostname để check chính xác hơn
 */
export const isProduction = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production'
  }
  return !isLocalEnvironment()
}

/**
 * Check if running in local development
 */
export const isLocal = (): boolean => {
  return isLocalEnvironment()
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

/**
 * Get full image URL from API
 * Xử lý đường dẫn ảnh từ API (có thể là relative hoặc absolute)
 * TÁCH BIỆT logic cho LOCAL và PRODUCTION
 * QUAN TRỌNG: Nếu API đã trả về full URL đúng → GIỮ NGUYÊN, không thay đổi
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null
  }
  
  // Loại bỏ khoảng trắng ở đầu và cuối
  imagePath = imagePath.trim()
  
  // Nếu rỗng sau khi trim → return null
  if (!imagePath) {
    return null
  }
  
  const isLocal = isLocalEnvironment()
  
  // Nếu đã là full URL (bắt đầu bằng http:// hoặc https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      const url = new URL(imagePath)
      
      // Nếu đang ở LOCAL và URL là localhost → GIỮ NGUYÊN
      if (isLocal && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        return imagePath
      }
      
      // Nếu đang ở PRODUCTION
      if (!isLocal) {
        // Nếu URL là localhost → THAY THẾ bằng production URL
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          const apiBaseUrl = getApiBaseUrl()
          return `${apiBaseUrl}${url.pathname}`
        }
        
        // Nếu URL đã có domain đúng (api.websi.vn hoặc websi.vn) → GIỮ NGUYÊN
        // Đây là trường hợp phổ biến nhất - API đã trả về URL đúng
        if (url.hostname.includes('websi.vn') || url.hostname.includes('api.')) {
          // Chỉ sửa protocol nếu cần (http → https)
          if (url.protocol === 'http:' && typeof window !== 'undefined' && window.location.protocol === 'https:') {
            return imagePath.replace('http://', 'https://')
          }
          // GIỮ NGUYÊN URL đã đúng - KHÔNG THAY ĐỔI GÌ
          return imagePath
        }
        
        // Nếu URL có domain khác → thay thế bằng API base URL
        const apiBaseUrl = getApiBaseUrl()
        const apiUrlObj = new URL(apiBaseUrl)
        if (url.hostname !== apiUrlObj.hostname) {
          return `${apiBaseUrl}${url.pathname}`
        }
        
        // Nếu protocol không đúng (http vs https) → sửa
        if (url.protocol === 'http:' && apiUrlObj.protocol === 'https:') {
          return imagePath.replace('http://', 'https://')
        }
        
        // Mặc định: giữ nguyên URL
        return imagePath
      }
    } catch (e) {
      // Nếu không parse được URL → xử lý như relative path
      console.warn('⚠️ Không thể parse URL:', imagePath, e)
    }
  }
  
  // Xử lý relative path (chỉ khi không phải full URL)
  const apiBaseUrl = getApiBaseUrl()
  let finalPath = imagePath
  
  // Nếu bắt đầu bằng /storage/ → giữ nguyên
  if (imagePath.startsWith('/storage/')) {
    finalPath = imagePath
  }
  // Nếu bắt đầu bằng storage/ (không có /) → thêm / ở đầu
  else if (imagePath.startsWith('storage/')) {
    finalPath = `/${imagePath}`
  }
  // Nếu chỉ bắt đầu bằng / → có thể là /products/image.jpg → thêm storage
  else if (imagePath.startsWith('/')) {
    // Nếu không có storage trong path → thêm storage
    if (!imagePath.includes('storage')) {
      finalPath = `/storage${imagePath}`
    } else {
      finalPath = imagePath
    }
  }
  // Nếu không có / ở đầu → thêm /storage/
  else {
    finalPath = `/storage/${imagePath}`
  }
  
  const fullUrl = `${apiBaseUrl}${finalPath}`
  
  // Debug log CHỈ trên local để tránh spam console trên production
  if (typeof window !== 'undefined' && isLocal) {
    console.log('🖼️ [LOCAL] Image URL:', {
      original: imagePath,
      processed: finalPath,
      fullUrl: fullUrl,
      apiBaseUrl: apiBaseUrl
    })
  }
  
  return fullUrl
}

