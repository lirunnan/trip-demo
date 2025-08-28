'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ItineraryDay } from '@/components/ChatInterface'
import TravelViews from '@/components/TravelViews'
import { useExportFeatures } from '@/hooks/useExportFeatures'
import PageCustomizer from '@/components/PageCustomizer'
import TravelCommunity from '@/components/TravelCommunity'
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

interface ServerRenderedContent {
  id: string
  title: string
  html: string
  createdAt: string
}

export default function SharedItineraryPage() {
  const params = useParams()
  const id = params.id as string
  const [itinerary, setItinerary] = useState<ShareableItinerary | null>(null)
  const [serverContent, setServerContent] = useState<ServerRenderedContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTemplate, setCurrentTemplate] = useState<'original' | 'minimal' | 'detailed'>('original')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [renderMode, setRenderMode] = useState<'server' | 'client'>('server')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showCommunity, setShowCommunity] = useState(false)
  const [addAdoptionFunc, setAddAdoptionFunc] = useState<((title: string, shareUrl: string) => void) | null>(null)
  
  const { loadSharedItinerary, exportAsTextFile, copyShareLink } = useExportFeatures()

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)
        
        // 检查URL参数，决定渲染模式
        const urlParams = new URLSearchParams(window.location.search)
        const forceClientRender = urlParams.get('render') === 'client'
        
        if (!forceClientRender) {
          // 首先尝试从服务端API获取HTML内容
          try {
            const response = await fetch(`/api/shared/${id}`)
            if (response.ok) {
              const result = await response.json()
              if (result.success && result.data) {
                setServerContent(result.data)
                setRenderMode('server')
                return
              }
            }
          } catch (apiError) {
            console.log('服务端API获取失败，尝试客户端渲染:', apiError)
          }
        }
        
        // 如果强制客户端渲染或服务端API失败，使用客户端渲染
        const data = await loadSharedItinerary(id)
        if (data) {
          setItinerary(data)
          setRenderMode('client')
        } else {
          setError('分享内容不存在或已过期')
        }
        
      } catch (err) {
        setError('加载分享内容失败')
        console.error('加载分享内容失败:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadContent()
    }
  }, [id, loadSharedItinerary])

  const handleExport = () => {
    if (renderMode === 'server' && serverContent) {
      // 服务端渲染模式：导出完整页面HTML
      const exportHtml = generateCompletePageHtml(true)
      const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${serverContent.title}_${currentTemplate}_${new Date().toISOString().split('T')[0]}.html`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (renderMode === 'client' && itinerary) {
      // 客户端渲染模式：导出完整页面HTML
      const exportHtml = generateCompletePageHtml(false)
      const blob = new Blob([exportHtml], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${itinerary.title}_${currentTemplate}_${new Date().toISOString().split('T')[0]}.html`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleShare = async (mode: 'server' | 'client') => {
    try {
      let shareUrl = `${window.location.origin}/shared/${id}`
      if (mode === 'client') {
        shareUrl += '?render=client'
      }
      
      await navigator.clipboard.writeText(shareUrl)
      alert(`${mode === 'server' ? '服务端渲染' : '客户端渲染'}分享链接已复制到剪贴板！`)
      setShowShareMenu(false)
    } catch {
      alert('分享失败，请稍后重试')
    }
  }

  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu)
  }

  const handleShowCommunity = useCallback(() => {
    setShowCommunity(true)
  }, [])

  const handleApplyTemplate = useCallback((template: any) => {
    if (addAdoptionFunc) {
      addAdoptionFunc(template.title, template.shareUrl)
    }
    setShowCommunity(false)
  }, [addAdoptionFunc])

  const handleExitCommunity = useCallback(() => {
    setShowCommunity(false)
  }, [])

  const handlePreviewTemplate = useCallback((template: any) => {
    // 在新窗口打开攻略预览
    const previewUrl = `http://localhost:3001${template.shareUrl}`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const handleAddAdoptionMessage = useCallback((addFunc: (title: string, shareUrl: string) => void) => {
    setAddAdoptionFunc(() => addFunc)
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.share-menu-container')) {
          setShowShareMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  // 根据模板类型处理服务端HTML内容
  const getStyledServerContent = () => {
    if (!serverContent) return ''
    
    let styledContent = serverContent.html
    
    // 根据不同模板注入相应的样式覆盖
    const templateStyles = {
      minimal: `
        <style>
          .server-rendered-content .shared-content {
            font-family: 'Georgia', serif !important;
            background: white !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-sizing: border-box !important;
          }
          .server-rendered-content .header-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            color: #495057 !important;
            border: 1px solid #dee2e6 !important;
          }
          .server-rendered-content .main-title {
            color: #212529 !important;
            font-weight: 300 !important;
            text-shadow: none !important;
          }
          .server-rendered-content .stat-item {
            background: rgba(108, 117, 125, 0.1) !important;
            color: #6c757d !important;
          }
          .server-rendered-content .day-card {
            box-shadow: none !important;
            border: 1px solid #e9ecef !important;
            background: #fefefe !important;
          }
          .server-rendered-content .location-item {
            background: #f8f9fa !important;
            border-left: 2px solid #6c757d !important;
          }
          .server-rendered-content .time {
            color: #6c757d !important;
          }
          .server-rendered-content .tips-section {
            background: #f8f9fa !important;
            border: 1px solid #dee2e6 !important;
          }
          .server-rendered-content .tips-section h2 {
            color: #495057 !important;
          }
          .server-rendered-content .tips-section li {
            color: #6c757d !important;
          }
        </style>
      `,
      detailed: `
        <style>
          .server-rendered-content .shared-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            padding: 30px !important;
            border-radius: 20px !important;
            margin: 0 !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .server-rendered-content .header-section {
            background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%) !important;
            transform: rotate(-2deg) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
            border-radius: 20px !important;
          }
          .server-rendered-content .main-title {
            font-size: 3rem !important;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5) !important;
            animation: pulse 2s infinite !important;
          }
          .server-rendered-content .stat-item {
            background: rgba(255,255,255,0.3) !important;
            backdrop-filter: blur(15px) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
          }
          .server-rendered-content .day-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            transform: rotate(1deg) !important;
            margin: 20px 0 !important;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3) !important;
            border-radius: 20px !important;
            border: none !important;
          }
          .server-rendered-content .day-card:nth-child(even) {
            transform: rotate(-1deg) !important;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
          }
          .server-rendered-content .day-title {
            color: white !important;
            border-bottom: 2px solid rgba(255,255,255,0.3) !important;
            font-size: 1.8rem !important;
          }
          .server-rendered-content .location-item {
            background: rgba(255,255,255,0.15) !important;
            border-left: 4px solid #ffd93d !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px !important;
          }
          .server-rendered-content .location-item h3 {
            color: white !important;
            font-size: 1.3rem !important;
          }
          .server-rendered-content .location-item p {
            color: rgba(255,255,255,0.9) !important;
          }
          .server-rendered-content .time {
            color: #ffd93d !important;
            font-weight: bold !important;
          }
          .server-rendered-content .tips-section {
            background: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 20px !important;
            transform: rotate(-1deg) !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
          }
          .server-rendered-content .tips-section h2 {
            color: white !important;
            font-size: 1.5rem !important;
          }
          .server-rendered-content .tips-section li {
            color: white !important;
          }
          .server-rendered-content .footer-section {
            background: rgba(255,255,255,0.1) !important;
            color: white !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      original: `
        <style>
          .server-rendered-content .shared-content {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-sizing: border-box !important;
          }
        </style>
      `
    }
    
    // 添加通用的容器样式，确保不会溢出
    const baseStyles = `
      <style>
        .server-rendered-content {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        .server-rendered-content * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .server-rendered-content img {
          height: auto !important;
          max-width: 100% !important;
        }
        .server-rendered-content table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .server-rendered-content pre, 
        .server-rendered-content code {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
        }
      </style>
    `
    
    // 在HTML内容末尾添加样式
    const additionalStyles = templateStyles[currentTemplate] || templateStyles.original
    const allStyles = baseStyles + additionalStyles
    
    // 在最后一个</div>前插入样式
    const lastDivIndex = styledContent.lastIndexOf('</div>')
    if (lastDivIndex !== -1) {
      styledContent = styledContent.substring(0, lastDivIndex) + allStyles + styledContent.substring(lastDivIndex)
    } else {
      styledContent += allStyles
    }
    
    return styledContent
  }

  // 为客户端模式生成HTML内容
  const generateClientHtml = () => {
    if (!itinerary) return ''
    
    const title = itinerary.title
    const totalDays = itinerary.totalDays
    const totalAttractions = itinerary.totalAttractions
    
    // 根据不同模板生成不同样式的HTML
    let templateClass = ''
    let headerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    let borderColor = '#3b82f6'
    
    switch (currentTemplate) {
      case 'minimal':
        templateClass = 'minimal-template'
        headerGradient = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        borderColor = '#6c757d'
        break
      case 'detailed':
        templateClass = 'detailed-template'
        headerGradient = 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)'
        borderColor = '#ffd93d'
        break
      default:
        templateClass = 'original-template'
    }
    
    const daysHtml = itinerary.itinerary.map((day: any) => `
      <div class="day-card">
        <h2 class="day-title">第${day.day}天 - ${day.date}</h2>
        <div class="locations">
          ${day.locations.map((location: any) => `
            <div class="location-item">
              <h3>${location.name}</h3>
              <p>${location.description}</p>
              <span class="time">${location.duration} • ${location.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')

    return `
      <div class="shared-content ${templateClass}">
        <div class="header-section">
          <h1 class="main-title">${title}</h1>
          <div class="trip-stats">
            <span class="stat-item">${totalDays}天行程</span>
            <span class="stat-item">${totalAttractions}个景点</span>
            <span class="stat-item">客户端渲染 - ${currentTemplate === 'original' ? '原始' : currentTemplate === 'minimal' ? '简洁' : '详细'}模式</span>
          </div>
        </div>
        
        <div class="itinerary-section">
          ${daysHtml}
        </div>
        
        <div class="tips-section">
          <h2>旅行贴士</h2>
          <ul>
            <li>建议提前预订门票，避免现场排队</li>
            <li>注意天气变化，随身携带雨具</li>
            <li>保持手机电量，随时导航</li>
            <li>尊重当地文化和习俗</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <p>由 <strong>行呗AI旅游助手</strong> 精心规划</p>
          <p>导出时间：${new Date().toLocaleString('zh-CN')}</p>
          <p>导出模式：客户端渲染 - ${currentTemplate === 'original' ? '原始' : currentTemplate === 'minimal' ? '简洁' : '详细'}模板</p>
        </div>
        
        <style>
          .shared-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: ${headerGradient};
            color: ${currentTemplate === 'minimal' ? '#495057' : 'white'};
            border-radius: 12px;
            ${currentTemplate === 'detailed' ? 'transform: rotate(-1deg); box-shadow: 0 10px 30px rgba(0,0,0,0.2);' : ''}
          }
          
          .main-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: ${currentTemplate === 'minimal' ? 'none' : '2px 2px 4px rgba(0,0,0,0.3)'};
            ${currentTemplate === 'detailed' ? 'animation: pulse 2s infinite;' : ''}
          }
          
          .trip-stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .stat-item {
            background: ${currentTemplate === 'minimal' ? 'rgba(108, 117, 125, 0.1)' : 'rgba(255,255,255,0.2)'};
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            color: ${currentTemplate === 'minimal' ? '#6c757d' : 'inherit'};
            ${currentTemplate === 'detailed' ? 'backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.2);' : ''}
          }
          
          .day-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: ${currentTemplate === 'minimal' ? 'none' : currentTemplate === 'detailed' ? '0 15px 35px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)'};
            border: ${currentTemplate === 'minimal' ? '1px solid #e9ecef' : 'none'};
            ${currentTemplate === 'detailed' ? `
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              transform: rotate(1deg);
            ` : ''}
          }
          
          .day-card:nth-child(even) {
            ${currentTemplate === 'detailed' ? `
              transform: rotate(-1deg);
              background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            ` : ''}
          }
          
          .day-title {
            color: ${currentTemplate === 'detailed' ? 'white' : '#1f2937'};
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid ${currentTemplate === 'detailed' ? 'rgba(255,255,255,0.3)' : '#e5e7eb'};
          }
          
          .location-item {
            margin-bottom: 20px;
            padding: 15px;
            background: ${currentTemplate === 'minimal' ? '#f8f9fa' : currentTemplate === 'detailed' ? 'rgba(255,255,255,0.15)' : '#f9fafb'};
            border-radius: ${currentTemplate === 'detailed' ? '15px' : '8px'};
            border-left: 4px solid ${currentTemplate === 'detailed' ? '#ffd93d' : borderColor};
            ${currentTemplate === 'detailed' ? 'backdrop-filter: blur(10px);' : ''}
          }
          
          .location-item:last-child {
            margin-bottom: 0;
          }
          
          .location-item h3 {
            color: ${currentTemplate === 'detailed' ? 'white' : '#1f2937'};
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .location-item p {
            color: ${currentTemplate === 'detailed' ? 'rgba(255,255,255,0.9)' : '#6b7280'};
            margin-bottom: 8px;
          }
          
          .time {
            color: ${currentTemplate === 'detailed' ? '#ffd93d' : borderColor};
            font-size: 0.9rem;
            font-weight: ${currentTemplate === 'detailed' ? 'bold' : '500'};
          }
          
          .tips-section {
            background: ${currentTemplate === 'minimal' ? '#f8f9fa' : currentTemplate === 'detailed' ? 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)' : '#fffbeb'};
            border-radius: ${currentTemplate === 'detailed' ? '20px' : '12px'};
            padding: 25px;
            margin: 30px 0;
            border: 1px solid ${currentTemplate === 'minimal' ? '#dee2e6' : currentTemplate === 'detailed' ? 'none' : '#f59e0b'};
            color: ${currentTemplate === 'detailed' ? 'white' : 'inherit'};
            ${currentTemplate === 'detailed' ? 'transform: rotate(-0.5deg); box-shadow: 0 10px 25px rgba(0,0,0,0.2);' : ''}
          }
          
          .tips-section h2 {
            color: ${currentTemplate === 'minimal' ? '#495057' : currentTemplate === 'detailed' ? 'white' : '#f59e0b'};
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .tips-section ul {
            list-style: none;
            padding: 0;
          }
          
          .tips-section li {
            padding: 8px 0;
            position: relative;
            padding-left: 20px;
            color: ${currentTemplate === 'minimal' ? '#6c757d' : currentTemplate === 'detailed' ? 'white' : '#92400e'};
          }
          
          .tips-section li:before {
            content: "💡";
            position: absolute;
            left: 0;
          }
          
          .footer-section {
            text-align: center;
            padding: 20px;
            color: ${currentTemplate === 'detailed' ? 'white' : '#6b7280'};
            font-size: 0.9rem;
            border-top: 1px solid ${currentTemplate === 'detailed' ? 'rgba(255,255,255,0.2)' : '#e5e7eb'};
            margin-top: 30px;
            ${currentTemplate === 'detailed' ? 'background: rgba(255,255,255,0.1); border-radius: 15px; border: 1px solid rgba(255,255,255,0.2);' : ''}
          }
          
          .footer-section strong {
            color: ${currentTemplate === 'detailed' ? 'white' : borderColor};
          }
          
          ${currentTemplate === 'detailed' ? `
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          ` : ''}
          
          @media (max-width: 768px) {
            .shared-content {
              padding: 15px;
            }
            
            .main-title {
              font-size: 2rem;
            }
            
            .trip-stats {
              gap: 10px;
            }
            
            .day-card {
              padding: 20px;
            }
          }
        </style>
      </div>
    `
  }

  // 生成完整的页面HTML（包含页面布局）
  const generateCompletePageHtml = (isServer: boolean) => {
    const title = isServer ? serverContent?.title || '旅行计划' : itinerary?.title || '旅行计划'
    const contentHtml = isServer ? getStyledServerContent() : generateClientHtml()
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
            padding: 20px;
        }
        
        .page-container {
            min-height: 100vh;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="${isServer ? `server-rendered-content template-${currentTemplate}` : 'client-rendered-content'}">
            ${contentHtml}
        </div>
    </div>
</body>
</html>`
  }

  // 渲染统一布局结构
  const renderTemplate = () => {
    // 服务端渲染模式：直接渲染HTML内容
    if (renderMode === 'server' && serverContent) {
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
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    服务端渲染
                  </span>
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
                  <div className="relative share-menu-container">
                    <button
                      onClick={toggleShareMenu}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      分享
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleShare('server')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <div>
                              <div className="font-medium">服务端渲染</div>
                              <div className="text-xs text-gray-500">HTML内容，加载快</div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleShare('client')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                            <div>
                              <div className="font-medium">客户端渲染</div>
                              <div className="text-xs text-gray-500">支持定制，功能完整</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    导出HTML
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
                  onShowCommunity={handleShowCommunity}
                  onAddAdoptionMessage={handleAddAdoptionMessage}
                />
              </div>
            )}
            
            {/* 右侧内容区域 - 显示分享页或攻略社区 */}
            <div className="flex-1 h-[calc(100vh-72px)] overflow-hidden bg-gray-50 dark:bg-gray-900">
              {showCommunity ? (
                <TravelCommunity onApplyTemplate={handleApplyTemplate} onExitCommunity={handleExitCommunity} onPreviewTemplate={handlePreviewTemplate} />
              ) : (
                <div className="h-full overflow-y-auto">
                  <div 
                    dangerouslySetInnerHTML={{ __html: getStyledServerContent() }}
                    className={`server-rendered-content template-${currentTemplate}`}
                    style={{
                      padding: '20px',
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
    
    // 客户端渲染模式：使用原有逻辑
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
                <span className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  客户端渲染
                </span>
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
                <div className="relative share-menu-container">
                  <button
                    onClick={toggleShareMenu}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    分享
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => handleShare('server')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">服务端渲染</div>
                            <div className="text-xs text-gray-500">HTML内容，加载快</div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleShare('client')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">客户端渲染</div>
                            <div className="text-xs text-gray-500">支持定制，功能完整</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                onShowCommunity={handleShowCommunity}
                onAddAdoptionMessage={handleAddAdoptionMessage}
              />
            </div>
          )}
          
          {/* 右侧内容区域 */}
          <div className="flex-1 h-[calc(100vh-72px)] overflow-y-auto">
            {showCommunity ? (
              <TravelCommunity onApplyTemplate={handleApplyTemplate} onExitCommunity={handleExitCommunity} onPreviewTemplate={handlePreviewTemplate} />
            ) : (
              renderTemplateContent()
            )}
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

  if (error || (!itinerary && !serverContent)) {
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