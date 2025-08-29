'use client'

import { useState } from 'react'
import { Heart, Eye, Star, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

interface TravelTemplate {
  id: string
  title: string
  author: string
  avatar: string
  thumbnail: string
  views: number
  likes: number
  rating: number
  description: string
  tags: string[]
  shareUrl: string
}

interface TravelCommunityProps {
  onApplyTemplate?: (template: TravelTemplate) => void
  onExitCommunity?: () => void
  onPreviewTemplate?: (template: TravelTemplate) => void
}

// Mock数据 - 旅游攻略模板
const mockTemplates: TravelTemplate[] = [
  {
    id: '1',
    title: '日本樱花季7日深度游',
    author: '樱花小姐姐',
    avatar: '🌸',
    thumbnail: '/api/placeholder/300/200',
    views: 15420,
    likes: 892,
    rating: 4.8,
    description: '完美的樱花季行程，涵盖东京、京都、大阪三地最佳赏樱地点',
    tags: ['樱花', '日本', '春季', '摄影'],
    shareUrl: '/shared/japan-sakura-7days'
  },
  {
    id: '2',
    title: '泰国清迈古城悠闲5日游',
    author: '慢生活达人',
    avatar: '🏯',
    thumbnail: '/api/placeholder/300/200',
    views: 8965,
    likes: 534,
    rating: 4.6,
    description: '远离喧嚣的古城之旅，体验泰北文化与美食',
    tags: ['泰国', '古城', '文化', '美食'],
    shareUrl: '/shared/thailand-chiangmai-5days'
  },
  {
    id: '3',
    title: '新疆天山深度摄影之旅',
    author: '大漠孤烟',
    avatar: '🏔️',
    thumbnail: '/api/placeholder/300/200',
    views: 12350,
    likes: 721,
    rating: 4.9,
    description: '专业摄影师带队，深入天山腹地捕捉绝美风光',
    tags: ['新疆', '摄影', '自然', '探险'],
    shareUrl: '/shared/xinjiang-tianshan-photo'
  },
  {
    id: '4',
    title: '川西秘境自驾游攻略',
    author: '自驾狂人',
    avatar: '🚗',
    thumbnail: '/api/placeholder/300/200',
    views: 20145,
    likes: 1203,
    rating: 4.7,
    description: '10天川西环线，稻城亚丁、色达、新都桥一网打尽',
    tags: ['四川', '自驾', '高原', '秘境'],
    shareUrl: '/shared/sichuan-west-road-trip'
  },
  {
    id: '5',
    title: '巴厘岛蜜月浪漫之旅',
    author: '蜜月规划师',
    avatar: '💕',
    thumbnail: '/api/placeholder/300/200',
    views: 9876,
    likes: 654,
    rating: 4.8,
    description: '精心设计的蜜月行程，海滩、SPA、美食一应俱全',
    tags: ['巴厘岛', '蜜月', '海滩', '浪漫'],
    shareUrl: '/shared/bali-honeymoon'
  },
  {
    id: '6',
    title: '西藏拉萨心灵净化之旅',
    author: '藏区行者',
    avatar: '🙏',
    thumbnail: '/api/placeholder/300/200',
    views: 16789,
    likes: 987,
    rating: 4.9,
    description: '高原朝圣之路，感受藏地文化的深厚底蕴',
    tags: ['西藏', '文化', '心灵', '朝圣'],
    shareUrl: '/shared/tibet-lhasa-spiritual'
  }
]

export default function TravelCommunity({ onApplyTemplate, onExitCommunity, onPreviewTemplate }: TravelCommunityProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // 一页显示8个（2行 x 4列）
  
  // 计算分页数据
  const totalPages = Math.ceil(mockTemplates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentTemplates = mockTemplates.slice(startIndex, startIndex + itemsPerPage)

  const handleApplyTemplate = (template: TravelTemplate) => {
    onApplyTemplate?.(template)
  }

  const handlePreviewTemplate = (template: TravelTemplate) => {
    onPreviewTemplate?.(template)
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 退出社区按钮 */}
            <button
              onClick={onExitCommunity}
              className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="退出社区"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* 标题区域 */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                旅游攻略社区
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                发现精彩旅程，一键应用优质攻略
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4" />
            <span>精选推荐</span>
          </div>
        </div>
      </div>

      {/* 攻略网格 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
          {currentTemplates.map((template) => (
            <div
              key={template.id}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              onMouseEnter={() => setHoveredCard(template.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 缩略图 */}
              <div className="relative h-32 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                {/* 模拟缩略图内容 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-4xl">
                  {template.avatar}
                </div>
                
                {/* 悬浮蒙版和按钮 */}
                {hoveredCard === template.id && (
                  <div className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-medium transform hover:scale-105 transition-all duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transform hover:scale-105 transition-all duration-200"
                    >
                      一键应用
                    </button>
                  </div>
                )}

                {/* 评分标签 */}
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {template.rating}
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-2">
                {/* 标题和作者 */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm">
                  {template.title}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">
                    {template.avatar}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {template.author}
                  </span>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{template.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{template.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    <span>{template.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分页控件 - 固定在底部 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}