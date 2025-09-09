// Service Worker 注册和管理
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker 不支持或在服务端环境')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    
    console.log('✅ Service Worker 注册成功:', registration.scope)
    
    // 等待Service Worker激活
    if (registration.waiting) {
      await new Promise<void>((resolve) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve()
        })
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Service Worker 注册失败:', error)
    return false
  }
}

// 检查Service Worker是否已激活
export function isServiceWorkerReady(): boolean {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         navigator.serviceWorker.controller !== null
}

// 初始化Service Worker (在应用启动时调用)
export async function initServiceWorker(): Promise<void> {
  if (typeof window !== 'undefined') {
    const success = await registerServiceWorker()
    if (success) {
      console.log('🔄 Service Worker 初始化完成')
    }
  }
}