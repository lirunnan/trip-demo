'use client'

import { useState } from 'react'
import { ItineraryDay } from './ChatInterface'
import MapDisplay from './MapDisplay'
import ScheduleDisplay from './ScheduleDisplay'
import { Map, Calendar, Download, Share2 } from 'lucide-react'

interface TravelViewsProps {
  itinerary: ItineraryDay[]
  className?: string
  onLocationDelete?: (dayIndex: number, locationIndex: number) => void
  onLocationEdit?: (dayIndex: number, locationIndex: number) => void
  onLocationReorder?: (newItinerary: ItineraryDay[]) => void
  onExportPDF?: () => void
  onShare?: () => void
}

type ViewType = 'map' | 'schedule'

export default function TravelViews({ 
  itinerary, 
  className = '',
  onLocationDelete,
  onLocationEdit,
  onLocationReorder,
  onExportPDF,
  onShare
}: TravelViewsProps) {
  const [activeView, setActiveView] = useState<ViewType>('map')

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
        {/* 顶部标签栏 */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between px-4 py-3">
            {/* 左侧标签切换 */}
            <div className="flex rounded-lg bg-gray-200 dark:bg-gray-600 p-1">
              <button
                onClick={() => setActiveView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'map'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Map className="w-4 h-4" />
                地图视图
              </button>
              <button
                onClick={() => setActiveView('schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeView === 'schedule'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                时间表
              </button>
            </div>

            {/* 右侧操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={onShare}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="分享行程"
              >
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button
                onClick={onExportPDF}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                title="导出PDF"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'map' ? (
            <MapDisplay 
              itinerary={itinerary}
              className="h-full"
              interactive={true}
              onLocationDelete={onLocationDelete}
              onLocationEdit={onLocationEdit}
            />
          ) : (
            <ScheduleDisplay 
              itinerary={itinerary}
              className="h-full"
              onLocationDelete={onLocationDelete}
              onLocationEdit={onLocationEdit}
              onLocationReorder={onLocationReorder}
              enableDragDrop={true}
            />
          )}
        </div>

        {/* 底部状态栏 */}
        {itinerary.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                行程概览：{itinerary.length} 天，
                共 {itinerary.reduce((total, day) => total + day.locations.length, 0)} 个景点
              </span>
              <span className="text-xs">
                当前视图：{activeView === 'map' ? '地图模式' : '时间表模式'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}