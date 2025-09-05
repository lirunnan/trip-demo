'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { MessageCircle, Send, Sparkles, Palette, Layout, Users, Share2 } from 'lucide-react'
import { getBaseUrl } from '@/utils/config'

interface CustomizationRequest {
  id: string
  userMessage: string
  aiResponse: string
  timestamp: Date
}

interface PageCustomizerProps {
  onTemplateChange: (template: 'original' | 'minimal' | 'detailed') => void
  currentTemplate: 'original' | 'minimal' | 'detailed'
  className?: string
  onShowCommunity?: () => void
  onAddAdoptionMessage?: (addAdoptionFunc: (templateTitle: string, shareUrl: string) => void) => void
  isWebMode?: boolean
  webUrl?: string
  onAddShareMessage?: (messageFunc: (actionType: 'trip' | 'page', url: string) => void) => void
  guideId?: string
  onUpgradeRequest?: () => void
}

export default function PageCustomizer({ 
  onTemplateChange, 
  currentTemplate, 
  className = '', 
  onShowCommunity, 
  onAddAdoptionMessage,
  isWebMode = false,
  webUrl = '',
  onAddShareMessage,
  guideId,
  onUpgradeRequest
}: PageCustomizerProps) {
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

  // 分享Web行程URL
  const handleShareWebUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(webUrl)
      
      // 添加成功提示消息
      const successMessage: CustomizationRequest = {
        id: Date.now().toString(),
        userMessage: '分享行程URL',
        aiResponse: `✅ 行程URL已复制到剪贴板！
        
🔗 **链接地址**: ${webUrl}

您可以将此链接发送给朋友，让他们直接访问这个精彩的魔法之旅页面！`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('复制失败:', error)
      
      // 添加失败提示消息
      const errorMessage: CustomizationRequest = {
        id: Date.now().toString(),
        userMessage: '分享行程URL',
        aiResponse: '抱歉，复制链接时出现了问题，请稍后再试。',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }, [webUrl])

  // 添加分享消息的方法
  const addShareMessage = useCallback((actionType: 'trip' | 'page', url: string) => {
    const actionText = actionType === 'trip' ? '分享行程' : '定制分享页'
    const userMessage = actionText
    const aiResponse = `✅ ${actionText}链接已复制到剪贴板！

🔗 **链接地址**: ${url}

${actionType === 'trip' 
  ? '您可以将此链接发送给朋友，让他们直接查看精彩的旅行内容！'
  : '您可以将此定制分享页链接发送给朋友，他们可以看到完整的定制界面和所有功能！'
}`
    
    const newMessage: CustomizationRequest = {
      id: Date.now().toString(),
      userMessage,
      aiResponse,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
  }, [])

  // 注册分享消息函数
  useEffect(() => {
    if (onAddShareMessage) {
      onAddShareMessage(addShareMessage)
    }
  }, [onAddShareMessage, addShareMessage])

  // 添加采纳消息的方法
  const addAdoptionMessage = useCallback((templateTitle: string, shareUrl: string) => {
    const userMessage = `一键采纳${templateTitle}`
    const aiResponse = `✅ 已成功采纳攻略模板！

📋 **模板名称**: <a href="${getBaseUrl()}${shareUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${templateTitle}</a>
🔗 **来源**: ${getBaseUrl()}${shareUrl}

这个模板的设计和布局将作为您当前页面的参考。您可以继续和我对话来进一步调整细节，比如：

• 调整颜色搭配
• 修改布局样式  
• 优化内容展示

还有什么需要调整的吗？`
    
    const newMessage: CustomizationRequest = {
      id: Date.now().toString(),
      userMessage,
      aiResponse,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
  }, [setMessages])

  // 通过useEffect暴露方法给父组件
  React.useEffect(() => {
    if (onAddAdoptionMessage) {
      onAddAdoptionMessage(addAdoptionMessage)
    }
  }, [onAddAdoptionMessage, addAdoptionMessage])

  // Mock AI响应逻辑
  const getMockResponse = (userInput: string): { response: string; template: 'original' | 'minimal' | 'detailed'; shouldUpgrade?: boolean } => {
    const lowerInput = userInput.toLowerCase()
    
    // 检测升级请求 - 针对日本攻略的特殊处理
    if ((lowerInput.includes('更丰富') || lowerInput.includes('丰富')) && lowerInput.includes('展示') && guideId === 'japan-sakura-7days') {
      if (onUpgradeRequest) {
        onUpgradeRequest()
      }
      return {
        response: '🌟 正在为您升级到更丰富的展示版本...\n\n⏳ 升级中，请稍候...\n\n🎌 即将为您呈现更加精美的交互式日本旅游体验！',
        template: currentTemplate,
        shouldUpgrade: true
      }
    }
    
    // 检测升级请求 - 针对英国哈利波特攻略的特殊处理
    if ((lowerInput.includes('更丰富') || lowerInput.includes('丰富')) && lowerInput.includes('展示') && guideId === 'uk-harry-potter-7days') {
      if (onUpgradeRequest) {
        onUpgradeRequest()
      }
      return {
        response: '🌟 正在为您升级到更丰富的展示版本...\n\n⏳ 升级中，请稍候...\n\n🧙‍♂️ 即将为您呈现更加精美的交互式魔法世界体验！',
        template: currentTemplate,
        shouldUpgrade: true
      }
    }
    
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
      const { response, template, shouldUpgrade } = getMockResponse(userMessage)
      
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { text: '让页面更简洁', icon: Layout },
    { text: '我要详细展示', icon: Sparkles },
    { text: '更丰富的展示', icon: Palette },
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-72px)] w-full overflow-hidden ${className}`}>
      {/* 头部 - 固定高度 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                页面定制
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Web模式下的分享行程按钮 */}
            {isWebMode && webUrl && (
              <button
                onClick={handleShareWebUrl}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="复制行程URL到剪贴板"
              >
                <Share2 className="w-3.5 h-3.5" />
                分享行程
              </button>
            )}
            
            {/* 社区入口按钮 */}
            <button
              onClick={onShowCommunity}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="攻略社区"
            >
              <Users className="w-3.5 h-3.5" />
              社区
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          通过自然语言调整页面布局和样式
        </p>
      </div>

      {/* 消息区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message) => (
          <div key={message.id}>
            {message.userMessage && (
              <div className="flex justify-end mb-2">
                <div className="bg-blue-500 text-white rounded-lg rounded-tr-md px-3 py-2 max-w-[85%] break-words">
                  <p className="text-xs break-words">{message.userMessage}</p>
                </div>
              </div>
            )}
            
            {message.aiResponse && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg rounded-tl-md px-3 py-2 max-w-[85%] break-words">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-3 h-3 text-purple-500" />
                    <span className="text-xs font-medium text-purple-500">AI助手</span>
                  </div>
                  <div className="text-xs whitespace-pre-line leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: message.aiResponse }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-md px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 快捷操作 - 固定在底部 */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2 mb-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action.text)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 transition-colors truncate"
            >
              <action.icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 输入区域 - 固定在底部 */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="space-y-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述您想要的页面效果..."
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 min-w-0"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            <Send className="w-4 h-4 flex-shrink-0" />
            <span>发送</span>
          </button>
        </div>
      </div>
    </div>
  )
}