'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ItineraryDay } from '@/components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import { useExportFeatures } from '@/hooks/useExportFeatures'
import MinimalTemplate from '@/components/SharedPageTemplates/MinimalTemplate'
import DetailedTemplate from '@/components/SharedPageTemplates/DetailedTemplate'
import PageCustomizer from '@/components/PageCustomizer'
import { Calendar, MapPin, Clock, Share2, Download, ArrowLeft, Wand2 } from 'lucide-react'
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
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)
  
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

  // 渲染不同的模板
  const renderTemplate = () => {
    if (!itinerary) return null

    const templateProps = {
      itinerary,
      onExport: handleExport,
      onShare: handleShare
    }

    switch (currentTemplate) {
      case 'minimal':
        return <MinimalTemplate {...templateProps} />
      case 'detailed':
        return <DetailedTemplate {...templateProps} />
      default:
        return renderOriginalTemplate()
    }
  }

  const renderOriginalTemplate = () => {
    if (!itinerary) return null

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 原始模板头部 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomizerOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  定制页面
                </button>
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
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {itinerary.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{itinerary.totalDays} 天行程</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.totalAttractions} 个景点</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>创建于 {new Date(itinerary.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 行程内容 */}
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <TravelViews 
              itinerary={itinerary.itinerary}
              className="h-[calc(100vh-200px)]"
            />
          </div>
        </div>
        
        {/* 底部信息 */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>由 <span className="font-medium text-blue-500">行呗AI旅游助手</span> 生成</p>
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

  return (
    <>
      {renderTemplate()}
      
      {/* 页面定制器 */}
      <PageCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onTemplateChange={setCurrentTemplate}
        currentTemplate={currentTemplate}
      />
    </>
  )
}