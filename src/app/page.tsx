'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DemoCards from '../components/DemoCards'
import ChatInterface, { Message, ItineraryDay, UserInfo } from '../components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import XiaohongshuExtractor from '@/components/XiaohongshuExtractor'
import { registerSystemMessageSender } from '@/utils/systemMessage'
import { useConversationMemory } from '@/hooks/useConversationMemory'
import { useItineraryActions } from '@/hooks/useItineraryActions'
import { useExportFeatures } from '@/hooks/useExportFeatures'
import { addTimeInfoToItinerary } from '@/utils/timeCalculator'
import { generateConversationId, postConversations, getConverstionsById } from './api/conversation'
import { indexedDBManager, initIndexedDB, saveAsStaticFile } from '@/utils/indexedDB'
import { initServiceWorker } from '@/utils/serviceWorker'

interface DemoGuide {
  id: string
  title: string
  destination: string
  duration: string
  theme: string
  highlights: string[]
  preview: string
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryDay[]>([])
  const [isInitialState, setIsInitialState] = useState(true)
  const [convId, setConvId] = useState('');
  
  // 系统消息轮换相关
  const systemMessageTimerRef = useRef<NodeJS.Timeout | null>(null)
  const messageIndexRef = useRef(0)
  
  // 预设用户信息
  const predefinedUsers = useMemo<UserInfo[]>(() => [
    {
      id: 'user-a',
      name: 'A',
      avatar: '',
      color: '#3b82f6' // 蓝色
    },
    {
      id: 'user-b',
      name: 'B',
      avatar: '',
      color: '#10b981' // 绿色
    },
    {
      id: 'user-c',
      name: 'C',
      avatar: '',
      color: '#f59e0b' // 黄色
    },
    {
      id: 'user-d',
      name: 'D',
      avatar: '',
      color: '#ef4444' // 红色
    },
    {
      id: 'user-e',
      name: 'E',
      avatar: '',
      color: '#8b5cf6' // 紫色
    }
  ], [])
  
  // 从URL参数获取会话ID和当前用户ID
  const collaborationConvId = searchParams.get('convId')
  const currentUserId = searchParams.get('user') || 'user-a'
  const currentUser = predefinedUsers.find(u => u.id === currentUserId) || predefinedUsers[0]
  
  // 协作相关状态
  const [isCollaborationMode, setIsCollaborationMode] = useState(false)
  const [collaborationUsers, setCollaborationUsers] = useState<UserInfo[]>([])
  
  // 模拟在线用户（实际项目中可以从服务器获取）
  const [onlineUsers] = useState<UserInfo[]>(() => {
    // 可以根据需要调整在线用户逻辑
    return predefinedUsers.slice(0, 3) // 默认显示前3个用户在线
  })
  
  // 旅游规划相关的思考文本
  const thinkingMessages = useMemo(() => [
    '正在分析您的旅行需求...',
    '深度解析目的地特色...',
    '搜索最佳景点和路线...',
    '评估景点热度与口碑...',
    '优化行程时间安排...',
    '规划最佳游览顺序...',
    '匹配合适的住宿推荐...',
    '筛选高性价比酒店...',
    '计算交通时间和成本...',
    '分析各种出行方式...',
    '整合当地美食推荐...',
    '挖掘隐藏美食宝藏...',
    '查询天气和最佳游览时机...',
    '分析季节性旅游特点...',
    '评估预算与消费水平...',
    '制定详细费用清单...',
    '收集实用旅行贴士...',
    '整理当地文化习俗...',
    '准备应急联系信息...',
    '生成个性化旅行建议...',
    '定制专属游览体验...',
    '完善行程细节安排...',
    '添加备选方案预案...',
    '整合多维度旅行信息...',
    '验证行程合理性...',
    '优化用户体验流程...',
    '准备为您呈现专属攻略...'
  ], [])
  const { 
    context, 
    addUserRequest, 
    updateItinerary, 
    buildPromptContext, 
    parseUserInput 
  } = useConversationMemory()
  
  const {
    deleteLocation,
    optimizeRoute,
    generateRouteAdjustmentMessage
  } = useItineraryActions()
  
