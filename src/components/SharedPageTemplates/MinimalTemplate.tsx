'use client'

import { ItineraryDay } from '@/components/ChatInterface'
import { Share2, Download, ArrowLeft, Wand2 } from 'lucide-react'
import Link from 'next/link'

interface ShareableItinerary {
  id: string
  title: string
  itinerary: ItineraryDay[]
  createdAt: string
  totalDays: number
  totalAttractions: number
}

interface MinimalTemplateProps {
  itinerary: ShareableItinerary
  onExport: () => void
  onShare: () => void
  showCustomizer?: boolean
  onToggleCustomizer?: () => void
  customizerPanel?: React.ReactNode
}

export default function MinimalTemplate({ 
  itinerary, 
  onExport, 
  onShare, 
  showCustomizer = false, 
  onToggleCustomizer, 
  customizerPanel 
}: MinimalTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* 简洁的顶部导航 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-3">
              {onToggleCustomizer && !showCustomizer && (
                <button
                  onClick={onToggleCustomizer}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="定制页面"
                >
                  <Wand2 className="w-5 h-5" />
                </button>
              )}
              {onToggleCustomizer && showCustomizer && (
                <button
                  onClick={onToggleCustomizer}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="关闭定制"
                >
                  <Wand2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onExport}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 - 极简设计 */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左侧定制面板 */}
        {showCustomizer && customizerPanel && (
          <div className="w-80 flex-shrink-0">
            {customizerPanel}
          </div>
        )}
        
        {/* 右侧内容 */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-12">
              <div className={`mx-auto ${showCustomizer ? 'max-w-3xl' : 'max-w-4xl'}`}>
                {/* 标题区域 */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-light text-gray-800 mb-4">
                    {itinerary.title}
                  </h1>
                  <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
                    <span>{itinerary.totalDays} 天</span>
                    <span>•</span>
                    <span>{itinerary.totalAttractions} 个地点</span>
                  </div>
                </div>

                {/* 行程卡片 - 简洁列表 */}
                <div className="space-y-8">
                  {itinerary.itinerary.map((day, dayIndex) => (
                    <div key={dayIndex} className="border-l-2 border-gray-100 pl-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {day.day}
                        </div>
                        <h2 className="text-xl font-medium text-gray-800">
                          第 {day.day} 天
                        </h2>
                        <span className="text-gray-400 text-sm">{day.date}</span>
                      </div>
                      
                      <div className="space-y-3 ml-11">
                        {day.locations.map((location, locationIndex) => (
                          <div key={locationIndex} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2"></div>
                            <div>
                              <h3 className="font-medium text-gray-800">{location.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{location.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span>{location.type}</span>
                                <span>{location.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* 简洁的底部 */}
      <div className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            生成时间：{new Date(itinerary.createdAt).toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  )
}