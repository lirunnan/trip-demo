'use client'

import { User, Bot, Loader2, MapPin, Utensils, Building2, ShoppingBag, Camera, Hotel, Plane, X, History } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useThemeMode } from '@/hooks/useThemeMode'
import ThemeTagsInput from './ThemeTagsInput'
import Link from 'next/link'
import Image from 'next/image'
import { postConversations } from '@/app/api/conversation'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  itinerary?: ItineraryDay[]
}

export interface ItineraryDay {
  day: number
  date: string
  locations: Location[]
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
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isInitialState,
  xiaohongshuExtractor,
  onShowHistory
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

  // 现在 ThemeTagsInput 内部处理键盘事件，这些函数不再需要

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
        id: '3',
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
        id: '4',
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
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer opacity-50 cursor-not-allowed">
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
            <div className="relative h-24">
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.itinerary && renderItinerary(message.itinerary)}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
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
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
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