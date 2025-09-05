'use client'

import { User, Bot, Loader2, MapPin, Utensils, Building2, ShoppingBag, Camera, Hotel, Plane, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useThemeMode } from '@/hooks/useThemeMode'
import ThemeTagsInput from './ThemeTagsInput'

// 核心功能展示组件
function CoreFeaturesShowcase() {
  const [activeCard, setActiveCard] = useState(0)

  const coreFeatures = [
    {
      id: 0,
      title: '行程轻松定',
      icon: '🎯',
      description: '智能AI分析你的需求，快速生成个性化行程',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      video: '/video-1.mp4',
    },
    {
      id: 1,
      title: '攻略自由配',
      icon: '🔧',
      description: '灵活调整路线，自由搭配景点和活动',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      video: '/video-2.mp4',
      
    },
    {
      id: 2,
      title: '海量灵感库',
      icon: '💡',
      description: '汇聚全球旅行者分享，发现更多精彩',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      video: '/video-3.mp4',
    },
    {
      id: 3,
      title: '分享无边界',
      icon: '🌐',
      description: '一键分享你的旅行计划，与朋友共享美好',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      video: '/video-4.mp4'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % coreFeatures.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-5xl mt-16 mb-8">
      {/* 上部分：4个横向排列的卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {coreFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={`relative p-4 h-12 rounded-xl border-2 transition-all duration-500 cursor-pointer group overflow-hidden ${
              activeCard === index
                ? `bg-gradient-to-br ${feature.gradient} border-transparent text-white shadow-2xl scale-105 transform`
                : `${feature.bgColor} border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg`
            }`}
            onClick={() => setActiveCard(index)}
          >
            {/* 背景装饰 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-2 translate-x-2"></div>
            
            <div className="relative h-full flex items-center justify-center text-center">
              <div className="flex items-center gap-1">
                {/* 图标 */}
                <div className={`text-2xl transition-all duration-500 ${
                  activeCard === index 
                    ? 'animate-bounce' 
                    : 'group-hover:scale-110'
                }`}>
                  {feature.icon}
                </div>
                
                {/* 标题 */}
                <h3 className={`font-bold text-sm transition-colors duration-300 ${
                  activeCard === index 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                }`}>
                  {feature.title}
                </h3>
              </div>
            </div>
            
            {/* 激活指示器 */}
            {activeCard === index && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* 下部分：轮播图片区域 */}
      <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${coreFeatures[activeCard].gradient} opacity-10`}></div>
        
        {/* 视频播放区域 */}
        {coreFeatures.map((feature, index) => (
          <div
            key={feature.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              activeCard === index
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            <div className="h-full flex items-center justify-center relative overflow-hidden rounded-2xl">
              {/* 视频播放器 */}
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                key={`video-${feature.id}-${activeCard === index ? 'active' : 'inactive'}`}
              >
                <source src={feature.video} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
              

            </div>
          </div>
        ))}
        
        {/* 导航指示器 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {coreFeatures.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                activeCard === index
                  ? `bg-gradient-to-r ${coreFeatures[activeCard].gradient} shadow-lg`
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => setActiveCard(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// 功能展示组件
function FeatureShowcase() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      id: 0,
      title: '真正的量身定制',
      icon: '🎯',
      description: '基于你的兴趣爱好、预算范围、出行时间，AI深度分析生成专属旅行方案',
      details: '不再是千篇一律的模板攻略，而是真正了解你需求的个性化规划',
      gradient: 'from-blue-500 via-cyan-400 to-teal-500',
      bgPattern: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20'
    },
    {
      id: 1,
      title: '灵活的行程体验',
      icon: '🔄',
      description: '随时调整路线、替换景点、优化时间安排，让旅行计划始终符合你的心意',
      details: '支持实时修改，拖拽调整，让你的行程规划像搭积木一样简单有趣',
      gradient: 'from-purple-500 via-pink-400 to-rose-500',
      bgPattern: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20'
    },
    {
      id: 2,
      title: '鲜活的灵感社区',
      icon: '💡',
      description: '汇聚全球旅行者的真实分享，发现小众景点，获取最新旅行灵感',
      details: '从小红书到各大平台，智能提取优质内容，为你的旅行增添更多可能',
      gradient: 'from-green-500 via-emerald-400 to-teal-500',
      bgPattern: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20'
    },
    {
      id: 3,
      title: '一站式搞定行程',
      icon: '✈️',
      description: '从路线规划到预算估算，从交通安排到住宿推荐，全流程智能协助',
      details: '告别繁琐的多平台对比，一个工具解决所有旅行规划需求',
      gradient: 'from-orange-500 via-amber-400 to-yellow-500',
      bgPattern: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-5xl mt-16 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* 左侧功能卡片列表 */}
        <div className="lg:col-span-2 space-y-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-700 cursor-pointer backdrop-blur-sm overflow-hidden group ${
                currentFeature === index
                  ? `bg-gradient-to-r ${feature.gradient} border-transparent text-white shadow-xl scale-105 animate-gradient-shift`
                  : `${feature.bgPattern} border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300/70 dark:hover:border-blue-500/70 hover-lift`
              }`}
              onClick={() => setCurrentFeature(index)}
            >
              {/* 背景装饰元素 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
              
              <div className="relative flex items-center gap-4">
                <div className={`text-3xl transition-all duration-500 ${
                  currentFeature === index 
                    ? 'animate-float' 
                    : 'opacity-70 group-hover:opacity-90 group-hover:scale-110'
                }`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-base transition-colors duration-300 ${
                    currentFeature === index 
                      ? 'text-white' 
                      : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                  }`}>
                    {feature.title}
                  </h3>
                </div>
              </div>
              
              {/* 激活指示器 */}
              {currentFeature === index && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-pulse-glow"></div>
                </div>
              )}
              
              {/* 底部渐变线条 */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transition-opacity duration-300 ${
                currentFeature === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
              }`}></div>
            </div>
          ))}
        </div>

        {/* 右侧详细描述卡片 */}
        <div className="lg:col-span-3">
          <div className="relative h-80 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-glass rounded-3xl border-2 border-gray-200/30 dark:border-gray-600/30 shadow-2xl overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-br ${features[currentFeature].gradient} opacity-5`}></div>
            
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`absolute inset-0 p-8 transition-all duration-700 ease-in-out ${
                  currentFeature === index
                    ? 'opacity-100 translate-y-0'
                    : index < currentFeature
                    ? 'opacity-0 -translate-y-full'
                    : 'opacity-0 translate-y-full'
                }`}
              >
                <div className="h-full flex flex-col justify-center relative z-10">
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-sm font-semibold mb-6 shadow-lg animate-gradient-shift`}>
                      <span className="text-xl animate-float">{feature.icon}</span>
                      <span>{feature.title}</span>
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-relaxed">
                    {feature.description}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {feature.details}
                  </p>
                  
                  {/* 装饰性元素 */}
                  <div className={`absolute bottom-6 right-6 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-15 rounded-full animate-pulse-glow`}></div>
                  <div className={`absolute top-6 right-12 w-12 h-12 bg-gradient-to-br ${feature.gradient} opacity-25 rounded-full animate-drift`}></div>
                  <div className={`absolute top-16 right-32 w-6 h-6 bg-gradient-to-br ${feature.gradient} opacity-30 rounded-full animate-float`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 进度指示器 */}
          <div className="flex justify-center gap-3 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 hover:scale-125 ${
                  currentFeature === index
                    ? `bg-gradient-to-r ${features[currentFeature].gradient} shadow-lg animate-pulse-glow`
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isInitialState,
  xiaohongshuExtractor
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

  return (
    <div className="w-full max-w-4xl mx-auto">
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
              </div>
            </div>
          </div>

          {/* 装饰性行程路线 */}
          <div className="w-full max-w-4xl relative">
            {/* 主路线 */}
            <div className="relative h-50">
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

            {/* 功能介绍模块 */}
            <FeatureShowcase />
            
            {/* 核心功能展示组件 */}
            <CoreFeaturesShowcase />
            
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