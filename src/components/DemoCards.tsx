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
    id: 'beijing-imperial',
    title: '北京皇城文化之旅',
    destination: '北京',
    duration: '4天3夜',
    theme: '历史文化',
    highlights: ['故宫', '天坛', '颐和园', '长城'],
    preview: '探索千年古都，感受厚重历史文化和皇家园林之美'
  },
  {
    id: 'hangzhou-jiangnan',
    title: '杭州江南水乡',
    destination: '杭州',
    duration: '3天2夜',
    theme: '自然风光',
    highlights: ['西湖', '灵隐寺', '宋城', '河坊街'],
    preview: '人间天堂美景，品味江南水乡的诗情画意'
  },
  {
    id: 'chengdu-panda',
    title: '成都美食熊猫游',
    destination: '成都',
    duration: '3天2夜',
    theme: '美食文化',
    highlights: ['大熊猫基地', '宽窄巷子', '火锅', '川菜'],
    preview: '巴蜀文化体验，品尝正宗川菜，邂逅可爱国宝'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.33fr] gap-4">
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
          <div className="p-2 flex flex-col items-center justify-center text-center">
            <div className="mb-1">
              <TrendingUp className="w-6 h-6 text-orange-500 group-hover:text-orange-600 transition-colors mx-auto" />
            </div>
            <h3 className="text-xs font-semibold text-orange-800 dark:text-orange-300 group-hover:text-orange-900 dark:group-hover:text-orange-200 transition-colors">
              热门攻略
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}