'use client'

import React, { useState } from 'react'
import { Map, Marker, NavigationControl, InfoWindow, Polyline } from 'react-bmap'
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
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  // 获取当前行程数据
  const currentDayData = itinerary.length > 0 ? itinerary[0] : null
  
  // 生成路线点
  const polylinePoints = currentDayData?.locations?.map(location => ({
    lng: location.coordinates[0],
    lat: location.coordinates[1]
  })) || []

  return (
    <div className="relative w-full h-full">
      <Map 
        center={center}
        zoom={12}
        enableScrollWheelZoom={true}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl />
        
        {/* 渲染标记点 */}
        {currentDayData?.locations?.map((location, index) => (
          <React.Fragment key={index}>
            <Marker
              position={{
                lng: location.coordinates[0],
                lat: location.coordinates[1]
              }}
              onClick={() => setSelectedMarker(selectedMarker === index ? null : index)}
            />
            
            {/* 信息窗口 */}
            {selectedMarker === index && (
              <InfoWindow
                position={{
                  lng: location.coordinates[0],
                  lat: location.coordinates[1]
                }}
                title={location.name}
                text={`<div style="padding: 4px; max-width: 200px;">
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                    📍 ${location.type}
                  </p>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                    ⏰ ${location.duration}
                  </p>
                  <p style="margin: 0; color: #666; font-size: 12px;">${location.description}</p>
                </div>`}
                onClose={() => setSelectedMarker(null)}
              />
            )}
          </React.Fragment>
        ))}
        
        {/* 绘制路线 */}
        {polylinePoints.length > 1 && (
          <Polyline
            path={polylinePoints}
            strokeColor="#1890ff"
            strokeWeight={3}
            strokeOpacity={0.8}
          />
        )}
      </Map>
      
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