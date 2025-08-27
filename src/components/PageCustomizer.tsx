'use client'

import { useState } from 'react'
import { MessageCircle, Send, Sparkles, Palette, Layout, X } from 'lucide-react'

interface CustomizationRequest {
  id: string
  userMessage: string
  aiResponse: string
  timestamp: Date
}

interface PageCustomizerProps {
  isOpen: boolean
  onClose: () => void
  onTemplateChange: (template: 'original' | 'minimal' | 'detailed') => void
  currentTemplate: 'original' | 'minimal' | 'detailed'
}

export default function PageCustomizer({ isOpen, onClose, onTemplateChange, currentTemplate }: PageCustomizerProps) {
  const [messages, setMessages] = useState<CustomizationRequest[]>([
    {
      id: '1',
      userMessage: '',
      aiResponse: '您好！我可以帮您调整页面布局和样式。您可以说：\n\n• "让页面更简洁一些"\n• "我想要更详细的展示"\n• "改成卡片式布局"\n• "使用更鲜艳的颜色"\n\n请告诉我您想要什么样的效果？',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock AI响应逻辑
  const getMockResponse = (userInput: string): { response: string; template: 'original' | 'minimal' | 'detailed' } => {
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('简洁') || lowerInput.includes('简单') || lowerInput.includes('清爽') || lowerInput.includes('极简')) {
      return {
        response: '好的！我已经为您切换到简洁模式。这个布局采用极简设计，去除了多余的装饰元素，让行程信息更加清晰易读。主要特点：\n\n✨ 纯白背景，视觉更清爽\n📝 简洁的时间线布局\n🎯 突出重点信息\n\n您觉得这样的效果如何？',
        template: 'minimal'
      }
    }
    
    if (lowerInput.includes('详细') || lowerInput.includes('丰富') || lowerInput.includes('完整') || lowerInput.includes('豪华') || lowerInput.includes('精美')) {
      return {
        response: '很棒的选择！我已经为您切换到详细展示模式。这个布局提供了更丰富的视觉体验和更多信息展示。主要特点：\n\n🌈 渐变色彩，视觉效果更佳\n📊 统计数据卡片展示\n🎨 行程亮点特别区域\n🗺️ 完整的地图和时间表视图\n\n这样的布局更适合分享和展示！',
        template: 'detailed'
      }
    }
    
    if (lowerInput.includes('原来') || lowerInput.includes('默认') || lowerInput.includes('标准') || lowerInput.includes('恢复')) {
      return {
        response: '已经为您恢复到原始布局。这是标准的分享页面模式，平衡了信息展示和视觉美观。主要特点：\n\n⚖️ 信息与美观的完美平衡\n📱 响应式设计，各设备兼容\n🔧 完整的功能支持\n\n这是最通用的展示方式。',
        template: 'original'
      }
    }

    if (lowerInput.includes('颜色') || lowerInput.includes('配色') || lowerInput.includes('主题')) {
      return {
        response: '关于颜色和主题的调整：\n\n当前我支持三种主要布局风格：\n• 简洁模式：纯白背景 + 灰色系\n• 详细模式：渐变背景 + 多彩配色\n• 标准模式：经典蓝白配色\n\n您可以说"切换到简洁模式"或"我要详细展示"来改变整体视觉风格。',
        template: currentTemplate
      }
    }

    // 默认响应
    return {
      response: `我理解您想要${userInput}的效果。目前我可以为您提供以下布局选项：\n\n🎨 **简洁模式**：极简设计，突出内容\n🌈 **详细模式**：丰富视觉，完整展示\n📋 **标准模式**：平衡美观与实用\n\n您想试试哪一种？或者您可以更具体地描述您想要的效果。`,
      template: currentTemplate
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // 添加用户消息
    const newUserMessage: CustomizationRequest = {
      id: Date.now().toString(),
      userMessage,
      aiResponse: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])

    // 模拟AI处理时间
    setTimeout(() => {
      const { response, template } = getMockResponse(userMessage)
      
      const aiMessage: CustomizationRequest = {
        id: (Date.now() + 1).toString(),
        userMessage: '',
        aiResponse: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // 应用模板变化
      if (template !== currentTemplate) {
        onTemplateChange(template)
      }
      
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { text: '让页面更简洁', icon: Layout },
    { text: '我要详细展示', icon: Sparkles },
    { text: '调整颜色主题', icon: Palette },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                页面定制助手
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                通过自然语言调整页面布局和样式
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.userMessage && (
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                    <p className="text-sm">{message.userMessage}</p>
                  </div>
                </div>
              )}
              
              {message.aiResponse && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-purple-500">AI助手</span>
                    </div>
                    <div className="text-sm whitespace-pre-line">{message.aiResponse}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-gray-500">AI正在思考...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action.text)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述您想要的页面效果..."
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-gray-200 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}