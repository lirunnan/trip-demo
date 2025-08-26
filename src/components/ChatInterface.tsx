'use client'

import { Send, User, Bot, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onItineraryGenerated?: (itinerary: ItineraryDay[]) => void
  isLoading: boolean
  isInitialState: boolean
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  onItineraryGenerated,
  isLoading, 
  isInitialState 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

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
          
          <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例如：我想去日本东京玩3天，喜欢历史文化和美食，预算1万元..."
                className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl 
                         bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none overflow-hidden shadow-lg"
                style={{ minHeight: '64px' }}
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-500 hover:bg-blue-600 
                         disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                         text-white transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
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
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="继续对话，提出你的旅行需求..."
                  className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl 
                           bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           resize-none overflow-hidden"
                  style={{ minHeight: '52px' }}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-500 hover:bg-blue-600 
                           disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                           text-white transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}