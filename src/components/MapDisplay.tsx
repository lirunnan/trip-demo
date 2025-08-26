'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ItineraryDay } from './ChatInterface'
import { MapPin, Clock, Calendar } from 'lucide-react'
interface MapDisplayProps {
  itinerary: ItineraryDay[]
  className?: string
}

interface MapCenter {
  lng: number
  lat: number
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BMapGL: any
  }
}

export default function MapDisplay({ itinerary, className = '' }: MapDisplayProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
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

  // 初始化地图
  useEffect(() => {
    let timeoutCount = 0
    const maxTimeout = 100 // 最多等待10秒
    let checkInterval: NodeJS.Timeout | null = null

    const initMap = () => {
      if (typeof window !== 'undefined' && window.BMapGL && mapRef.current && !mapInstance.current) {
        try {
          console.log('开始初始化百度地图...')
          const map = new window.BMapGL.Map(mapRef.current)
          const point = new window.BMapGL.Point(mapCenter.lng, mapCenter.lat)
          map.centerAndZoom(point, 12)
          map.enableScrollWheelZoom(true)
          
          // 添加控件
          const navigationControl = new window.BMapGL.NavigationControl()
          map.addControl(navigationControl)
          
          mapInstance.current = map
          setIsMapReady(true)
          setMapLoadError(false)
          console.log('百度地图初始化成功')
          
          // 清理定时器
          if (checkInterval) {
            clearInterval(checkInterval)
          }
        } catch (error) {
          console.error('地图初始化失败:', error)
          setIsMapReady(false)
          setMapLoadError(true)
        }
      }
    }

    const checkMapAPI = () => {
      timeoutCount++
      console.log(`检查地图API状态 (${timeoutCount}/${maxTimeout})`, {
        hasWindow: typeof window !== 'undefined',
        hasBMapGL: !!(typeof window !== 'undefined' && window.BMapGL),
        hasMapRef: !!mapRef.current,
        hasMapInstance: !!mapInstance.current
      })

      if (typeof window !== 'undefined' && window.BMapGL) {
        initMap()
      } else if (timeoutCount >= maxTimeout) {
        console.error('百度地图API加载超时，请检查网络连接或API密钥')
        setIsMapReady(false)
        setMapLoadError(true)
        if (checkInterval) {
          clearInterval(checkInterval)
        }
      }
    }

    // 使用setInterval持续检查API状态
    checkInterval = setInterval(checkMapAPI, 100)

    // 清理函数
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [mapCenter.lng, mapCenter.lat])

  // 当地图中心变化时重新定位
  useEffect(() => {
    if (isMapReady && mapInstance.current) {
      const point = new window.BMapGL.Point(mapCenter.lng, mapCenter.lat)
      mapInstance.current.setCenter(point)
    }
  }, [mapCenter.lng, mapCenter.lat, isMapReady])

  // 更新地图标记
  useEffect(() => {
    if (isMapReady && mapInstance.current && currentDayData) {
      const map = mapInstance.current
      
      try {
        // 清除之前的标记
        map.clearOverlays()
        
        const points: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
        
        // 添加标记点
        currentDayData.locations.forEach((location, index) => {
          const point = new window.BMapGL.Point(location.coordinates[0], location.coordinates[1])
          points.push(point)
          
          // 创建标记
          const marker = new window.BMapGL.Marker(point)
          map.addOverlay(marker)
          
          // 添加信息窗口
          const infoWindow = new window.BMapGL.InfoWindow(`
            <div style="padding: 8px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${location.name}</h4>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                📍 ${location.type}
              </p>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                ⏰ ${location.duration}
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">${location.description}</p>
            </div>
          `)
          
          marker.addEventListener('click', () => {
            map.openInfoWindow(infoWindow, point)
          })
          
          // 添加标签
          const label = new window.BMapGL.Label(`${index + 1}`, {
            position: point,
            offset: new window.BMapGL.Size(0, -30)
          })
          label.setStyle({
            backgroundColor: '#1890ff',
            color: 'white',
            border: '1px solid #1890ff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            textAlign: 'center',
            lineHeight: '24px',
            fontSize: '12px',
            fontWeight: 'bold'
          })
          map.addOverlay(label)
        })
        
        // 绘制路线
        if (points.length > 1) {
          const polyline = new window.BMapGL.Polyline(points, {
            strokeColor: '#1890ff',
            strokeWeight: 3,
            strokeOpacity: 0.8
          })
          map.addOverlay(polyline)
        }
        
        // 调整视野
        if (points.length > 0) {
          const viewport = map.getViewport(points)
          map.centerAndZoom(viewport.center, Math.max(viewport.zoom - 1, 10))
        }
      } catch (error) {
        console.error('更新地图标记失败:', error)
      }
    }
  }, [isMapReady, currentDayData, selectedDay])


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
        
        <div className="relative">
          {/* 地图容器 */}
          <div className="w-full h-[400px] lg:h-[500px]">
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