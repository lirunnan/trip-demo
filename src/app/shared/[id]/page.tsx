'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ItineraryDay } from '@/components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import { useExportFeatures } from '@/hooks/useExportFeatures'
import PageCustomizer from '@/components/PageCustomizer'
import { Calendar, MapPin, Clock, Share2, Download, ArrowLeft, Wand2, Star, Users, Camera } from 'lucide-react'
import Link from 'next/link'

interface ShareableItinerary {
  id: string
  title: string
  itinerary: ItineraryDay[]
  createdAt: string
  totalDays: number
  totalAttractions: number
}

export default function SharedItineraryPage() {
  const params = useParams()
  const id = params.id as string
  const [itinerary, setItinerary] = useState<ShareableItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<'original' | 'minimal' | 'detailed'>('original')
  const [showCustomizer, setShowCustomizer] = useState(false)
  
  const { loadSharedItinerary, exportAsTextFile, copyShareLink } = useExportFeatures()

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true)
        const data = await loadSharedItinerary(id)
        if (data) {
          setItinerary(data)
        } else {
          setError('行程不存在或已过期')
        }
      } catch (err) {
        setError('加载行程失败')
        console.error('加载分享行程失败:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadItinerary()
    }
  }, [id, loadSharedItinerary])

  const handleExport = () => {
    if (itinerary) {
      exportAsTextFile(itinerary.itinerary, itinerary.title)
    }
  }

  const handleShare = async () => {
    if (itinerary) {
      try {
        await copyShareLink(itinerary.itinerary, itinerary.title)
        alert('分享链接已复制到剪贴板！')
      } catch {
        alert('分享失败，请稍后重试')
      }
    }
  }

  // 渲染统一布局结构
  const renderTemplate = () => {
    if (!itinerary) return null

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* 统一的顶部导航 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              
              <div className="flex items-center gap-2">
                {!showCustomizer ? (
                  <button
                    onClick={() => setShowCustomizer(true)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    定制页面
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCustomizer(false)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    关闭定制
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  分享
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主体区域：左侧定制面板 + 右侧内容 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧定制面板 */}
          {showCustomizer && (
            <div className="w-80 flex-shrink-0">
              <PageCustomizer
                onTemplateChange={setCurrentTemplate}
                currentTemplate={currentTemplate}
              />
            </div>
          )}
          
          {/* 右侧内容区域 */}
          <div className="flex-1 h-[calc(100vh-72px)] overflow-y-auto">
            {renderTemplateContent()}
          </div>
        </div>
      </div>
    )
  }

  // 渲染具体的模板内容（不包含布局结构）
  const renderTemplateContent = () => {
    switch (currentTemplate) {
      case 'minimal':
        return renderMinimalContent()
      case 'detailed':
        return renderDetailedContent(showCustomizer)
      default:
        return renderOriginalContent()
    }
  }

  // 渲染原始模式内容
  const renderOriginalContent = () => (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 标题区域 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {itinerary!.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{itinerary!.totalDays} 天行程</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{itinerary!.totalAttractions} 个景点</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>创建于 {new Date(itinerary!.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 行程内容 */}
      <div className="flex-1 overflow-hidden p-6">
        <TravelViews 
          itinerary={itinerary!.itinerary}
          className="h-full"
        />
      </div>
      
      {/* 底部信息 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>由 <span className="font-medium text-blue-500">行呗AI旅游助手</span> 生成</p>
        </div>
      </div>
    </div>
  )

  // 渲染简洁模式内容
  const renderMinimalContent = () => (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-800 mb-4">
              {itinerary!.title}
            </h1>
            <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
              <span>{itinerary!.totalDays} 天</span>
              <span>•</span>
              <span>{itinerary!.totalAttractions} 个地点</span>
            </div>
          </div>

          {/* 行程卡片 - 简洁列表 */}
          <div className="space-y-8">
            {itinerary!.itinerary.map((day, dayIndex) => (
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

          {/* 简洁的底部 */}
          <div className="border-t border-gray-100 pt-8 mt-16">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                生成时间：{new Date(itinerary!.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染详细模式内容
  const renderDetailedContent = (hasCustomizer: boolean = false) => {
    // 计算总预计时间
    const totalHours = itinerary!.itinerary.reduce((dayTotal, day) => {
      return dayTotal + day.locations.reduce((locationTotal, location) => {
        const match = location.duration.match(/(\d+)小时/)
        return locationTotal + (match ? parseInt(match[1]) : 2)
      }, 0)
    }, 0)

    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6">
          {/* 豪华版标题区域 */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-6">
            <h1 className="text-4xl font-bold mb-4">
              {itinerary!.title}
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              精心规划的完美旅程，让每一刻都充满惊喜
            </p>
            
            {/* 统计卡片 */}
            <div className={`grid gap-4 ${hasCustomizer ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">行程天数</span>
                </div>
                <div className="text-2xl font-bold">{itinerary!.totalDays} 天</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">景点数量</span>
                </div>
                <div className="text-2xl font-bold">{itinerary!.totalAttractions} 个</div>
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

          {/* 行程概览卡片 */}
          <div className={`grid gap-6 mb-8 ${hasCustomizer ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">详细行程安排</h2>
              <p className="text-gray-300">可拖拽调整顺序，支持地图和时间表视图</p>
            </div>
            
            <div className="p-6">
              <TravelViews 
                itinerary={itinerary!.itinerary}
                className="h-[600px]"
              />
            </div>
          </div>

          {/* 行程亮点 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">行程亮点</h2>
            <div className={`grid gap-6 ${hasCustomizer ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {itinerary!.itinerary.slice(0, 3).map((day, index) => (
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

          {/* 豪华版底部 */}
          <div className="bg-gray-900 text-white rounded-2xl p-12 text-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">感谢您选择行呗AI旅游助手</h3>
              <p className="text-gray-400">
                让AI为您规划每一次完美的旅程
              </p>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>行程创建时间：{new Date(itinerary!.createdAt).toLocaleString('zh-CN')}</p>
              <p>行程ID：{itinerary!.id}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载行程...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {error || '行程不存在'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            该行程可能已被删除或链接已过期
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return renderTemplate()
}