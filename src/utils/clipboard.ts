/**
 * 现代化的剪贴板操作工具
 * 支持多种浏览器和环境，提供降级方案
 */

export interface ClipboardResult {
  success: boolean
  error?: string
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<ClipboardResult>
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // 方法1: 现代剪贴板API (推荐)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true }
    } catch (error) {
      console.warn('现代剪贴板API失败:', error)
      // 继续尝试降级方案
    }
  }

  // 方法2: Selection API (现代浏览器兼容)
  if (window.getSelection && document.createRange) {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.cssText = `
        position: fixed;
        top: -999px;
        left: -999px;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: 0;
        border: none;
        outline: none;
        background: transparent;
      `
      
      document.body.appendChild(textArea)
      
      // 使用 Selection API
      const range = document.createRange()
      range.selectNodeContents(textArea)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      
      textArea.select()
      textArea.setSelectionRange(0, text.length)
      
      // 使用现代方法执行复制
      const success = document.execCommand('copy')
      
      document.body.removeChild(textArea)
      selection?.removeAllRanges()
      
      if (success) {
        return { success: true }
      }
    } catch (error) {
      console.warn('Selection API方法失败:', error)
    }
  }

  // 方法3: 传统方法 (兼容老旧浏览器)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (success) {
      return { success: true }
    }
  } catch (error) {
    console.warn('传统复制方法失败:', error)
  }

  return { 
    success: false, 
    error: '浏览器不支持复制功能或复制失败' 
  }
}

/**
 * 检查浏览器是否支持剪贴板功能
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && window.isSecureContext) ||
    document.execCommand ||
    (window.getSelection && document.createRange)
  )
}

/**
 * 获取剪贴板权限状态
 */
export async function getClipboardPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!navigator.permissions) {
    return 'unsupported'
  }

  try {
    const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
    return permission.state
  } catch (error) {
    return 'unsupported'
  }
}