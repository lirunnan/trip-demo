'use client'

import { Bot, Loader2, MapPin, Utensils, Building2, ShoppingBag, Camera, Hotel, Plane, X, History, Share2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useThemeMode } from '@/hooks/useThemeMode'
import ThemeTagsInput from './ThemeTagsInput'
import Link from 'next/link'
import Image from 'next/image'
import { postConversations } from '@/app/api/conversation'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  itinerary?: ItineraryDay[]
  sender?: UserInfo  // 发送者信息，仅在user角色时有效
  showBreathingAnimation?: boolean  // 是否显示呼吸感动画，默认true
}

export interface UserInfo {
  id: string
  name: string
  avatar: string
  color: string
}

export interface ItineraryDay {
  day: number
  date: string
  locations: Location[]
  accommodation?: Accommodation
}

export interface Accommodation {
  name: string
  type: string
  coordinates: [number, number] // [lng, lat]
  description: string
  price: string
  country: string
  province: string
  city: string
}

export interface Location {
  name: string
  type: string
  coordinates: [number, number] // [lng, lat]
  description: string
  duration: string
  country: string
  province: string
  city: string
  startTime?: string // 开始时间
  endTime?: string   // 结束时间
  timeSlot?: string  // 时间段显示
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string, themePrompt?: string) => void
  isLoading: boolean
  isInitialState: boolean
  xiaohongshuExtractor?: React.ReactNode
  onShowHistory?: () => void
  onGenerateFinalItinerary?: () => void // 新增：生成最终攻略的回调
  onSendSystemMessage?: (content: string) => void // 新增：发送系统消息的回调
  currentUser: UserInfo // 当前用户信息
  allUsers: UserInfo[] // 所有协作用户信息
  conversationId?: string // 当前会话ID
  isCollaborationMode?: boolean // 是否为协作模式
  onStartCollaboration?: () => void // 开始协作的回调
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isInitialState,
  xiaohongshuExtractor,
  onShowHistory,
  onGenerateFinalItinerary,
  onSendSystemMessage,
  currentUser,
  allUsers,
  conversationId,
  isCollaborationMode = false,
  onStartCollaboration
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // textareaRef 现在由 ThemeTagsInput 组件内部处理
  
  // 主题模式状态
  const {
    selectedThemes,
    parseThemeTags,
    addTheme,
    removeTheme,
    generateThemePrompt
  } = useThemeMode()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      // 解析主题标签
      const { themes, cleanInput } = parseThemeTags(input.trim())
      
      // 添加解析到的主题
      themes.forEach(theme => addTheme(theme))
      
      // 生成包含主题信息的提示词
      const allSelectedThemes = [...selectedThemes, ...themes]
      const themePrompt = generateThemePrompt(allSelectedThemes, cleanInput || input.trim())
      
      onSendMessage(cleanInput || input.trim(), themePrompt)
      setInput('')
    }
  }


  const renderItinerary = (itinerary: ItineraryDay[]) => {
    return (
      <div className="mt-4 space-y-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">🗓️ 行程安排</h4>
        {itinerary.map((day) => (
          <div key={day.day} className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">
              第{day.day}天 ({day.date})
            </h5>
            <div className="mt-2 space-y-2">
              {/* 住宿信息 */}
              {day.accommodation && (
                <div className="flex items-start gap-2 mt-3 pt-2">
                  <Hotel className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {day.accommodation.name}
                    </span>
                    <span className="text-sm text-orange-600 dark:text-orange-400 ml-2">
                      {day.accommodation.type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {day.accommodation.price}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {day.accommodation.description}
                    </p>
                  </div>
                </div>
              )}
              {day.locations.map((location, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {location.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({location.duration})
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {location.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
    // 首页底部社区推荐（指向分享页）
    const communityGuides = [
      {
        id: 'uk-harry-potter-7days',
        title: '英国七日魔法之旅',
        destination: '伦敦·爱丁堡·牛津',
        duration: '7天6夜',
        thumbnail: '/images/london-preview.png',
        tags: ['魔法', '文化'],
        views: 25680,
        likes: 1456,
        rating: 4.9
      },
      {
        id: 'japan-sakura-7days',
        title: '日本樱花季七日游',
        destination: '东京·京都·大阪',
        duration: '7天6夜',
        thumbnail: '/images/japan-preview.png',
        tags: ['樱花', '美食'],
        views: 15420,
        likes: 892,
        rating: 4.8
      },
      {
        id: 'sichuan-west-road-trip',
        title: '川西秘境自驾游',
        destination: '成都·稻城亚丁',
        duration: '10天9夜',
        thumbnail: '/images/placeholder.png',
        tags: ['自驾', '高原'],
        views: 20145,
        likes: 1203,
        rating: 4.7
      },
      {
        id: 'tibet-lhasa-spiritual',
        title: '西藏拉萨心灵净化之旅',
        destination: '拉萨·林芝',
        duration: '7天6夜',
        thumbnail: '/images/placeholder.png',
        tags: ['朝圣', '文化'],
        views: 16789,
        likes: 987,
        rating: 4.9
      }
    ] as const
  

  return (
    <div className="w-full max-w-7xl mx-auto">
      {isInitialState ? (
        // 初始状态：居中的输入框
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="text-center mb-8">
            {/* Logo和品牌标题 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                {/* 主Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 animate-pulse-glow">
                  <div className="w-14 h-14 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-5xl font-bold transform -rotate-12">✈</span>
                  </div>
                </div>
                {/* 光晕效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-2xl blur-xl animate-pulse -z-10"></div>
                {/* 环形装饰 */}
                <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"></div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-shift mb-1">
                  行呗
                </h1>
                <div className="text-sm font-medium text-blue-500/70 tracking-widest">
                  TRAVEL AI
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 drop-shadow-lg">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
                <span className="mx-2">旅游攻略</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">生成器</span>
              </h2>
              <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-lg">
                <span className="text-2xl">🌍</span>
                <span>告诉我你的旅行需求，我为你定制专属攻略</span>
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-2xl space-y-4">
            <ThemeTagsInput
              selectedThemes={selectedThemes}
              onThemeAdd={addTheme}
              onThemeRemove={removeTheme}
              onInputChange={setInput}
              inputValue={input}
              placeholder="例如：我想去日本东京玩3天，喜欢历史文化和美食，预算1万元... 或输入 #亲子 #美食 选择主题模式"
              onSubmit={() => {
                if (input.trim() && !isLoading) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                }
              }}
              isLoading={isLoading}
              submitButtonText="开始规划"
            />
            
            {/* 输入方式选择 */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
                <span>或选择其他方式</span>
                <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {xiaohongshuExtractor && xiaohongshuExtractor}
                {/* 可以添加更多输入方式 */}
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer opacity-50">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">📝</span>
                  <span className="text-gray-400 text-sm font-medium">模板导入</span>
                  <span className="text-xs text-gray-400">(即将上线)</span>
                </button>
                {onShowHistory && (
                  <button 
                    onClick={onShowHistory}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">历史记录</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 装饰性行程路线 */}
          <div className="w-full max-w-6xl relative">
            {/* 主路线 */}
            <div className="relative h-20 mt-4">
              {/* 背景路径 */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                {/* 主路径 - 曲线 */}
                <path
                  d="M100,200 Q200,120 300,180 T500,160 Q600,140 700,200"
                  stroke="url(#gradient1)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                />
                {/* 第二条路径 */}
                <path
                  d="M150,250 Q250,180 350,220 T550,200 Q650,180 750,240"
                  stroke="url(#gradient2)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="6,3"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                {/* 第三条路径 */}
                <path
                  d="M80,300 Q180,240 280,280 T480,260 Q580,240 680,300"
                  stroke="url(#gradient3)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="4,2"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
                
                {/* 渐变定义 */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* 地点标记点 */}
              <div className="absolute top-[45%] left-[12%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '0s' }}>
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">出发地</div>
              </div>
              
              <div className="absolute top-[40%] left-[25%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '0.2s' }}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">景点1</div>
              </div>
              
              <div className="absolute top-[45%] left-[37%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '0.4s' }}>
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">美食街</div>
              </div>
              
              <div className="absolute top-[38%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '0.6s' }}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">历史建筑</div>
              </div>
              
              <div className="absolute top-[35%] left-[62%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '0.8s' }}>
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">购物中心</div>
              </div>
              
              <div className="absolute top-[40%] left-[75%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '1s' }}>
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">观景台</div>
              </div>
              
              <div className="absolute top-[48%] left-[87%] transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-bounce flex items-center justify-center" style={{ animationDelay: '1.2s' }}>
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">酒店</div>
              </div>
              
              {/* 浮动装饰元素 */}
              <div className="absolute top-[25%] left-[20%] w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-[65%] left-[35%] w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
              <div className="absolute top-[20%] left-[55%] w-2 h-2 bg-green-400/60 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
              <div className="absolute top-[70%] left-[70%] w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-ping" style={{ animationDelay: '3.5s' }}></div>
            </div>


        {/* 底部：热门攻略社区（链接至分享页） */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">热门攻略社区</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">发现优质攻略，直接查看分享页</p>
            </div>
            <Link href="/popular" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">查看更多</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityGuides.map((g) => (
              <Link
                key={g.id}
                href={`/shared/${g.id}?type=web`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <div className="relative h-36 bg-gray-200">
                  <Image
                    src={g.thumbnail}
                    alt={g.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 font-medium">
                    {g.rating}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {g.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{g.destination}</span>
                    <span>{g.duration}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {g.views.toLocaleString()} 浏览 · {g.likes} 点赞
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
            
            {/* 底部提示文字 */}
            <div className="mt-3 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                ✨ AI为你规划最优路线，串联精彩景点 ✨
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>智能路线规划</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>个性化推荐</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>实时优化调整</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 对话状态：显示消息历史和底部输入框
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.map((message) => {
              // 处理系统消息 - 居中显示，且只显示最后一个系统消息
              if (message.role === 'system') {
                const isLastSystemMessage = messages.filter(m => m.role === 'system').pop()?.id === message.id
                const shouldHideSystemMessage = message.content.toLowerCase() === 'done'
                
                // 如果消息是 "done" 或不是最后一个系统消息，则不显示
                if (shouldHideSystemMessage || !isLastSystemMessage) {
                  return null
                }
                
                return (
                  <div key={message.id} className="flex items-center gap-3">
                    {/* 系统消息内容 */}
                    <div className={`flex bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm border border-amber-200 dark:border-amber-700 ${message.showBreathingAnimation && 'animate-pulse'}`}>
                      {/* 左侧呼吸感装饰 - 根据showBreathingAnimation条件显示 */}
                      {message.showBreathingAnimation && (
                        <div className="relative w-12 h-6 pr-3">
                          {/* 第一个呼吸圆圈 - 左右移动 */}
                          <div className="absolute top-2/3 -translate-y-1/2 transition-all duration-2000 ease-in-out animate-[moveRight_3s_ease-in-out_infinite]">
                            <div className="relative">
                              <div className="w-3 h-3 bg-amber-400 dark:bg-amber-500 rounded-full animate-pulse"></div>
                              <div className="absolute inset-0 w-3 h-3 bg-amber-300 dark:bg-amber-400 rounded-full animate-ping opacity-75"></div>
                              <div className="absolute -inset-1 w-5 h-5 bg-amber-200 dark:bg-amber-300 rounded-full animate-pulse opacity-30"></div>
                            </div>
                          </div>
                          
                          {/* 第二个呼吸圆圈 - 右左移动，延迟启动 */}
                          <div className="absolute top-1/2 -translate-y-1/2 right-0 transition-all duration-2000 ease-in-out animate-[moveLeft_3s_ease-in-out_infinite]">
                            <div className="relative">
                              <div className="w-2.5 h-2.5 bg-amber-300 dark:bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              <div className="absolute inset-0 w-2.5 h-2.5 bg-amber-200 dark:bg-amber-300 rounded-full animate-ping opacity-60" style={{animationDelay: '0.3s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {message.content}
                    </div>
                  </div>
                )
              }
              
              // 处理普通消息（用户和助手）
              const isCurrentUser = message.role === 'user' && message.sender?.id === currentUser.id
              const isOtherUser = message.role === 'user' && message.sender && message.sender.id !== currentUser.id
              
              // 如果是user消息但没有sender信息，默认处理为其他用户（历史消息的兼容性处理）
              const isUserWithoutSender = message.role === 'user' && !message.sender
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 其他用户头像（左侧显示） */}
                  {isOtherUser && message.sender && (
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: message.sender.color }}
                      >
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{message.sender.name}</span>
                    </div>
                  )}

                  {/* 没有sender信息的用户消息头像（左侧显示） */}
                  {isUserWithoutSender && (
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      >
                        A
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">用户A</span>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white'
                        : (isOtherUser && message.sender) || isUserWithoutSender
                        ? 'text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                    style={
                      (isOtherUser && message.sender)
                        ? { backgroundColor: message.sender.color }
                        : isUserWithoutSender
                        ? { backgroundColor: '#6b7280' } // 默认灰色给没有sender的消息
                        : {}
                    }
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.itinerary && renderItinerary(message.itinerary)}
                    {
                      message.itinerary && (
                        <button
                          onClick={onGenerateFinalItinerary}
                          className="self-start flex w-full justify-center items-center gap-2 px-4 py-2 mt-5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <Share2 className="w-4 h-4" />
                          生成最终旅游攻略
                        </button>
                      )
                    }
                  </div>

                  {/* 当前用户头像（右侧显示） */}
                  {isCurrentUser && (
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: currentUser.color }}
                      >
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">我</span>
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">正在生成攻略...</span>
                  </div>
                </div>
              </div>
            )} */}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {/* 协作用户显示 */}
            {(!isInitialState && conversationId) && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isCollaborationMode ? '协作成员：' : '邀请协作：'}
                  </span>
                  {!isCollaborationMode ? (
                    <button
                      onClick={onStartCollaboration}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <span>🤝</span>
                      <span>一起规划</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-500">{allUsers.length} 人在线</span>
                  )}
                </div>
                
                {isCollaborationMode && (
                  <div className="flex gap-2">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                          user.id === currentUser.id 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.id === currentUser.id ? '我' : user.name}</span>
                        {user.id === currentUser.id && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 已选择的主题标签显示 */}
            {selectedThemes.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">当前主题：</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
                    >
                      <span className="text-base">{theme.emoji}</span>
                      <span>{theme.name}</span>
                      <button
                        onClick={() => removeTheme(theme.id)}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <ThemeTagsInput
              selectedThemes={[]} // 在对话模式中不重复显示已选标签
              onThemeAdd={addTheme}
              onThemeRemove={removeTheme}
              onInputChange={setInput}
              inputValue={input}
              placeholder="继续对话，提出你的旅行需求... 或输入 #标签 添加主题模式"
              onSubmit={() => {
                if (input.trim() && !isLoading) {
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                }
              }}
              isLoading={isLoading}
              submitButtonText="发送"
            />
          </div>
        </div>
      )}
    </div>
  )
}
