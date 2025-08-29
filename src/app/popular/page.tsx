'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PopularGuide {
  id: string
  title: string
  destination: string
  duration: string
  theme: string
  rating: number
  views: number
  likes: number
  preview: string
  thumbnail: string
  tags: string[]
}

// Mock热门攻略数据
const popularGuides: PopularGuide[] = [
  {
    id: 'japan-sakura-7days',
    title: '日本樱花季7日深度游',
    destination: '东京·京都·大阪',
    duration: '7天6夜',
    theme: '樱花季',
    rating: 4.8,
    views: 15420,
    likes: 892,
    preview: '完美的樱花季行程，涵盖东京、京都、大阪三地最佳赏樱地点，包含温泉体验和传统文化感受',
    thumbnail: '/api/placeholder/300/200',
    tags: ['樱花', '温泉', '文化', '美食']
  },
  {
    id: 'thailand-chiangmai-5days',
    title: '泰国清迈古城悠闲5日游',
    destination: '清迈',
    duration: '5天4夜',
    theme: '古城文化',
    rating: 4.6,
    views: 8965,
    likes: 534,
    preview: '远离喧嚣的古城之旅，体验泰北文化与美食，包含寺庙参观和夜市体验',
    thumbnail: '/api/placeholder/300/200',
    tags: ['古城', '文化', '美食', '寺庙']
  },
  {
    id: 'xinjiang-tianshan-photo',
    title: '新疆天山深度摄影之旅',
    destination: '乌鲁木齐·喀纳斯',
    duration: '8天7夜',
    theme: '摄影探险',
    rating: 4.9,
    views: 12350,
    likes: 721,
    preview: '专业摄影师带队，深入天山腹地捕捉绝美风光，适合摄影爱好者',
    thumbnail: '/api/placeholder/300/200',
    tags: ['摄影', '自然', '探险', '风光']
  },
  {
    id: 'sichuan-west-road-trip',
    title: '川西秘境自驾游攻略',
    destination: '成都·稻城亚丁',
    duration: '10天9夜',
    theme: '自驾探险',
    rating: 4.7,
    views: 20145,
    likes: 1203,
    preview: '川西环线自驾，稻城亚丁、色达、新都桥一网打尽，高原美景震撼心灵',
    thumbnail: '/api/placeholder/300/200',
    tags: ['自驾', '高原', '秘境', '寺庙']
  },
  {
    id: 'bali-honeymoon',
    title: '巴厘岛蜜月浪漫之旅',
    destination: '巴厘岛',
    duration: '6天5夜',
    theme: '蜜月度假',
    rating: 4.8,
    views: 9876,
    likes: 654,
    preview: '精心设计的蜜月行程，海滩、SPA、美食一应俱全，完美的二人世界',
    thumbnail: '/api/placeholder/300/200',
    tags: ['蜜月', '海滩', 'SPA', '浪漫']
  },
  {
    id: 'tibet-lhasa-spiritual',
    title: '西藏拉萨心灵净化之旅',
    destination: '拉萨·林芝',
    duration: '7天6夜',
    theme: '心灵之旅',
    rating: 4.9,
    views: 16789,
    likes: 987,
    preview: '高原朝圣之路，感受藏地文化的深厚底蕴，净化心灵的神圣之旅',
    thumbnail: '/api/placeholder/300/200',
    tags: ['朝圣', '文化', '心灵', '高原']
  },
  {
    id: 'yunnan-dali-lijiang',
    title: '云南大理丽江古城游',
    destination: '大理·丽江',
    duration: '5天4夜',
    theme: '古城风情',
    rating: 4.5,
    views: 11234,
    likes: 678,
    preview: '漫步古城石板路，体验白族纳西族文化，享受慢生活节奏',
    thumbnail: '/api/placeholder/300/200',
    tags: ['古城', '民族', '慢生活', '文化']
  },
  {
    id: 'hainan-sanya-beach',
    title: '海南三亚椰风海韵度假',
    destination: '三亚',
    duration: '4天3夜',
    theme: '海滩度假',
    rating: 4.4,
    views: 7856,
    likes: 423,
    preview: '热带海滨风情，椰林沙滩与碧海蓝天，完美的度假胜地',
    thumbnail: '/api/placeholder/300/200',
    tags: ['海滩', '度假', '热带', '椰林']
  }
]

export default function PopularGuidesPage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const handleGuideClick = (guide: PopularGuide) => {
    // 创建查询参数，将攻略信息传递给攻略详情页
    const params = new URLSearchParams({
      title: guide.title,
      destination: guide.destination,
      duration: guide.duration,
      theme: guide.theme,
      preview: guide.preview
    })
    
    router.push(`/guide/${guide.id}?${params}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* 头部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                热门攻略
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                发现最受欢迎的旅游攻略，开启你的精彩旅程
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 攻略网格 */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 group overflow-hidden"
              onMouseEnter={() => setHoveredCard(guide.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleGuideClick(guide)}
            >
              {/* 缩略图 */}
              <div className="relative h-36 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-4xl">
                  {guide.destination.split('·')[0].charAt(0)}
                </div>
                
                {/* 悬浮效果 */}
                {hoveredCard === guide.id && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-sm font-medium">点击查看详情</div>
                    </div>
                  </div>
                )}

                {/* 评分标签 */}
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {guide.rating}
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                  {guide.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{guide.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{guide.duration}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                  {guide.preview}
                </p>

                <div className="flex flex-wrap gap-1 mb-1">
                  {guide.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                    {guide.theme}
                  </span>
                  <div className="text-xs">
                    {guide.views.toLocaleString()} 浏览 · {guide.likes} 点赞
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}