  const {
    copyShareLink,
    generateShareLink,
    exportAsTextFile
  } = useExportFeatures()

    // 发送系统消息的函数
  const handleSendSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: `system_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'system',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => {
      // 移除之前的系统消息，只保留最新的一个
      const nonSystemMessages = prev.filter(msg => msg.role !== 'system')
      return [...nonSystemMessages, systemMessage]
    })
  }, [])

  // 启动系统消息轮换
  const startSystemMessageRotation = useCallback(() => {
    // 清理可能存在的定时器
    if (systemMessageTimerRef.current) {
      clearInterval(systemMessageTimerRef.current)
    }
    
    // 重置索引
    messageIndexRef.current = 0
    
    // 立即显示第一条消息
    handleSendSystemMessage(thinkingMessages[0])
    
    // 设置定时器每3秒更换消息
    systemMessageTimerRef.current = setInterval(() => {
      messageIndexRef.current = (messageIndexRef.current + 1) % thinkingMessages.length
      handleSendSystemMessage(thinkingMessages[messageIndexRef.current])
    }, 5000)
  }, [handleSendSystemMessage, thinkingMessages])

  // 停止系统消息轮换
  const stopSystemMessageRotation = useCallback(() => {
    if (systemMessageTimerRef.current) {
      clearInterval(systemMessageTimerRef.current)
      systemMessageTimerRef.current = null
    }
  }, [])

  // 注册系统消息发送器到全局工具类
  React.useEffect(() => {
    registerSystemMessageSender(handleSendSystemMessage)
  }, [handleSendSystemMessage])

  // 组件卸载时清理定时器
  React.useEffect(() => {
    return () => {
      if (systemMessageTimerRef.current) {
        clearInterval(systemMessageTimerRef.current)
      }
    }
  }, [])

  const loadCollaborationSession = useCallback(async () => {
    try {
      const response = await getConverstionsById(collaborationConvId!)
      if (response.code === 200) {
        const { data } = response
        const { messages: historyMessages, conversationId } = data
        
        // 设置协作模式
        setIsCollaborationMode(true)
        setConvId(conversationId)
        setIsInitialState(false)
        
        // 解析历史消息
        const parsedMessages: Message[] = historyMessages.map((msg: any) => {
          if (msg.role === 'USER') {
            // 历史消息默认设置为原始发起者（用户A）
            // 如果消息中有userId信息可以用来识别具体发送者
            const originalSender = predefinedUsers[0] // 历史消息的原始发送者为用户A
            
            return {
              id: msg.messageId,
              role: 'user' as const,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              sender: originalSender
            }
          } else if (msg.role === 'ASSISTANT') {
            // 解析助手消息的内容为行程数据
            let itinerary: ItineraryDay[] | undefined
            try {
              itinerary = JSON.parse(msg.content)
            } catch (error) {
              console.error('解析行程数据失败:', error)
            }
            
            return {
              id: msg.messageId,
              role: 'assistant' as const,
              content: '',
              timestamp: new Date(msg.timestamp),
              itinerary
            }
          }
          return null
        }).filter(Boolean) as Message[]
        
        // 设置消息和当前行程
        setMessages(parsedMessages)
        const lastAssistantMessage = parsedMessages.find(m => m.role === 'assistant' && m.itinerary)
        if (lastAssistantMessage?.itinerary) {
          setCurrentItinerary(lastAssistantMessage.itinerary)
          updateItinerary(lastAssistantMessage.itinerary)
        }
        
        // 设置协作用户（从URL参数或默认）
        setCollaborationUsers(predefinedUsers.slice(0, 3))
      }
    } catch (error) {
      console.error('加载协作会话失败:', error)
      // 可以显示错误提示
    }
  }, [collaborationConvId, predefinedUsers, updateItinerary])

  // 加载协作会话
  useEffect(() => {
    if (collaborationConvId) {
      loadCollaborationSession()
    }
  }, [collaborationConvId, loadCollaborationSession])

  const handleSendMessage = useCallback(async (content: string, themePrompt?: string) => {
    // 记录用户请求到上下文
    addUserRequest(content)
    // console.log(content);
    // 添加用户消息
    const userMessage: Message = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'user',
      content,
      timestamp: new Date(),
      sender: currentUser
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsInitialState(false)

    try {
      // 确保有conversationId
      let currentConvId = convId;
      if (!currentConvId) {
        currentConvId = generateConversationId();
        setConvId(currentConvId);
      }
      startSystemMessageRotation()
      const gRes = await postConversations(currentConvId, content);
      // 停止系统消息轮换
      stopSystemMessageRotation()
      
      // 添加AI响应
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        itinerary: gRes?.data?.plan?.itinerary
      }
      console.log(assistantMessage)
      handleSendSystemMessage('done')

      setMessages(prev => [...prev, assistantMessage])
      
      // 更新当前行程数据
      if (gRes?.data?.plan?.itinerary) {
        setCurrentItinerary(gRes?.data?.plan?.itinerary)
        updateItinerary(gRes?.data?.plan?.itinerary)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 停止系统消息轮换
      stopSystemMessageRotation()
      
      // 错误处理
      const errorMessage: Message = {
        id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '抱歉，生成攻略时出现了问题，请稍后再试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [addUserRequest, convId, handleSendSystemMessage, updateItinerary, startSystemMessageRotation, stopSystemMessageRotation, currentUser])

  const handleSelectDemo = useCallback((demo: DemoGuide) => {
    // 当选择Demo攻略时，自动填入相关内容并触发AI响应
    const demoPrompt = `我想参考这个攻略：${demo.title}，请为我生成详细的行程规划。目的地：${demo.destination}，时长：${demo.duration}，主题：${demo.theme}。`
    handleSendMessage(demoPrompt)
  }, [handleSendMessage])

  const handleXiaohongshuExtract = useCallback((prompt: string, originalContent: any) => {
    // 当小红书内容提取成功时，自动发送生成的prompt
    handleSendMessage(prompt)
  }, [handleSendMessage])

  const handleShowPopularGuides = useCallback(() => {
    router.push('/popular')
  }, [router])

  // 处理开始协作
  const handleStartCollaboration = useCallback(() => {
    if (convId) {
      // 生成协作URL，包含会话ID和邀请的用户IDs
      const collaborationUrl = `${window.location.origin}/?convId=${convId}&user=user-b`
      
      // 复制到剪贴板
      navigator.clipboard.writeText(collaborationUrl).then(() => {
        // 可以显示成功提示
        handleSendSystemMessage('协作链接已复制到剪贴板，分享给朋友一起规划旅行吧！')
      }).catch(err => {
        console.error('复制失败:', err)
        // 可以显示错误提示或者fallback
      })
    }
  }, [convId, handleSendSystemMessage])

  const handleLocationDelete = useCallback(async (dayIndex: number, locationIndex: number) => {
    if (currentItinerary.length === 0 || !currentItinerary[dayIndex]) return
    
    const locationToDelete = currentItinerary[dayIndex].locations[locationIndex]
    if (!locationToDelete) return
    
    // 删除景点并优化路线
    let updatedItinerary = deleteLocation(currentItinerary, dayIndex, locationIndex)
    updatedItinerary = optimizeRoute(updatedItinerary, dayIndex)
    
    // 更新状态
    setCurrentItinerary(updatedItinerary)
    updateItinerary(updatedItinerary)
    
    // 生成AI反馈消息
    const adjustmentMessage = generateRouteAdjustmentMessage('delete', locationToDelete.name)
    const aiMessage: Message = {
      id: `adjustment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'assistant',
      content: adjustmentMessage,
      timestamp: new Date(),
      itinerary: updatedItinerary
    }
    
    setMessages(prev => [...prev, aiMessage])
  }, [currentItinerary, deleteLocation, optimizeRoute, generateRouteAdjustmentMessage, updateItinerary])

  const handleLocationEdit = useCallback((dayIndex: number, locationIndex: number) => {
    // 这里可以打开编辑对话框，暂时简单处理
    const location = currentItinerary[dayIndex]?.locations[locationIndex]
    if (location) {
      const newMessage = `请帮我调整"${location.name}"的安排，比如修改游览时间或者更换其他类似景点`
      handleSendMessage(newMessage)
    }
  }, [currentItinerary, handleSendMessage])

  // 处理景点重排序
  const handleLocationReorder = useCallback(async (newItinerary: ItineraryDay[]) => {
    // 更新行程状态
    setCurrentItinerary(newItinerary)
    updateItinerary(newItinerary)
    
    // 生成AI反馈消息
    const reorderMessage: Message = {
      id: `reorder_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role: 'assistant',
      content: `🔄 行程顺序已更新！我已重新计算了时间安排和路线规划。

📍 **优化建议**
• 根据新的顺序调整了游览时间
• 重新规划了最优路线
• 考虑了交通和时间成本

您可以在地图上查看新的路线安排！`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, reorderMessage])
  }, [updateItinerary])

  const handleShare = useCallback(async () => {
    if (currentItinerary.length === 0) return
    
    try {
      await copyShareLink(currentItinerary, `${currentItinerary.length}天旅行计划`)
      
      // 显示成功消息
      const successMessage: Message = {
        id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '🔗 分享链接已复制到剪贴板！您可以将链接发送给朋友，让他们查看您的旅行计划。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('分享失败:', error)
    }
  }, [currentItinerary, copyShareLink])

  const handleShareServer = useCallback(async () => {
    if (currentItinerary.length === 0) return
    
    try {
      // 初始化存储服务
      await initIndexedDB()
      await initServiceWorker()
      
      // 生成唯一ID用于服务端存储
      const id = `server_${convId}`
      const title = `${currentItinerary.length}天旅行计划`
      
      handleSendSystemMessage('🔄 正在生成并保存HTML攻略...')
      
      // 向服务端API创建分享内容
      const response = await fetch(`/api/shared/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          itinerary: currentItinerary,
          guideId: convId
        })
      })
      
      const result = await response.json()
      handleSendSystemMessage('页面生成成功！页面渲染中...')
      if (result.success && result.data) {
        // 保存到IndexedDB
        await indexedDBManager.saveHTMLPage({
          id,
          title,
          html: result.data.html,
          createdAt: new Date().toISOString(),
          guideId: convId
        })
        await saveAsStaticFile(id);
        handleSendSystemMessage('页面渲染成功！')
        handleSendSystemMessage('done')
        // 生成可访问的URL
        const savedPageUrl = `${window.location.origin}/shared/${id}?type=web`
        
        // 复制链接到剪贴板（使用现代工具）
        const { copyToClipboard } = await import('@/utils/clipboard')
        const copyResult = await copyToClipboard(savedPageUrl)
        const clipboardSuccess = copyResult.success
        
        const successMessage: Message = {
          id: `server_share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          role: 'assistant',
          content: `✅ 攻略已保存为HTML页面！\n\n🔗 可通过以下链接访问：\n${savedPageUrl}\n\n${clipboardSuccess ? '📋 链接已复制到剪贴板' : '💡 请手动复制上方链接'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, successMessage])
      } else {
        throw new Error(result.error || '生成HTML失败')
      }
    } catch (error) {
      console.error('❌ 保存攻略失败:', error)
      const errorMessage: Message = {
        id: `server_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '服务端分享失败，请稍后重试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [convId, currentItinerary, handleSendSystemMessage])

  const handleShareClient = useCallback(async () => {
    if (currentItinerary.length === 0) return
    
    try {
      // 生成客户端渲染分享链接 (使用localStorage，添加render=client参数)
      const shareUrl = await generateShareLink(currentItinerary, `${currentItinerary.length}天旅行计划`)
      const clientShareUrl = shareUrl + '?render=client'
      
      // 复制修改后的链接
      await navigator.clipboard.writeText(clientShareUrl)
      
      const successMessage: Message = {
        id: `client_share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '🟠 客户端渲染分享链接已复制！这种方式支持定制功能，体验更完整。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('客户端分享失败:', error)
      const errorMessage: Message = {
        id: `client_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '客户端分享失败，请稍后重试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [currentItinerary, generateShareLink])

  const handleExportPDF = useCallback(() => {
    if (currentItinerary.length === 0) return
    
    try {
      exportAsTextFile(currentItinerary, `${currentItinerary.length}天旅行计划`)
      
      // 显示成功消息
      const successMessage: Message = {
        id: `export_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '📄 行程文件已导出！文件包含完整的行程安排、时间表和旅行贴士。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('导出失败:', error)
      const errorMessage: Message = {
        id: `export_error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        role: 'assistant',
        content: '导出失败，请稍后重试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [currentItinerary, exportAsTextFile])

  const handleReturnHome = useCallback(() => {
    // 重置到初始状态
    setIsInitialState(true)
    setMessages([])
    setCurrentItinerary([])
    setConvId('')
  }, [])

  const handleShowHistory = useCallback(() => {
    router.push('/history')
  }, [router])

  return (
    <div className="min-h-screen relative">
      {/* 动态背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950"></div>
      
      {/* 动态光影效果 */}
      <div className="fixed inset-0 opacity-70 dark:opacity-50 pointer-events-none">
        {/* 主要光球组 */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute top-40 right-0 w-80 h-80 bg-gradient-to-r from-indigo-400/35 to-purple-400/35 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-300/30 to-blue-400/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        
        {/* 次要光影层 */}
        <div className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 right-20 w-56 h-56 bg-gradient-to-bl from-blue-300/25 to-indigo-300/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        {/* 旋转光环 */}
        <div className="absolute top-1/3 left-1/2 w-32 h-32 border border-blue-300/30 rounded-full animate-rotate-slow"></div>
        <div className="absolute bottom-1/2 right-1/4 w-24 h-24 border border-indigo-300/25 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse', animationDelay: '2s' }}></div>
        
        {/* 浮动粒子群 */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400/60 rounded-full animate-drift"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400/60 rounded-full animate-drift" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-5 h-5 bg-cyan-400/50 rounded-full animate-drift" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-purple-400/50 rounded-full animate-drift" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-pink-400/60 rounded-full animate-drift" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/6 left-1/6 w-3 h-3 bg-teal-400/50 rounded-full animate-drift" style={{ animationDelay: '5s' }}></div>
        
        {/* 动态网格 */}
        <div className="absolute inset-0 opacity-15 dark:opacity-8" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(20deg)'
        }}></div>
        
        {/* 渐变射线 */}
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-blue-400/40 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 right-0 w-32 h-px bg-gradient-to-l from-indigo-400/40 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/4 w-px h-24 bg-gradient-to-t from-purple-400/40 to-transparent animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* 主内容区域 */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">

        {/* 页面顶部：Demo攻略卡片 - 始终显示 */}
        <div className="mb-8">
          <DemoCards onSelectDemo={handleSelectDemo} onShowPopularGuides={handleShowPopularGuides} />
        </div>

        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：聊天界面 */}
          <div className={`${isInitialState ? 'w-full' : 'w-full lg:w-1/2'} transition-all duration-500`}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isInitialState={isInitialState}
              xiaohongshuExtractor={
                <XiaohongshuExtractor 
                  onExtractSuccess={handleXiaohongshuExtract}
                  isLoading={isLoading}
                />
              }
              onShowHistory={handleShowHistory}
              onGenerateFinalItinerary={handleShareServer}
              onSendSystemMessage={handleSendSystemMessage}
              currentUser={currentUser}
              allUsers={isCollaborationMode ? collaborationUsers : onlineUsers}
              conversationId={convId}
              isCollaborationMode={isCollaborationMode}
              onStartCollaboration={handleStartCollaboration}
            />
          </div>

          {/* 右侧：旅行视图区域 - 只有在生成内容后才显示 */}
          {!isInitialState && (
            <div className="w-full lg:w-1/2">
              <div className="sticky top-2 transition-all duration-500 animate-in slide-in-from-right">
                <TravelViews 
                  itinerary={currentItinerary}
                  className="h-[calc(100vh-30px)]"
                  onLocationDelete={handleLocationDelete}
                  onLocationEdit={handleLocationEdit}
                  onLocationReorder={handleLocationReorder}
                  onExportPDF={handleExportPDF}
                  onSendMessage={handleSendMessage}
                  onShare={handleShare}
                  onShareServer={handleShareServer}
                  onShareClient={handleShareClient}
                  onReturnHome={handleReturnHome}
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
