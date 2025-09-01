/**
 * 获取基础URL配置
 */
export const getBaseUrl = (): string => {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // 在客户端使用当前域名
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // 服务端默认值
  return 'http://localhost:3030'
}

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}