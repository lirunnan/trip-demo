'use client'

import { useState, useCallback } from 'react'
import DemoCards from '../components/DemoCards'
import ChatInterface, { Message, ItineraryDay } from '../components/ChatInterface'
import MapDisplay from '@/components/MapDisplay'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryDay[]>([])
  const [isInitialState, setIsInitialState] = useState(true)

  // 模拟AI响应 - 在实际项目中这里会调用真实的AI API
  const simulateAIResponse = useCallback(async (userMessage: string): Promise<{ content: string; itinerary?: ItineraryDay[] }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 在真实应用中，这里会根据userMessage生成不同的响应
    console.log('用户输入:', userMessage)

    // 模拟AI生成的攻略内容和行程数据
    const mockItinerary: ItineraryDay[] = [
      {
        day: 1,
        date: '2024-03-15',
        locations: [
          {
            name: '天安门广场',
            type: '历史景点',
            coordinates: [116.397128, 39.903119],
            description: '中华人民共和国的象征，感受历史的庄严',
            duration: '2小时'
          },
          {
            name: '故宫博物院',
            type: '文化景点',
            coordinates: [116.397024, 39.918058],
            description: '明清皇宫，中华文明的瑰宝',
            duration: '3小时'
          },
          {
            name: '王府井大街',
            type: '商业街',
            coordinates: [116.408005, 39.913423],
            description: '北京著名商业街，品尝地道小吃',
            duration: '2小时'
          }
        ]
      },
      {
        day: 2,
        date: '2024-03-16',
        locations: [
          {
            name: '颐和园',
            type: '园林景点',
            coordinates: [116.275, 39.996],
            description: '清代皇家园林，湖光山色美不胜收',
            duration: '4小时'
          },
          {
            name: '清华大学',
            type: '高等学府',
            coordinates: [116.326, 40.003],
            description: '中国顶尖学府，感受学术氛围',
            duration: '2小时'
          }
        ]
      }
    ]

    return {
      content: `根据您的需求，我为您制定了一份精彩的旅行攻略！

🎯 **行程概览**
• 目的地：北京
• 天数：2天1夜
• 主题：历史文化 + 现代体验
• 预算：适中

🗓️ **详细安排**
第1天：天安门广场 → 故宫博物院 → 王府井大街
第2天：颐和园 → 清华大学

💡 **贴心提示**
1. 建议购买故宫门票提前预约
2. 王府井可以尝试北京烤鸭和豆汁
3. 颐和园适合清晨游览，空气清新人少
4. 准备舒适的步行鞋

地图上已标出所有景点位置和建议路线，点击标记可查看详细信息。如有任何问题或需要调整，随时告诉我！`,
      itinerary: mockItinerary
    }
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsInitialState(false)

    try {
      // 模拟AI响应
      const aiResponse = await simulateAIResponse(content)
      
      // 添加AI响应
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        itinerary: aiResponse.itinerary
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // 更新当前行程数据
      if (aiResponse.itinerary) {
        setCurrentItinerary(aiResponse.itinerary)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 错误处理
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，生成攻略时出现了问题，请稍后再试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [simulateAIResponse])

  const handleSelectDemo = useCallback((demo: DemoGuide) => {
    // 当选择Demo攻略时，自动填入相关内容并触发AI响应
    const demoPrompt = `我想参考这个攻略：${demo.title}，请为我生成详细的行程规划。目的地：${demo.destination}，时长：${demo.duration}，主题：${demo.theme}。`
    handleSendMessage(demoPrompt)
  }, [handleSendMessage])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950"></div>
      
      {/* 动态光影效果 */}
      <div className="absolute inset-0 opacity-70 dark:opacity-50">
        {/* 主要光球组 */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute top-40 -right-32 w-80 h-80 bg-gradient-to-r from-indigo-400/35 to-purple-400/35 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
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
          <DemoCards onSelectDemo={handleSelectDemo} />
        </div>

        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：聊天界面 */}
          <div className={`${isInitialState ? 'w-full' : 'w-full lg:w-1/2'} transition-all duration-500`}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onItineraryGenerated={setCurrentItinerary}
              isLoading={isLoading}
              isInitialState={isInitialState}
            />
          </div>

          {/* 右侧：地图展示区域 - 只有在生成内容后才显示 */}
          {!isInitialState && (
            <div className="w-full lg:w-1/2 transition-all duration-500 animate-in slide-in-from-right">
              <div className="sticky top-6">
                <MapDisplay 
                  itinerary={currentItinerary}
                  className="h-full"
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
