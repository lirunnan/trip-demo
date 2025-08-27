'use client'

import { ItineraryDay, Location } from '@/components/ChatInterface'

/**
 * 为行程数据添加时间信息
 */
export function addTimeInfoToItinerary(itinerary: ItineraryDay[]): ItineraryDay[] {
  return itinerary.map(day => ({
    ...day,
    locations: day.locations.map((location, index) => 
      addTimeInfoToLocation(location, index)
    )
  }))
}

/**
 * 为单个景点添加时间信息
 */
export function addTimeInfoToLocation(location: Location, index: number): Location {
  // 计算开始时间（从早上9点开始，每个景点间隔2.5小时）
  const startHour = 9 + Math.floor(index * 2.5)
  const startMinute = (index * 2.5 % 1) * 60
  const startTime = `${startHour.toString().padStart(2, '0')}:${Math.floor(startMinute).toString().padStart(2, '0')}`
  
  // 解析持续时间
  const durationMatch = location.duration.match(/(\d+(?:\.\d+)?)\s*小时/)
  const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 2
  
  // 计算结束时间
  const endHour = startHour + Math.floor(durationHours)
  const endMinute = startMinute + ((durationHours % 1) * 60)
  const finalEndHour = endHour + Math.floor(endMinute / 60)
  const finalEndMinute = endMinute % 60
  const endTime = `${finalEndHour.toString().padStart(2, '0')}:${Math.floor(finalEndMinute).toString().padStart(2, '0')}`
  
  return {
    ...location,
    startTime,
    endTime,
    timeSlot: `${startTime} - ${endTime}`
  }
}

/**
 * 重新计算整个行程的时间安排
 */
export function recalculateItineraryTimes(itinerary: ItineraryDay[]): ItineraryDay[] {
  return itinerary.map(day => ({
    ...day,
    locations: day.locations.map((location, index) => 
      addTimeInfoToLocation(location, index)
    )
  }))
}