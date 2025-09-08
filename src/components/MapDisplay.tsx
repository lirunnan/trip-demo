'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ItineraryDay } from './ChatInterface'
import { MapPin, Clock, Calendar } from 'lucide-react'
interface MapDisplayProps {
  itinerary: ItineraryDay[]
  className?: string
  onLocationDelete?: (dayIndex: number, locationIndex: number) => void
  onLocationEdit?: (dayIndex: number, locationIndex: number) => void
  interactive?: boolean
  onSendMessage: (content: string, themePrompt?: string) => Promise<void>
}

interface MapCenter {
  lng: number
  lat: number
}

declare global {
  interface Window {
    BMap: any
  }
}

export default function MapDisplay({ 
  itinerary, 
  className = '', 
  onLocationDelete,
  onLocationEdit,
  interactive = false,
  onSendMessage
}: MapDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(false)
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

  // 当删除节点后，如果当前选中天没有数据，自动切换到第一个有数据的天数
  useEffect(() => {
    if (itinerary.length > 0 && (!currentDayData || currentDayData.locations.length === 0)) {
      const firstDayWithData = itinerary.find(day => day.locations.length > 0)
      if (firstDayWithData && firstDayWithData.day !== selectedDay) {
        setSelectedDay(firstDayWithData.day)
      }
    }
  }, [itinerary, currentDayData, selectedDay])

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 初始化地图
  useEffect(() => {
    let timeoutCount = 0
    const maxTimeout = 100 // 最多等待10秒

    const initMap = () => {
      if (typeof window !== 'undefined' && window.BMap && mapRef.current && !mapInstance.current) {
        try {
          console.log('开始初始化百度地图...')
          const map = new window.BMap.Map(mapRef.current)
          const point = new window.BMap.Point(mapCenter.lng, mapCenter.lat)
          map.centerAndZoom(point, 12)
          map.enableScrollWheelZoom(true)
          
          mapInstance.current = map
          setIsMapReady(true)
          setMapLoadError(false)
          console.log('百度地图初始化成功')
        } catch (error) {
          console.error('地图初始化失败:', error)
          setIsMapReady(false)
          setMapLoadError(true)
        }
      }
    }

    const checkMapAPI = () => {
      timeoutCount++
      console.log(`检查地图API状态 (${timeoutCount}/${maxTimeout})`)

      if (typeof window !== 'undefined' && window.BMap) {
        initMap()
        // 地图初始化后检查是否成功，如果成功则清理定时器
        if (mapInstance.current) {
          console.log('地图初始化成功，清理定时器')
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
        }
      } else if (timeoutCount >= maxTimeout) {
        console.error('百度地图API加载超时，请检查网络连接或API密钥')
        setIsMapReady(false)
        setMapLoadError(true)
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
          checkIntervalRef.current = null
        }
      }
    }

    // 使用setInterval持续检查API状态
    checkIntervalRef.current = setInterval(checkMapAPI, 100)

    // 清理函数
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [mapCenter.lng, mapCenter.lat])

  // 当地图中心变化时重新定位
  useEffect(() => {
    if (isMapReady && mapInstance.current) {
      const point = new window.BMap.Point(mapCenter.lng, mapCenter.lat)
      mapInstance.current.setCenter(point)
    }
  }, [mapCenter.lng, mapCenter.lat, isMapReady, selectedDay, itinerary])

  // 设置全局回调函数
  useEffect(() => {
    if (interactive) {
      (window as any).editLocation = (dayIndex: number, locationIndex: number) => {
        onLocationEdit?.(dayIndex, locationIndex)
      };
      (window as any).deleteLocation = (dayIndex: number, locationIndex: number) => {
        // onLocationDelete?.(dayIndex, locationIndex)
        onSendMessage(`不想去第${dayIndex+1}天行程中的${currentDayData?.locations[locationIndex].name}了`)
      }
    }
    
    return () => {
      if (interactive) {
        delete (window as any).editLocation;
        delete (window as any).deleteLocation
      }
    }
  }, [interactive, onLocationEdit, onLocationDelete, onSendMessage, currentDayData?.locations])

  // 更新地图标记
  useEffect(() => {
    if (isMapReady && mapInstance.current) {
      const map = mapInstance.current
      
      try {
        // 清除之前的标记
        map.clearOverlays()
        
        // 如果没有当前天数据或没有景点，直接返回
        if (!currentDayData || currentDayData.locations.length === 0) {
          return
        }
        
        const myGeo = new window.BMap.Geocoder();
        const locationResults: { index: number, point: any, location: any }[] = []
        let completedCount = 0
        const totalLocations = currentDayData.locations.length
        
        // 使用异步处理所有地点
        currentDayData.locations.forEach((location, index) => {
          console.log(location.city + location.name, 'getting geocode')
          myGeo.getPoint(location.province + location.city + location.name, (pt: any) => {
            completedCount++
            if (pt) {
              const point = new window.BMap.Point(pt.lng, pt.lat)
              
              // 保存结果，保持原始顺序
              locationResults[index] = { index, point, location }
              
              // 创建自定义标记图标
              const iconSize = new window.BMap.Size(24, 24)
              const iconOffset = new window.BMap.Size(12, 12)
              const customIcon = new window.BMap.Icon(
                `data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#1890ff" stroke="white" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${index + 1}</text>
                  </svg>
                `)}`, 
                iconSize, 
                { offset: iconOffset }
              )
              
              // 创建标记
              const marker = new window.BMap.Marker(point, { icon: customIcon })
              map.addOverlay(marker)
              
              // 构建信息窗口内容
              let infoWindowContent = `
                <div style="padding: 8px; max-width: 200px;">
                  <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${location.name}</h4>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                    📍 ${location.type}
                  </p>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                    ⏰ ${location.duration}
                  </p>
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${location.description}</p>`
              
              if (interactive) {
                infoWindowContent += `
                  <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <button 
                      onclick="window.editLocation(${selectedDay - 1}, ${index})" 
                      style="flex: 1; padding: 4px 8px; background: #1890ff; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;"
                    >
                      编辑
                    </button>
                    <button 
                      onclick="window.deleteLocation(${selectedDay - 1}, ${index})" 
                      style="flex: 1; padding: 4px 8px; background: #ff4d4f; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;"
                    >
                      不想去了
                    </button>
                  </div>`
              }
              
              infoWindowContent += '</div>'
              
              const infoWindow = new window.BMap.InfoWindow(infoWindowContent)
              
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point)
              })
            }
            
            // 当所有地理编码完成后，按顺序绘制路线
            if (completedCount === totalLocations) {
              // 过滤出有效的点，并按原始顺序排列
              const validPoints = locationResults
                .filter(result => result && result.point)
                .map(result => result.point)
              
              console.log('所有地点处理完成，绘制路线，点数:', validPoints.length)
              
              // 绘制路线
              if (validPoints.length > 1) {
                const polyline = new window.BMap.Polyline(validPoints, {
                  strokeColor: '#1890ff',
                  strokeWeight: 3,
                  strokeOpacity: 0.8
                })
                map.addOverlay(polyline)
                console.log('路线绘制完成')
              }

              // 调整视野
              if (validPoints.length > 0) {
                const viewport = map.getViewport(validPoints)
                map.centerAndZoom(viewport.center, Math.max(viewport.zoom - 1, 10))
                console.log('视野调整完成')
              }
            }
          })
        })
        
      } catch (error) {
        console.error('更新地图标记失败:', error)
      }
    }
  }, [isMapReady, currentDayData, selectedDay, interactive, itinerary])


  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
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
        
        <div className="relative flex-1 min-h-0">
          {/* 地图容器 */}
          <div className="w-full h-full">
            <div
              ref={mapRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* 加载状态 */}
            {!isMapReady && !mapLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400">加载地图中...</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    正在连接百度地图服务...
                  </p>
                </div>
              </div>
            )}

            {/* 加载错误状态 */}
            {mapLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">地图加载失败</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    无法连接到百度地图服务
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                    <p>• 请检查网络连接</p>
                    <p>• 确认百度地图API密钥正确</p>
                    <p>• 刷新页面重试</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 地图为空状态 */}
            {isMapReady && itinerary.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">暂无行程数据</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    生成行程后将在此显示地图
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 当前天行程信息 - 固定在底部 */}
        {currentDayData && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs leading-relaxed">
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