'use client'

import { MapPin, Clock, Copy, Sparkles } from 'lucide-react'
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

export default function DemoCards({ onSelectDemo }: DemoCardsProps) {
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
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          推荐攻略
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoGuides.map((demo) => (
          <div
            key={demo.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 group"
            onClick={() => onSelectDemo(demo)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {demo.title}
                </h3>
                <button
                  onClick={(e) => handleCopy(demo, e)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="复制攻略"
                >
                  <Copy 
                    className={`w-4 h-4 ${
                      copiedId === demo.id 
                        ? 'text-green-500' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{demo.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{demo.duration}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                  {demo.theme}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                {demo.preview}
              </p>

              <div className="flex flex-wrap gap-1">
                {demo.highlights.map((highlight, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}