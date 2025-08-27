import { useCallback } from 'react'
import { ItineraryDay, Location } from '@/components/ChatInterface'

export function useItineraryActions() {
  const deleteLocation = useCallback((
    itinerary: ItineraryDay[], 
    dayIndex: number, 
    locationIndex: number
  ): ItineraryDay[] => {
    const newItinerary = [...itinerary]
    const day = newItinerary[dayIndex]
    
    if (day && day.locations.length > locationIndex) {
      day.locations = day.locations.filter((_, index) => index !== locationIndex)
    }
    
    return newItinerary
  }, [])

  const editLocation = useCallback((
    itinerary: ItineraryDay[],
    dayIndex: number,
    locationIndex: number,
    newLocation: Partial<Location>
  ): ItineraryDay[] => {
    const newItinerary = [...itinerary]
    const day = newItinerary[dayIndex]
    
    if (day && day.locations.length > locationIndex) {
      day.locations[locationIndex] = {
        ...day.locations[locationIndex],
        ...newLocation
      }
    }
    
    return newItinerary
  }, [])

  const addLocation = useCallback((
    itinerary: ItineraryDay[],
    dayIndex: number,
    location: Location,
    insertIndex?: number
  ): ItineraryDay[] => {
    const newItinerary = [...itinerary]
    const day = newItinerary[dayIndex]
    
    if (day) {
      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= day.locations.length) {
        day.locations.splice(insertIndex, 0, location)
      } else {
        day.locations.push(location)
      }
    }
    
    return newItinerary
  }, [])

  const reorderLocations = useCallback((
    itinerary: ItineraryDay[],
    dayIndex: number,
    fromIndex: number,
    toIndex: number
  ): ItineraryDay[] => {
    const newItinerary = [...itinerary]
    const day = newItinerary[dayIndex]
    
    if (day && day.locations.length > Math.max(fromIndex, toIndex)) {
      const [movedLocation] = day.locations.splice(fromIndex, 1)
      day.locations.splice(toIndex, 0, movedLocation)
    }
    
    return newItinerary
  }, [])

  const optimizeRoute = useCallback((
    itinerary: ItineraryDay[],
    dayIndex: number
  ): ItineraryDay[] => {
    const newItinerary = [...itinerary]
    const day = newItinerary[dayIndex]
    
    if (day && day.locations.length > 2) {
      // 简单的距离优化算法：基于坐标距离排序
      const locations = [...day.locations]
      const optimized = [locations[0]] // 从第一个位置开始
      const remaining = locations.slice(1)
      
      while (remaining.length > 0) {
        const current = optimized[optimized.length - 1]
        let nearest = 0
        let minDistance = Infinity
        
        remaining.forEach((location, index) => {
          const distance = Math.sqrt(
            Math.pow(current.coordinates[0] - location.coordinates[0], 2) +
            Math.pow(current.coordinates[1] - location.coordinates[1], 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            nearest = index
          }
        })
        
        optimized.push(remaining[nearest])
        remaining.splice(nearest, 1)
      }
      
      day.locations = optimized
    }
    
    return newItinerary
  }, [])

  const generateRouteAdjustmentMessage = useCallback((
    action: 'delete' | 'edit' | 'add' | 'optimize',
    locationName?: string
  ): string => {
    switch (action) {
      case 'delete':
        return `已删除"${locationName}"，我为您重新优化了路线安排，确保剩余景点间的路径最合理。`
      case 'edit':
        return `已修改"${locationName}"的信息，路线已根据新的位置和时间安排进行调整。`
      case 'add':
        return `已添加"${locationName}"到您的行程中，我已重新安排了游览顺序，确保路线最优化。`
      case 'optimize':
        return `已为您优化行程路线，按照就近原则重新排序，减少交通时间，提高游览效率。`
      default:
        return '行程已更新，路线已重新优化。'
    }
  }, [])

  return {
    deleteLocation,
    editLocation,
    addLocation,
    reorderLocations,
    optimizeRoute,
    generateRouteAdjustmentMessage
  }
}