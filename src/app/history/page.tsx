'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getConversations } from '../api/conversation'
import { ArrowLeft, Clock, MessageSquare, Calendar } from 'lucide-react'

interface Conversation {
  title: string
  conversationId: string
  createdAt: string
  updatedAt: string
  messages: any[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        const response = await getConversations()
        
        if (response?.code === 200 && Array.isArray(response.data)) {
          setConversations(response.data)
        } else {
          setError('获取会话数据失败')
        }
      } catch (err) {
        console.error('获取会话失败:', err)
        setError('网络连接失败，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '未知时间'
    }
  }

  const getConversationTitle = (messages: any[]) => {
    // 尝试从第一条用户消息中提取标题
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    if (firstUserMessage && firstUserMessage.content) {
      const content = firstUserMessage.content.slice(0, 50)
      return content.length > 50 ? content + '...' : content
    }
    return '无标题对话'
  }

  const getLastMessageTime = (messages: any[]) => {
    if (messages.length === 0) return ''
    const lastMessage = messages[messages.length - 1]
    return lastMessage.timestamp || lastMessage.createdAt || ''
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">历史记录</h1>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">加载历史记录中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">加载失败</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无历史记录</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">开始您的第一次旅行规划吧！</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                开始规划
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.conversationId ? `conversation-${conversation.conversationId}` : `conversation-index-${index}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer group"
                onClick={() => {
                  // TODO: 实现点击跳转到对话详情的逻辑
                  router.push(`/?convId=${conversation.conversationId}`)
                  console.log('点击会话:', conversation.conversationId)
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                      <MessageSquare className="w-3 h-3" />
                      {conversation.messages.length}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>创建于 {formatDate(conversation.createdAt)}</span>
                    </div>

                    {conversation.updatedAt !== conversation.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>最后更新 {formatDate(conversation.updatedAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {conversation.conversationId}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        查看详情
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}