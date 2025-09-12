'use client'

import React, { useState, useCallback } from 'react'

interface GeneratedImage {
  url: string
  description: string
  modelUsed: string
}

export default function ImageTestPage() {
  const [query, setQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState('')

  // 简单图片生成
  const handleGenerateImage = useCallback(async () => {
    if (!query.trim()) {
      setError('请输入图片描述')
      return
    }
    
    setIsGenerating(true)
    setError('')
    setGeneratedImage(null)
    
    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim()
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data && result.data.imageUrl) {
        console.log('✅ 图片生成成功，URL长度:', result.data.imageUrl.length)
        console.log('📋 完整图片数据:', result.data.imageUrl)
        
        setGeneratedImage({
          url: result.data.imageUrl,
          description: result.data.description,
          modelUsed: result.data.modelUsed
        })
      } else {
        setError(result.error || '图片生成失败')
      }
    } catch (error) {
      console.error('图片生成失败:', error)
      setError(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGenerating(false)
    }
  }, [query])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎨 AI图片生成
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              使用 Gemini 2.5 Flash Image Preview 生成图片
            </p>
          </div>

          {/* 主要功能区域 */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
            {/* 输入区域 */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入图片描述，例如：北京旅游、日本樱花、巴黎埃菲尔铁塔..."
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isGenerating}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isGenerating && query.trim()) {
                    handleGenerateImage()
                  }
                }}
              />
              
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !query.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 
                         text-white rounded-lg transition-colors duration-200
                         disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap
                         font-medium shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    ✨ 生成图片
                  </>
                )}
              </button>
            </div>
            
            {/* 错误显示 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">❌ {error}</p>
              </div>
            )}
            
            {/* 图片预览 */}
            {generatedImage && generatedImage.url && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                    🖼️ 生成结果
                  </h4>
                  
                  {/* 图片显示 */}
                  <div className="relative">
                    <img 
                      src={generatedImage.url} 
                      alt={generatedImage.description}
                      className="w-full max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        setError('图片加载失败')
                      }}
                      onLoad={() => {
                        console.log('✅ 图片加载成功')
                      }}
                    />
                  </div>
                  
                  {/* 图片信息 */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      📝 <strong>描述：</strong>{generatedImage.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      🤖 <strong>模型：</strong>{generatedImage.modelUsed}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      📊 <strong>数据大小：</strong>{Math.round(generatedImage.url.length / 1024)} KB
                    </p>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = generatedImage.url
                        link.download = `${query.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.png`
                        link.click()
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      💾 下载图片
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage.url)
                        alert('图片数据已复制到剪贴板')
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      📋 复制数据
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 使用说明 */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 使用说明</h5>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 输入具体的图片描述，如"北京天安门广场"、"日本樱花盛开"</li>
                <li>• 点击"生成图片"按钮或按回车键开始生成</li>
                <li>• 生成的图片为PNG格式，以base64编码返回</li>
                <li>• 可以下载图片或复制base64数据用于其他用途</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
