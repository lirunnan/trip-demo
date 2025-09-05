'use client'

import { useState, useEffect, useRef } from 'react'
import { Link, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

interface XiaohongshuExtractorProps {
  onExtractSuccess: (prompt: string, originalContent: any) => void
  isLoading?: boolean
}

export default function XiaohongshuExtractor({ onExtractSuccess, isLoading = false }: XiaohongshuExtractorProps) {
  const [url, setUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部区域关闭弹窗
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isExpanded])

  const validateXiaohongshuUrl = (url: string): boolean => {
    return url.includes('xiaohongshu.com') || url.includes('xhslink.com') || url.includes('xhs.cn')
  }

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('请输入小红书链接')
      return
    }

    if (!validateXiaohongshuUrl(url)) {
      setError('请输入有效的小红书链接')
      return
    }

    setExtracting(true)
    setError('')
    setSuccess(false)

    try {
      console.log('开始抓取小红书内容:', url)
      
      const response = await fetch('/api/xiaohongshu/' + encodeURIComponent(url))
      const result = await response.json()

      console.log('API响应:', result)

      if (!response.ok) {
        throw new Error(result.error || '抓取失败')
      }

      // 严格验证：必须AI分析成功才进入对话
      if (!result.success) {
        throw new Error(result.error || 'API调用失败')
      }
      
      if (!result.data) {
        throw new Error('API返回数据为空')
      }
      
      if (!result.data.analysisResult) {
        throw new Error('AI模型分析失败，请检查API密钥配置或尝试其他模型')
      }
      
      if (!result.data.travelPrompt) {
        throw new Error('旅行提示词生成失败')
      }
      
      // AI分析完全成功，显示成功状态
      setSuccess(true)
      
      console.log('✅ [UI] AI分析完全成功，准备进入对话:', {
        title: result.data.analysisResult.title,
        destination: result.data.analysisResult.destination,
        theme: result.data.analysisResult.theme,
        modelUsed: result.data.metadata?.processor
      })
      
      setTimeout(() => {
        // 只有AI分析成功才传递给对话组件
        console.log('📤 [UI] AI分析成功，传递结果给对话组件');
        onExtractSuccess(result.data.travelPrompt, {
          originalContent: result.data.originalContent,
          metadata: result.data.metadata || {},
          analysisResult: result.data.analysisResult
        })
        setUrl('')
        setSuccess(false)
        setIsExpanded(false)
      }, 1500)
    } catch (error) {
      console.error('抓取失败:', error)
      
      // 根据错误类型设置不同的错误消息
      let errorMessage = '抓取失败，请稍后重试'
      
      if (error instanceof Error) {
        if (error.message.includes('AI分析服务配置异常')) {
          errorMessage = 'AI分析服务暂时不可用，已使用基础解析'
        } else if (error.message.includes('AI分析服务忙碌中')) {
          errorMessage = 'AI服务忙碌中，请稍后重试'
        } else if (error.message.includes('网络连接异常')) {
          errorMessage = '网络连接异常，请检查网络后重试'
        } else if (error.message.includes('链接格式不正确')) {
          errorMessage = '链接格式不正确，请检查后重试'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setExtracting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !extracting && !isLoading) {
      handleExtract()
    }
  }

  const isValidUrl = url && validateXiaohongshuUrl(url)

  return (
    <div className="relative" ref={containerRef}>
      {/* 小红书输入方式按钮 */}
      <button 
        className={`group relative inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-700 hover:border-pink-400 dark:hover:border-pink-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${isExpanded ? 'border-pink-400 dark:border-pink-500 bg-pink-50 dark:bg-pink-900/20' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative">
          <span className="text-pink-600 dark:text-pink-400 text-sm font-bold">小</span>
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
        </div>
        <span className="text-pink-600 dark:text-pink-400 text-sm font-medium">
          从小红书导入
        </span>
        <Link className="w-4 h-4 text-pink-500 dark:text-pink-400" />
      </button>

      {/* 展开状态的精致浮动面板 */}
      {isExpanded && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-[620px] max-w-[95vw] p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl z-50 animate-in slide-in-from-top duration-300">
          {/* 输入区域 */}
          <div className="flex items-center gap-3">
            {/* 输入框容器 */}
            <div className="flex-1 relative">
              {/* 渐变边框装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-orange-200 to-yellow-200 dark:from-pink-800 dark:via-orange-800 dark:to-yellow-800 rounded-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
              
              {/* 主输入框容器 */}
              <div className="relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:shadow-lg group">
                {/* 左侧图标 */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200">
                  <Link className="w-5 h-5" />
                </div>
                
                {/* 输入框 */}
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError('')
                    setSuccess(false)
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="红薯地址，例如：https://www.xiaohongshu.com/explore/..."
                  className={`w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-sm font-mono tracking-wide transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500
                    ${error 
                      ? 'text-red-600 dark:text-red-400' 
                      : success
                      ? 'text-green-600 dark:text-green-400'
                      : isValidUrl
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                    focus:outline-none`}
                  disabled={extracting || isLoading}
                  autoFocus
                />
              </div>
            </div>
            
            {/* 解析按钮 - 独立圆形按钮 */}
            <button
              onClick={handleExtract}
              disabled={!url.trim() || extracting || isLoading || !isValidUrl}
              title={extracting ? "解析中..." : success ? "解析成功" : "点击智能解析"}
              className={`flex-shrink-0 w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center
                ${!url.trim() || extracting || isLoading || !isValidUrl
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : success
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110'
                }`}
            >
              {extracting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* 成功信息 */}
          {success && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-green-700 dark:text-green-300 text-sm font-medium">解析成功！正在生成旅行攻略...</div>
                <div className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Claude-4-Sonnet AI智能分析中</span>
                </div>
              </div>
            </div>
          )}

          {/* 优雅的提示信息 */}
          {!url && !error && !success && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
                <span>支持小红书笔记链接</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>自动智能解析</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
