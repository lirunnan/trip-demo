'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ChatInterface, { Message, ItineraryDay } from '@/components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import { useConversationMemory } from '@/hooks/useConversationMemory'
import { useItineraryActions } from '@/hooks/useItineraryActions'
import { useExportFeatures } from '@/hooks/useExportFeatures'
import { addTimeInfoToItinerary } from '@/utils/timeCalculator'

export default function GuideDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 从URL获取攻略信息
  const guideId = params?.id as string
  const title = searchParams?.get('title') || '精彩旅程'
  const destination = searchParams?.get('destination') || '未知目的地'
  const duration = searchParams?.get('duration') || '3天2夜'
  const theme = searchParams?.get('theme') || '休闲度假'
  const preview = searchParams?.get('preview') || '精彩的旅行体验等你来发现'
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryDay[]>([])
  
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

  // 初始化页面时自动发送攻略请求
  useEffect(() => {
    if (title && destination && messages.length === 0) {
      const initialMessage = `我想了解关于"${title}"的详细攻略。目的地：${destination}，时长：${duration}，主题：${theme}。${preview}`
      handleSendMessage(initialMessage)
    }
  }, [title, destination, duration, theme, preview])

  // 模拟AI响应
  const simulateAIResponse = useCallback(async (userMessage: string): Promise<{ content: string; itinerary?: ItineraryDay[] }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const fullPrompt = buildPromptContext(userMessage)
    parseUserInput(userMessage)
    
    // 根据攻略ID生成不同的模拟数据
    const mockItineraryBase: ItineraryDay[] = generateItineraryByGuideId(guideId)
    const mockItinerary = addTimeInfoToItinerary(mockItineraryBase)
    
    const responseContent = `🎯 **${title}**

📍 **目的地**: ${destination}
⏱️ **时长**: ${duration}
🎨 **主题**: ${theme}

${preview}

🗓️ **详细行程安排**
${mockItinerary.map((day, index) => 
  `**第${day.day}天** - ${day.date}
${day.locations.map(location => `• ${location.name}: ${location.description} (${location.duration})`).join('\n')}`
).join('\n\n')}

💡 **贴心提示**
• 建议提前预订热门景点门票
• 注意当地天气变化，携带合适衣物
• 尊重当地文化和习俗
• 保持手机电量，随时使用导航

🗺️ 地图上已标出所有景点位置和建议路线，您可以查看详细的时间表和路线规划！`

    return {
      content: responseContent,
      itinerary: mockItinerary
    }
  }, [buildPromptContext, parseUserInput, guideId, title, destination, duration, theme, preview])

  const handleSendMessage = useCallback(async (content: string) => {
    addUserRequest(content)
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const aiResponse = await simulateAIResponse(content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        itinerary: aiResponse.itinerary
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      if (aiResponse.itinerary) {
        setCurrentItinerary(aiResponse.itinerary)
        updateItinerary(aiResponse.itinerary)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
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
  }, [simulateAIResponse, addUserRequest, updateItinerary])

  const handleLocationDelete = useCallback(async (dayIndex: number, locationIndex: number) => {
    if (currentItinerary.length === 0 || !currentItinerary[dayIndex]) return
    
    const locationToDelete = currentItinerary[dayIndex].locations[locationIndex]
    if (!locationToDelete) return
    
    let updatedItinerary = deleteLocation(currentItinerary, dayIndex, locationIndex)
    updatedItinerary = optimizeRoute(updatedItinerary, dayIndex)
    
    setCurrentItinerary(updatedItinerary)
    updateItinerary(updatedItinerary)
    
    const adjustmentMessage = generateRouteAdjustmentMessage('delete', locationToDelete.name)
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: adjustmentMessage,
      timestamp: new Date(),
      itinerary: updatedItinerary
    }
    
    setMessages(prev => [...prev, aiMessage])
  }, [currentItinerary, deleteLocation, optimizeRoute, generateRouteAdjustmentMessage, updateItinerary])

  const handleLocationEdit = useCallback((dayIndex: number, locationIndex: number) => {
    const location = currentItinerary[dayIndex]?.locations[locationIndex]
    if (location) {
      const newMessage = `请帮我调整"${location.name}"的安排，比如修改游览时间或者更换其他类似景点`
      handleSendMessage(newMessage)
    }
  }, [currentItinerary, handleSendMessage])

  const handleLocationReorder = useCallback(async (newItinerary: ItineraryDay[]) => {
    setCurrentItinerary(newItinerary)
    updateItinerary(newItinerary)
    
    const reorderMessage: Message = {
      id: Date.now().toString(),
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
      await copyShareLink(currentItinerary, title)
      
      const successMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🔗 分享链接已复制到剪贴板！您可以将链接发送给朋友，让他们查看您的旅行计划。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('分享失败:', error)
    }
  }, [currentItinerary, title, copyShareLink])

  const handleExportPDF = useCallback(() => {
    if (currentItinerary.length === 0) return
    
    try {
      exportAsTextFile(currentItinerary, title)
      
      const successMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '📄 行程文件已导出！文件包含完整的行程安排、时间表和旅行贴士。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
    } catch (error) {
      console.error('导出失败:', error)
    }
  }, [currentItinerary, title, exportAsTextFile])

  return (
    <div className="min-h-screen relative">
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950"></div>
      
      {/* 头部导航 */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/popular"
              className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {destination} · {duration} · {theme}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧：聊天界面 */}
            <div className="w-full lg:w-1/2">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isInitialState={false}
              />
            </div>

            {/* 右侧：旅行视图区域 */}
            <div className="w-full lg:w-1/2">
              <div className="sticky top-24">
                <TravelViews 
                  itinerary={currentItinerary}
                  className="h-[calc(100vh-120px)]"
                  onLocationDelete={handleLocationDelete}
                  onLocationEdit={handleLocationEdit}
                  onLocationReorder={handleLocationReorder}
                  onExportPDF={handleExportPDF}
                  onShare={handleShare}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 根据攻略ID生成不同的模拟行程数据
function generateItineraryByGuideId(guideId: string): ItineraryDay[] {
  switch (guideId) {
    case 'japan-sakura-7days':
      return [
        {
          day: 1,
          date: '2024-04-01',
          locations: [
            {
              name: '成田机场',
              type: '交通枢纽',
              coordinates: [140.386, 35.765],
              description: '抵达东京，前往酒店办理入住',
              duration: '2小时'
            },
            {
              name: '上野公园',
              type: '樱花景点',
              coordinates: [139.773, 35.715],
              description: '樱花盛开的绝美公园，感受日本春天',
              duration: '3小时'
            },
            {
              name: '浅草寺',
              type: '历史景点',
              coordinates: [139.797, 35.715],
              description: '东京最古老的寺庙，体验传统文化',
              duration: '2小时'
            }
          ]
        },
        {
          day: 2,
          date: '2024-04-02',
          locations: [
            {
              name: '新宿御苑',
              type: '樱花景点',
              coordinates: [139.710, 35.685],
              description: '皇室庞园，樱花品种最全的赏樱胜地',
              duration: '3小时'
            },
            {
              name: '明治神宫',
              type: '神社景点',
              coordinates: [139.699, 35.676],
              description: '东京市中心的绿洲，体验神道文化',
              duration: '2小时'
            },
            {
              name: '涩谷十字路口',
              type: '都市景观',
              coordinates: [139.701, 35.659],
              description: '世界最繁忙的十字路口，感受东京活力',
              duration: '1小时'
            }
          ]
        }
      ]
    
    case 'thailand-chiangmai-5days':
      return [
        {
          day: 1,
          date: '2024-03-15',
          locations: [
            {
              name: '清迈古城',
              type: '历史街区',
              coordinates: [98.987, 18.787],
              description: '漫步古城墙内，感受兰纳王朝文化',
              duration: '4小时'
            },
            {
              name: '契迪龙寺',
              type: '寺庙景点',
              coordinates: [98.987, 18.786],
              description: '清迈最重要的寺庙，大佛塔震撼人心',
              duration: '2小时'
            }
          ]
        }
      ]
    
    default:
      return [
        {
          day: 1,
          date: '2024-03-15',
          locations: [
            {
              name: '当地标志景点',
              type: '必游景点',
              coordinates: [116.397, 39.903],
              description: '感受当地独特文化魅力',
              duration: '3小时'
            },
            {
              name: '特色美食街',
              type: '美食体验',
              coordinates: [116.408, 39.913],
              description: '品尝地道当地美食',
              duration: '2小时'
            }
          ]
        }
      ]
  }
}