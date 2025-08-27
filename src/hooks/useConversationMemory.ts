import { useState, useCallback } from 'react'
import { ItineraryDay } from '@/components/ChatInterface'

interface ConversationContext {
  currentItinerary: ItineraryDay[]
  destination: string
  duration: string
  theme: string
  preferences: {
    budget?: string
    interests: string[]
    travelStyle: string
  }
  previousRequests: string[]
}

export function useConversationMemory() {
  const [context, setContext] = useState<ConversationContext>({
    currentItinerary: [],
    destination: '',
    duration: '',
    theme: '',
    preferences: {
      interests: [],
      travelStyle: ''
    },
    previousRequests: []
  })

  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      preferences: {
        ...prev.preferences,
        ...updates.preferences
      }
    }))
  }, [])

  const addUserRequest = useCallback((request: string) => {
    setContext(prev => ({
      ...prev,
      previousRequests: [...prev.previousRequests, request]
    }))
  }, [])

  const updateItinerary = useCallback((itinerary: ItineraryDay[]) => {
    setContext(prev => ({
      ...prev,
      currentItinerary: itinerary
    }))
  }, [])

  const buildPromptContext = useCallback((newRequest: string): string => {
    const contextParts = []
    
    if (context.currentItinerary.length > 0) {
      contextParts.push(`当前行程：${context.destination}${context.duration}${context.theme ? `，主题：${context.theme}` : ''}`)
      
      const itineraryText = context.currentItinerary.map(day => 
        `第${day.day}天(${day.date})：${day.locations.map(loc => loc.name).join(' → ')}`
      ).join('；')
      
      contextParts.push(`现有安排：${itineraryText}`)
    }

    if (context.preferences.interests.length > 0) {
      contextParts.push(`兴趣偏好：${context.preferences.interests.join('、')}`)
    }

    if (context.preferences.budget) {
      contextParts.push(`预算：${context.preferences.budget}`)
    }

    if (context.preferences.travelStyle) {
      contextParts.push(`旅行风格：${context.preferences.travelStyle}`)
    }

    if (context.previousRequests.length > 0) {
      contextParts.push(`之前提到：${context.previousRequests.slice(-2).join('；')}`)
    }

    const contextStr = contextParts.length > 0 ? `上下文信息：${contextParts.join('，')}。` : ''
    
    return contextStr + `用户新要求：${newRequest}`
  }, [context])

  const parseUserInput = useCallback((input: string) => {
    const updates: Partial<ConversationContext> = {}
    
    const destinationMatch = input.match(/(去|到|在)([^，。,\s]{2,10}?)(玩|旅游|游玩|旅行|度假)/i)
    if (destinationMatch && destinationMatch[2]) {
      updates.destination = destinationMatch[2]
    }

    const durationMatch = input.match(/(\d+)天/i)
    if (durationMatch) {
      updates.duration = `${durationMatch[1]}天`
    }

    const budgetMatch = input.match(/(预算|花费|费用).*?(\d+[万千百十]?[元块钱]?)/i)
    if (budgetMatch && budgetMatch[2]) {
      updates.preferences = { 
        ...updates.preferences, 
        budget: budgetMatch[2],
        interests: updates.preferences?.interests || [],
        travelStyle: updates.preferences?.travelStyle || ''
      }
    }

    const interests = []
    if (input.includes('美食') || input.includes('吃')) interests.push('美食')
    if (input.includes('历史') || input.includes('文化') || input.includes('古迹')) interests.push('历史文化')
    if (input.includes('自然') || input.includes('风景') || input.includes('山水')) interests.push('自然风光')
    if (input.includes('购物') || input.includes('买')) interests.push('购物')
    if (input.includes('娱乐') || input.includes('玩乐')) interests.push('娱乐')
    if (input.includes('拍照') || input.includes('摄影')) interests.push('摄影')

    if (interests.length > 0) {
      const existingPreferences = updates.preferences || context.preferences
      updates.preferences = { 
        budget: existingPreferences?.budget || '',
        travelStyle: existingPreferences?.travelStyle || '',
        interests: [...(existingPreferences?.interests || []), ...interests].filter((v, i, a) => a.indexOf(v) === i)
      }
    }

    if (Object.keys(updates).length > 0) {
      updateContext(updates)
    }

    return updates
  }, [context.preferences.interests, updateContext])

  return {
    context,
    updateContext,
    addUserRequest,
    updateItinerary,
    buildPromptContext,
    parseUserInput
  }
}