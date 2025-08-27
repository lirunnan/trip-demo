'use client'

import { ItineraryDay } from '@/components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import { Calendar, MapPin, Clock, Share2, Download, ArrowLeft, Star, Users, Camera } from 'lucide-react'
import Link from 'next/link'

interface ShareableItinerary {
  id: string
  title: string
  itinerary: ItineraryDay[]
  createdAt: string
  totalDays: number
  totalAttractions: number
}

interface DetailedTemplateProps {
  itinerary: ShareableItinerary
  onExport: () => void
  onShare: () => void
}

export default function DetailedTemplate({ itinerary, onExport, onShare }: DetailedTemplateProps) {
  // 计算总预计时间
  const totalHours = itinerary.itinerary.reduce((dayTotal, day) => {
    return dayTotal + day.locations.reduce((locationTotal, location) => {
      const match = location.duration.match(/(\d+)小时/)
      return locationTotal + (match ? parseInt(match[1]) : 2)
    }, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 豪华版头部 */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">返回首页</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-medium">分享行程</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">导出PDF</span>
              </button>
            </div>
          </div>
          
          {/* 豪华版标题区域 */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-6">
            <h1 className="text-4xl font-bold mb-4">
              {itinerary.title}
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              精心规划的完美旅程，让每一刻都充满惊喜
            </p>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">行程天数</span>
                </div>
                <div className="text-2xl font-bold">{itinerary.totalDays} 天</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">景点数量</span>
                </div>
                <div className="text-2xl font-bold">{itinerary.totalAttractions} 个</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">总时长</span>
                </div>
                <div className="text-2xl font-bold">{totalHours} 小时</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">推荐指数</span>
                </div>
                <div className="text-2xl font-bold">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行程概览卡片 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">适合人群</h3>
                <p className="text-gray-500 text-sm">全家出游 • 朋友聚会</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              这条路线适合各种年龄段的游客，包含了文化、自然、美食等多种体验。
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">拍照打卡</h3>
                <p className="text-gray-500 text-sm">网红景点 • 绝佳视角</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              每个景点都有独特的拍照角度，让您的朋友圈与众不同。
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">最佳时间</h3>
                <p className="text-gray-500 text-sm">春秋两季 • 气候宜人</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              避开高峰期，选择最舒适的季节出行，体验更佳。
            </p>
          </div>
        </div>

        {/* 详细的行程视图 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">详细行程安排</h2>
            <p className="text-gray-300">可拖拽调整顺序，支持地图和时间表视图</p>
          </div>
          
          <div className="p-6">
            <TravelViews 
              itinerary={itinerary.itinerary}
              className="h-[600px]"
            />
          </div>
        </div>

        {/* 行程亮点 */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">行程亮点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itinerary.itinerary.slice(0, 3).map((day, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-3">第 {day.day} 天精选</h3>
                  <div className="space-y-2">
                    {day.locations.slice(0, 2).map((location, locIndex) => (
                      <div key={locIndex} className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">{location.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 豪华版底部 */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">感谢您选择行呗AI旅游助手</h3>
            <p className="text-gray-400">
              让AI为您规划每一次完美的旅程
            </p>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>行程创建时间：{new Date(itinerary.createdAt).toLocaleString('zh-CN')}</p>
            <p>行程ID：{itinerary.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}