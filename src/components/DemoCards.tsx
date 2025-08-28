'use client'

import { MapPin, Clock, Copy, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface DemoGuide {
  id: string
  title: string
  destination: string
  duration: string
  theme: string
  highlights: string[]
  preview: string
}

interface DemoCardsProps {
  onSelectDemo: (demo: DemoGuide) => void
  onShowPopularGuides?: () => void
}

const demoGuides: DemoGuide[] = [
  {
    id: 'tokyo-3days',
    title: '东京3日深度游',
    destination: '东京',
    duration: '3天2夜',
    theme: '文化体验',
    highlights: ['浅草寺', '东京塔', '银座购物', '筑地市场'],
    preview: '经典东京必去景点，完美的初次日本行程规划'
  },
  {
    id: 'paris-romance',
    title: '巴黎浪漫之旅',
    destination: '巴黎',
    duration: '4天3夜',
    theme: '浪漫度假',
    highlights: ['埃菲尔铁塔', '卢浮宫', '塞纳河游船', '香榭丽舍大街'],
    preview: '感受法式浪漫，品味艺术与美食的完美结合'
  },
  {
    id: 'thailand-adventure',
    title: '泰国海岛探险',
    destination: '普吉岛',
    duration: '5天4夜',
    theme: '海岛度假',
    highlights: ['皮皮岛', '攀牙湾', '泰式按摩', '海鲜大餐'],
    preview: '热带海岛风情，享受阳光沙滩和异域文化'
  }
]

export default function DemoCards({ onSelectDemo, onShowPopularGuides }: DemoCardsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (demo: DemoGuide, e: React.MouseEvent) => {
    e.stopPropagation()
    const content = `${demo.title}\n目的地: ${demo.destination}\n时长: ${demo.duration}\n主题: ${demo.theme}\n亮点: ${demo.highlights.join(', ')}\n\n${demo.preview}`
    
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(demo.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoGuides.map((demo) => (
          <div
            key={demo.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 group"
            onClick={() => onSelectDemo(demo)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">
                  {demo.title}
                </h3>
                <button
                  onClick={(e) => handleCopy(demo, e)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  title="复制攻略"
                >
                  <Copy 
                    className={`w-3 h-3 ${
                      copiedId === demo.id 
                        ? 'text-green-500' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{demo.destination}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{demo.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {demo.theme}
                  </span>
                  {demo.highlights.slice(0, 2).map((highlight, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 热门攻略入口卡片 */}
        <div
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-orange-200 dark:border-orange-800 group"
          onClick={onShowPopularGuides}
        >
          <div className="p-3 h-full flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <TrendingUp className="w-8 h-8 text-orange-500 group-hover:text-orange-600 transition-colors mx-auto" />
            </div>
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 group-hover:text-orange-900 dark:group-hover:text-orange-200 transition-colors mb-1">
              热门攻略
            </h3>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              发现更多精彩旅程
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}