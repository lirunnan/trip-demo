'use client'

import { useMemo, useState, useEffect } from 'react'
import { ItineraryDay } from './ChatInterface'
import { Calendar, Clock, MapPin, Trash2, Edit3, Maximize2, Minimize2, GripVertical } from 'lucide-react'
import { useSimpleDrag } from '@/hooks/useSimpleDrag'

interface ScheduleDisplayProps {
  itinerary: ItineraryDay[]
  className?: string
  onLocationDelete?: (dayIndex: number, locationIndex: number) => void
  onLocationEdit?: (dayIndex: number, locationIndex: number) => void
  onLocationReorder?: (newItinerary: ItineraryDay[]) => void
  enableDragDrop?: boolean
}

export default function ScheduleDisplay({ 
  itinerary, 
  className = '',
  onLocationDelete,
  onLocationEdit,
  onLocationReorder,
  enableDragDrop = false
}: ScheduleDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // 调试信息
  console.log('🔧 ScheduleDisplay 拖拽状态:', enableDragDrop)
  
  // 鼠标拖拽功能
  const {
    isDragging,
    draggedItem,
    previewItinerary,
    currentHoverTarget,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    executeReorder
  } = useSimpleDrag()

  // 设置全局事件监听器
  useEffect(() => {
    if (!isDragging) return

    const globalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e)
    }

    const globalMouseUp = (_e: MouseEvent) => {
      const finalTarget = handleMouseUp()
      
      if (finalTarget && onLocationReorder) {
        console.log('🎯 确认拖拽目标:', finalTarget)
        executeReorder(
          finalTarget.dayIndex, 
          finalTarget.timeIndex, 
          itinerary, 
          onLocationReorder
        )
      }
    }

    document.addEventListener('mousemove', globalMouseMove)
    document.addEventListener('mouseup', globalMouseUp)

    return () => {
      document.removeEventListener('mousemove', globalMouseMove)
      document.removeEventListener('mouseup', globalMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, executeReorder, itinerary, onLocationReorder])
  
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  const getTimeForLocation = (dayIndex: number, locationIndex: number, location: any): string => {
    // 优先使用计算好的时间，否则回退到默认计算
    if (location.startTime) {
      return location.startTime
    }
    const startHour = 9 + Math.floor(locationIndex * 2.5)
    return `${startHour.toString().padStart(2, '0')}:00`
  }

  const getDurationInHours = (duration: string): number => {
    const match = duration.match(/(\d+)小时/)
    return match ? parseInt(match[1]) : 2
  }

  const getEndTime = (location: any, startTime: string, duration: string): string => {
    // 优先使用计算好的结束时间
    if (location.endTime) {
      return location.endTime
    }
    const [hours, minutes] = startTime.split(':').map(Number)
    const durationHours = getDurationInHours(duration)
    const endHour = hours + durationHours
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const totalDays = itinerary.length

  // 使用预览行程或原始行程
  const displayItinerary = previewItinerary || itinerary

  const ScheduleContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="h-full flex">
      {/* 时间轴 */}
      <div className="w-20 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-600 px-2 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
          时间
        </div>
        <div className="space-y-0">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-16 px-2 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 flex items-center justify-center"
            >
              {time}
            </div>
          ))}
        </div>
      </div>
      
      {/* 多天日程内容区 */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full">
          {displayItinerary.map((dayData, dayIndex) => (
            <div 
              key={dayData.day} 
              className="relative border-r border-gray-200 dark:border-gray-600 flex-1"
              style={{ 
                minWidth: compact ? '192px' : '320px',
                width: `${100 / displayItinerary.length}%`
              }}
            >
              <div className="sticky top-0 bg-gray-100 dark:bg-gray-600 px-2 py-3 text-center text-sm font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                第{dayData.day}天 - {dayData.date}
              </div>
              
              <div className="relative" style={{ height: `${timeSlots.length * 64}px` }}>
                {/* 时间网格线和拖拽区域 */}
                {timeSlots.map((_, timeIndex) => {
                  const isDropZone = enableDragDrop
                  const isHoverTarget = currentHoverTarget?.dayIndex === dayIndex && 
                    currentHoverTarget?.timeIndex === timeIndex
                  
                  return (
                    <div
                      key={timeIndex}
                      className={`absolute w-full border-b border-gray-100 dark:border-gray-600 transition-all duration-200 ${
                        isDropZone ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
                      } ${
                        isHoverTarget ? 'bg-blue-100 dark:bg-blue-800/30 border-blue-300 dark:border-blue-600 border-2' : ''
                      }`}
                      style={{ 
                        top: `${timeIndex * 64}px`, 
                        height: '64px',
                        zIndex: 1
                      }}
                      data-drop-zone="true"
                      data-time-index={timeIndex}
                      data-day-index={dayIndex}
                    />
                  )
                })}
                
                {/* 事件卡片 */}
                {dayData.locations.map((location, locationIndex) => {
                  const startTime = getTimeForLocation(dayIndex, locationIndex, location)
                  const endTime = getEndTime(location, startTime, location.duration)
                  const startHour = parseInt(startTime.split(':')[0])
                  const startMinute = parseInt(startTime.split(':')[1] || '0')
                  const duration = getDurationInHours(location.duration)
                  const topPosition = (startHour - 8) * 64 + (startMinute / 60) * 64
                  const height = Math.max(duration * 64 - 8, 48)
                  
                  const isBeingDragged = draggedItem?.dayIndex === dayIndex && 
                    draggedItem?.locationIndex === locationIndex
                  
                  return (
                    <div
                      key={locationIndex}
                      className={`absolute left-1 right-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-lg p-2 group hover:shadow-xl transition-all duration-200 ${
                        isBeingDragged ? 'opacity-50 scale-105' : ''
                      }`}
                      style={{
                        top: `${topPosition + 4}px`,
                        height: `${height}px`,
                        zIndex: 20,
                        cursor: enableDragDrop ? 'grab' : 'default',
                        userSelect: 'none'
                      }}
                      data-location-name={location.name}
                      onMouseDown={enableDragDrop ? (e) => {
                        console.log('🖱️ 卡片鼠标按下事件触发:', location.name)
                        // 获取原始行程中的索引
                        const originalDayIndex = itinerary.findIndex(day => day.day === dayData.day)
                        const originalLocationIndex = itinerary[originalDayIndex]?.locations.findIndex(
                          loc => loc.name === location.name && loc.type === location.type
                        ) || locationIndex
                        handleMouseDown(e, originalDayIndex, originalLocationIndex, location, itinerary)
                      } : undefined}
                    >
                      <div className="flex items-start justify-between h-full">
                        {/* 拖拽手柄 */}
                        {enableDragDrop && (
                          <div className="flex-shrink-0 mr-2 cursor-grab active:cursor-grabbing" title="拖拽重排序">
                            <GripVertical className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            <span className="text-xs font-bold opacity-90">
                              {location.timeSlot || `${startTime} - ${endTime}`}
                            </span>
                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded">
                              {location.type}
                            </span>
                          </div>
                          <h4 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} mb-1 truncate`}>
                            {location.name}
                          </h4>
                          {!compact && (
                            <p className="text-xs opacity-90 line-clamp-2">
                              {location.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{location.duration}</span>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onLocationEdit && (
                            <button
                              onClick={() => onLocationEdit(dayIndex, locationIndex)}
                              className="p-1 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                              title="编辑"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                          {onLocationDelete && (
                            <button
                              onClick={() => onLocationDelete(dayIndex, locationIndex)}
                              className="p-1 bg-white/20 hover:bg-red-400 rounded text-white transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={`w-full ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
          {/* 头部控制栏 */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  行程时间表
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                {totalDays > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>共 {totalDays} 天行程</span>
                  </div>
                )}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                  title="全屏查看"
                >
                  <Maximize2 className="w-4 h-4" />
                  全屏
                </button>
              </div>
            </div>
          </div>
        
          {/* 时间表内容 */}
          <div className="flex-1 overflow-hidden">
            {itinerary.length > 0 ? (
              <ScheduleContent compact={true} />
            ) : (
              // 空状态
              <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">暂无行程数据</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    生成行程后将在此显示时间表
                  </p>
                </div>
              </div>
            )}
          </div>
        
          {/* 底部统计信息 */}
          {itinerary.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  共 {itinerary.reduce((total, day) => total + day.locations.length, 0)} 个景点
                </span>
                <span>
                  预计总时长：
                  {itinerary.reduce((dayTotal, day) => {
                    return dayTotal + day.locations.reduce((locationTotal, location) => {
                      return locationTotal + getDurationInHours(location.duration)
                    }, 0)
                  }, 0)} 小时
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 全屏模态框 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
            {/* 全屏头部 */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  完整行程时间表
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>共 {totalDays} 天行程</span>
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                  退出全屏
                </button>
              </div>
            </div>

            {/* 全屏内容 */}
            <div className="flex-1 overflow-hidden">
              {itinerary.length > 0 ? (
                <ScheduleContent compact={false} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      暂无行程数据
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      生成行程后将在此显示详细时间表
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 全屏底部统计 */}
            {itinerary.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    总景点数：{itinerary.reduce((total, day) => total + day.locations.length, 0)} 个
                  </span>
                  <span>
                    预计总时长：
                    {itinerary.reduce((dayTotal, day) => {
                      return dayTotal + day.locations.reduce((locationTotal, location) => {
                        return locationTotal + getDurationInHours(location.duration)
                      }, 0)
                    }, 0)} 小时
                  </span>
                  <span>平均每天：{Math.round(itinerary.reduce((dayTotal, day) => {
                    return dayTotal + day.locations.reduce((locationTotal, location) => {
                      return locationTotal + getDurationInHours(location.duration)
                    }, 0)
                  }, 0) / totalDays)} 小时</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}