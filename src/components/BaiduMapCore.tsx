'use client'

import React from 'react'
import { Map } from 'react-bmap'
import { ItineraryDay } from './ChatInterface'
import { MapPin } from 'lucide-react'

interface MapCenter {
  lng: number
  lat: number
}

interface BaiduMapCoreProps {
  center: MapCenter
  itinerary: ItineraryDay[]
}

export default function BaiduMapCore({ center, itinerary }: BaiduMapCoreProps) {
  // 获取当前行程数据
  const currentDayData = itinerary.length > 0 ? itinerary[0] : null

  return (
    <div className="relative w-full h-full">
      <Map 
        center={center}
        zoom={12}
        enableScrollWheelZoom={true}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* 用原生百度地图API实现交互功能，因为react-bmap组件有限制 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 这里可以添加自定义的UI覆盖层 */}
      </div>
      
      {/* 地图为空状态 */}
      {(!currentDayData || currentDayData.locations.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 bg-opacity-90 pointer-events-none">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">暂无行程数据</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              生成行程后将在此显示景点
            </p>
          </div>
        </div>
      )}
    </div>
  )
}