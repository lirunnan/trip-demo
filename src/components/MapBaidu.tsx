'use client'

import { useState, useMemo } from 'react'
import { ItineraryDay } from './ChatInterface'
import { MapPin, Clock, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'

// 动态导入百度地图组件，禁用SSR
const BaiduMapComponent = dynamic(
  () => import('./BaiduMapCore').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">加载地图中...</p>
        </div>
      </div>
    )
  }
) as React.ComponentType<{
  center: MapCenter
  itinerary: ItineraryDay[]
}>
interface MapDisplayProps {
  itinerary: ItineraryDay[]
  className?: string
}

interface MapCenter {
  lng: number
  lat: number
}


export default function MapBaidu({ itinerary, className = '' }: MapDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1)

  // 计算地图中心点
  const mapCenter: MapCenter = useMemo(() => {
    const currentDay = itinerary.find(day => day.day === selectedDay)
    if (currentDay && currentDay.locations.length > 0) {
      const firstLocation = currentDay.locations[0]
      return {
        lng: firstLocation.coordinates[0],
        lat: firstLocation.coordinates[1]
      }
    }
    return { lng: 116.404, lat: 39.915 }
  }, [itinerary, selectedDay])

  // 获取当前选中天的数据
  const currentDayData = itinerary.find(day => day.day === selectedDay)
  const totalDays = itinerary.length

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* 地图控制栏 */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                行程地图
              </h3>
            </div>
            
            {totalDays > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>共 {totalDays} 天行程</span>
              </div>
            )}
          </div>
          
          {/* 天数选择器 */}
          {totalDays > 1 && (
            <div className="flex flex-wrap gap-2">
              {itinerary.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedDay === day.day
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-500'
                  }`}
                >
                  第{day.day}天
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 地图容器 */}
        <div className="w-full h-[400px] lg:h-[500px]">
          <BaiduMapComponent 
            center={mapCenter}
            itinerary={currentDayData ? [{ ...currentDayData, day: selectedDay }] : []}
          />
        </div>
        
        {/* 当前天行程信息 */}
        {currentDayData && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                第{selectedDay}天行程 ({currentDayData.date})
              </h4>
            </div>
            
            <div className="space-y-2">
              {currentDayData.locations.map((location, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {location.name}
                      </span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        {location.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {location.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {location.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}