'use client'

import { useState, useCallback, useRef } from 'react'
import { ItineraryDay, Location } from '@/components/ChatInterface'
import { recalculateItineraryTimes } from '@/utils/timeCalculator'

interface DraggedItem {
  dayIndex: number
  locationIndex: number
  location: Location
  element: HTMLElement
  originalItinerary: ItineraryDay[]
}

interface DragState {
  draggedItem: DraggedItem | null
  isDragging: boolean
  currentHoverTarget: { dayIndex: number, timeIndex: number } | null
  previewItinerary: ItineraryDay[] | null
}

export function useSimpleDrag() {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    isDragging: false,
    currentHoverTarget: null,
    previewItinerary: null
  })
  
  const dragStartPos = useRef<{ x: number, y: number } | null>(null)
  const ghostElement = useRef<HTMLElement | null>(null)

  // 开始拖拽（鼠标按下）
  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    dayIndex: number,
    locationIndex: number,
    location: Location,
    itinerary: ItineraryDay[]
  ) => {
    console.log('🖱️ 鼠标按下开始拖拽:', location.name, { dayIndex, locationIndex })
    
    const element = e.currentTarget as HTMLElement
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    // 创建拖拽幽灵元素
    const rect = element.getBoundingClientRect()
    const ghost = element.cloneNode(true) as HTMLElement
    ghost.style.position = 'fixed'
    ghost.style.left = rect.left + 'px'
    ghost.style.top = rect.top + 'px'
    ghost.style.width = rect.width + 'px'
    ghost.style.height = rect.height + 'px'
    ghost.style.zIndex = '9999'
    ghost.style.opacity = '0.8'
    ghost.style.transform = 'rotate(5deg) scale(1.05)'
    ghost.style.pointerEvents = 'none'
    ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)'
    document.body.appendChild(ghost)
    ghostElement.current = ghost
    
    setDragState({
      draggedItem: {
        dayIndex,
        locationIndex,
        location,
        element,
        originalItinerary: [...itinerary]
      },
      isDragging: true,
      currentHoverTarget: null,
      previewItinerary: null
    })
    
    // 原始元素变透明
    element.style.opacity = '0.3'
    
    // 阻止默认行为
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // 查找拖拽目标
  const findDropTarget = useCallback((x: number, y: number) => {
    // 暂时隐藏幽灵元素
    if (ghostElement.current) {
      ghostElement.current.style.pointerEvents = 'none'
    }

    const elementUnder = document.elementFromPoint(x, y)
    
    // 恢复幽灵元素
    if (ghostElement.current) {
      ghostElement.current.style.pointerEvents = 'none'
    }

    // 查找拖拽区域
    const dropZone = elementUnder?.closest('[data-drop-zone="true"]')
    if (dropZone) {
      const timeIndex = parseInt(dropZone.getAttribute('data-time-index') || '0')
      const dayIndex = parseInt(dropZone.getAttribute('data-day-index') || '0')
      return { dayIndex, timeIndex }
    }

    return null
  }, [])

  // 计算预览行程
  const calculatePreviewItinerary = useCallback((
    targetDayIndex: number,
    targetTimeIndex: number,
    originalItinerary: ItineraryDay[],
    draggedItem: DraggedItem
  ) => {
    const { dayIndex: sourceDayIndex, locationIndex: sourceLocationIndex } = draggedItem
    const targetLocationIndex = Math.min(targetTimeIndex, originalItinerary[targetDayIndex].locations.length)

    // 如果拖到同一个位置，返回原始行程
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex === targetLocationIndex) {
      return originalItinerary
    }

    // 创建预览行程
    const previewItinerary = [...originalItinerary]
    const sourceLocation = previewItinerary[sourceDayIndex].locations[sourceLocationIndex]

    // 从原位置移除
    previewItinerary[sourceDayIndex] = {
      ...previewItinerary[sourceDayIndex],
      locations: previewItinerary[sourceDayIndex].locations.filter((_, index) => index !== sourceLocationIndex)
    }

    // 调整目标位置索引
    let adjustedTargetIndex = targetLocationIndex
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex < targetLocationIndex) {
      adjustedTargetIndex = targetLocationIndex - 1
    }

    // 插入到新位置
    previewItinerary[targetDayIndex] = {
      ...previewItinerary[targetDayIndex],
      locations: [
        ...previewItinerary[targetDayIndex].locations.slice(0, adjustedTargetIndex),
        sourceLocation,
        ...previewItinerary[targetDayIndex].locations.slice(adjustedTargetIndex)
      ]
    }

    return recalculateItineraryTimes(previewItinerary)
  }, [])

  // 拖拽移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedItem || !dragStartPos.current) return

    // 更新幽灵元素位置
    if (ghostElement.current) {
      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y
      
      ghostElement.current.style.left = (dragStartPos.current.x + deltaX - 10) + 'px'
      ghostElement.current.style.top = (dragStartPos.current.y + deltaY - 10) + 'px'
    }

    // 检查当前悬浮的目标
    const dropTarget = findDropTarget(e.clientX, e.clientY)
    
    if (dropTarget) {
      const { dayIndex, timeIndex } = dropTarget
      
      // 如果悬浮目标改变了，计算新的预览
      if (!dragState.currentHoverTarget || 
          dragState.currentHoverTarget.dayIndex !== dayIndex || 
          dragState.currentHoverTarget.timeIndex !== timeIndex) {
        
        console.log('🎯 悬浮目标变化:', dropTarget)
        
        const previewItinerary = calculatePreviewItinerary(
          dayIndex, 
          timeIndex, 
          dragState.draggedItem.originalItinerary,
          dragState.draggedItem
        )
        
        setDragState(prev => ({
          ...prev,
          currentHoverTarget: dropTarget,
          previewItinerary
        }))
      }
    } else {
      // 如果没有悬浮目标，恢复原始行程
      if (dragState.currentHoverTarget || dragState.previewItinerary) {
        console.log('🔄 恢复原始行程')
        setDragState(prev => ({
          ...prev,
          currentHoverTarget: null,
          previewItinerary: null
        }))
      }
    }
  }, [dragState, findDropTarget, calculatePreviewItinerary])

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedItem) return null

    console.log('🛑 结束拖拽')

    // 恢复原始元素样式
    dragState.draggedItem.element.style.opacity = ''
    
    // 移除幽灵元素
    if (ghostElement.current) {
      document.body.removeChild(ghostElement.current)
      ghostElement.current = null
    }
    
    document.body.style.cursor = ''

    // 获取最终的拖拽目标
    const finalTarget = dragState.currentHoverTarget
    
    // 清理状态
    setDragState({
      draggedItem: null,
      isDragging: false,
      currentHoverTarget: null,
      previewItinerary: null
    })
    
    dragStartPos.current = null
    
    return finalTarget
  }, [dragState])

  // 执行重排序
  const executeReorder = useCallback((
    targetDayIndex: number,
    targetTimeIndex: number,
    itinerary: ItineraryDay[],
    onItineraryUpdate: (newItinerary: ItineraryDay[]) => void
  ) => {
    if (!dragState.draggedItem) return

    console.log('🔄 执行重排序:', {
      from: { dayIndex: dragState.draggedItem.dayIndex, locationIndex: dragState.draggedItem.locationIndex },
      to: { dayIndex: targetDayIndex, timeIndex: targetTimeIndex }
    })

    const { dayIndex: sourceDayIndex, locationIndex: sourceLocationIndex } = dragState.draggedItem
    const targetLocationIndex = Math.min(targetTimeIndex, itinerary[targetDayIndex].locations.length)

    // 如果拖到同一个位置，不做任何操作
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex === targetLocationIndex) {
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

    // 调整目标位置索引
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

    // 重新计算时间
    const reorderedItinerary = recalculateItineraryTimes(newItinerary)
    console.log('✅ 重排序完成')
    onItineraryUpdate(reorderedItinerary)
  }, [dragState.draggedItem])


  return {
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    previewItinerary: dragState.previewItinerary,
    currentHoverTarget: dragState.currentHoverTarget,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    executeReorder
  }
}