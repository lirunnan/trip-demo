/**
 * 系统消息工具类
 * 提供发送系统消息的全局方法
 */

let sendSystemMessageCallback: ((content: string) => void) | null = null

/**
 * 注册系统消息发送回调
 * @param callback 发送系统消息的回调函数
 */
export const registerSystemMessageSender = (callback: (content: string) => void) => {
  sendSystemMessageCallback = callback
}

/**
 * 发送系统消息
 * @param content 消息内容，当内容为 "done" 时将隐藏系统消息
 */
export const sendSystemMessage = (content: string) => {
  if (sendSystemMessageCallback) {
    sendSystemMessageCallback(content)
  } else {
    console.warn('系统消息发送器未注册，请在页面加载后再尝试发送消息')
  }
}

/**
 * 清除系统消息（发送 "done" 消息）
 */
export const clearSystemMessage = () => {
  sendSystemMessage('done')
}

/**
 * 发送加载消息
 * @param message 加载消息内容
 */
export const sendLoadingMessage = (message: string) => {
  sendSystemMessage(`🔄 ${message}`)
}

/**
 * 发送成功消息
 * @param message 成功消息内容
 */
export const sendSuccessMessage = (message: string) => {
  sendSystemMessage(`✅ ${message}`)
}

/**
 * 发送错误消息
 * @param message 错误消息内容
 */
export const sendErrorMessage = (message: string) => {
  sendSystemMessage(`❌ ${message}`)
}

/**
 * 发送进度消息
 * @param message 进度消息内容
 */
export const sendProgressMessage = (message: string) => {
  sendSystemMessage(`⏳ ${message}`)
}