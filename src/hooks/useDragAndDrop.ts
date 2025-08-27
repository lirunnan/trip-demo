'use client'

import { useState, useCallback } from 'react'
import { ItineraryDay, Location } from '@/components/ChatInterface'

export interface DragState {
  isDragging: boolean
  draggedItem: {
    dayIndex: number
    locationIndex: number
    location: Location
  } | null
  dragOver: {
    dayIndex: number
    locationIndex: number
  } | null
}

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragOver: null
  })

  // 开始拖拽
  const handleDragStart = useCallback((
    dayIndex: number,
    locationIndex: number,
    location: Location
  ) => {
    setDragState({
      isDragging: true,
      draggedItem: { dayIndex, locationIndex, location },
      dragOver: null
    })
  }, [])

  // 拖拽经过
  const handleDragOver = useCallback((
    e: React.DragEvent,
    dayIndex: number,
    locationIndex: number
  ) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragState(prev => ({
      ...prev,
      dragOver: { dayIndex, locationIndex }
    }))
  }, [])

  // 拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 只有当离开的是容器本身时才清除dragOver
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dragOver: null
      }))
    }
  }, [])

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOver: null
    })
  }, [])

  // 执行拖拽操作
  const handleDrop = useCallback((
    e: React.DragEvent,
    targetDayIndex: number,
    targetLocationIndex: number,
    itinerary: ItineraryDay[],
    onItineraryUpdate: (newItinerary: ItineraryDay[]) => void
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const { draggedItem } = dragState
    if (!draggedItem) return

    const { dayIndex: sourceDayIndex, locationIndex: sourceLocationIndex } = draggedItem

    // 如果拖到同一个位置，不做任何操作
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex === targetLocationIndex) {
      handleDragEnd()
      return
    }

    // 创建新的行程副本
    const newItinerary = [...itinerary]
    const sourceLocation = newItinerary[sourceDayIndex].locations[sourceLocationIndex]

    // 从原位置移除
    newItinerary[sourceDayIndex] = {
      ...newItinerary[sourceDayIndex],
      locations: newItinerary[sourceDayIndex].locations.filter((_, index) => index !== sourceLocationIndex)
    }

    // 调整目标位置索引（如果在同一天且目标位置在源位置之后）
    let adjustedTargetIndex = targetLocationIndex
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex < targetLocationIndex) {
      adjustedTargetIndex = targetLocationIndex - 1
    }

    // 插入到新位置
    newItinerary[targetDayIndex] = {
      ...newItinerary[targetDayIndex],
      locations: [
        ...newItinerary[targetDayIndex].locations.slice(0, adjustedTargetIndex),
        sourceLocation,
        ...newItinerary[targetDayIndex].locations.slice(adjustedTargetIndex)
      ]
    }

    // 更新行程
    onItineraryUpdate(newItinerary)
    handleDragEnd()
  }, [dragState, handleDragEnd])

  // 重新计算时间安排
  const recalculateSchedule = useCallback((itinerary: ItineraryDay[]): ItineraryDay[] => {
    return itinerary.map(day => ({
      ...day,
      locations: day.locations.map((location, index) => {
        // 重新计算每个景点的时间
        const startHour = 9 + Math.floor(index * 2.5)
        const duration = location.duration
        
        return {
          ...location,
          // 这里可以添加更多的时间计算逻辑
        }
      })
    }))
  }, [])

  // 获取拖拽样式
  const getDragStyles = useCallback((
    dayIndex: number,
    locationIndex: number
  ) => {
    const { isDragging, draggedItem, dragOver } = dragState
    
    const isBeingDragged = isDragging && 
      draggedItem?.dayIndex === dayIndex && 
      draggedItem?.locationIndex === locationIndex
    
    const isDropTarget = dragOver?.dayIndex === dayIndex && 
      dragOver?.locationIndex === locationIndex

    return {
      opacity: isBeingDragged ? 0.5 : 1,
      transform: isBeingDragged ? 'rotate(2deg)' : 'none',
      boxShadow: isDropTarget ? '0 4px 12px rgba(59, 130, 246, 0.3)' : undefined,
      borderColor: isDropTarget ? '#3b82f6' : undefined,
      cursor: isDragging ? 'grabbing' : 'grab'
    }
  }, [dragState])

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    recalculateSchedule,
    getDragStyles
  }
}