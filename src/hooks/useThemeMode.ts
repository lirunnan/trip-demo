'use client'

import { useState, useCallback } from 'react'

// 定义主题模式类型
export type ThemeMode = {
  id: string
  name: string
  description: string
  emoji: string
  keywords: string[]
}

// 预定义主题模式
export const THEME_MODES: ThemeMode[] = [
  {
    id: 'family',
    name: '亲子',
    description: '适合家庭出游，重点关注儿童友好的景点和活动',
    emoji: '👨‍👩‍👧‍👦',
    keywords: ['亲子', '家庭', '儿童', '孩子', '小朋友', 'family']
  },
  {
    id: 'backpack',
    name: '背包',
    description: '经济实惠的背包客路线，注重性价比和体验',
    emoji: '🎒',
    keywords: ['背包', '经济', '青旅', '穷游', '自由行', 'backpack']
  },
  {
    id: 'food',
    name: '美食',
    description: '专注于当地特色美食和餐厅推荐',
    emoji: '🍜',
    keywords: ['美食', '小吃', '餐厅', '特色菜', '当地菜', 'food']
  },
  {
    id: 'culture',
    name: '文化',
    description: '深度体验当地历史文化和传统',
    emoji: '🏛️',
    keywords: ['文化', '历史', '博物馆', '古迹', '传统', 'culture']
  },
  {
    id: 'nature',
    name: '自然',
    description: '户外活动和自然风光体验',
    emoji: '🏔️',
    keywords: ['自然', '户外', '徒步', '风景', '山水', 'nature']
  },
  {
    id: 'luxury',
    name: '奢华',
    description: '高端奢华的旅行体验，精选优质服务',
    emoji: '💎',
    keywords: ['奢华', '高端', '豪华', '五星', '精品', 'luxury']
  },
  {
    id: 'photography',
    name: '摄影',
    description: '专为摄影爱好者设计的取景路线',
    emoji: '📸',
    keywords: ['摄影', '拍照', '网红', '打卡', '取景', 'photo']
  }
]

export interface ThemeModeState {
  selectedThemes: ThemeMode[]
  suggestedThemes: ThemeMode[]
}

export function useThemeMode() {
  const [state, setState] = useState<ThemeModeState>({
    selectedThemes: [],
    suggestedThemes: []
  })

  // 解析输入文本中的主题标签
  const parseThemeTags = useCallback((input: string): { themes: ThemeMode[], cleanInput: string } => {
    const themes: ThemeMode[] = []
    let cleanInput = input

    // 匹配 #标签 模式
    const tagMatches = input.match(/#(\w+)/g)
    if (tagMatches) {
      tagMatches.forEach(tag => {
        const tagName = tag.slice(1).toLowerCase()
        
        // 查找匹配的主题
        const matchedTheme = THEME_MODES.find(theme => 
          theme.keywords.some(keyword => keyword.toLowerCase().includes(tagName)) ||
          theme.name.toLowerCase().includes(tagName) ||
          theme.id.toLowerCase().includes(tagName)
        )
        
        if (matchedTheme && !themes.find(t => t.id === matchedTheme.id)) {
          themes.push(matchedTheme)
        }
        
        // 从输入中移除标签
        cleanInput = cleanInput.replace(tag, '').trim()
      })
    }

    // 基于关键词智能推荐主题（不使用#标签时）
    if (themes.length === 0) {
      const inputLower = input.toLowerCase()
      const suggestedThemes = THEME_MODES.filter(theme =>
        theme.keywords.some(keyword => inputLower.includes(keyword.toLowerCase()))
      )
      
      return { themes: suggestedThemes.slice(0, 2), cleanInput: input }
    }

    return { themes, cleanInput }
  }, [])

  // 设置选中的主题
  const setSelectedThemes = useCallback((themes: ThemeMode[]) => {
    setState(prev => ({
      ...prev,
      selectedThemes: themes
    }))
  }, [])

  // 添加主题
  const addTheme = useCallback((theme: ThemeMode) => {
    setState(prev => ({
      ...prev,
      selectedThemes: prev.selectedThemes.find(t => t.id === theme.id) 
        ? prev.selectedThemes 
        : [...prev.selectedThemes, theme]
    }))
  }, [])

  // 移除主题
  const removeTheme = useCallback((themeId: string) => {
    setState(prev => ({
      ...prev,
      selectedThemes: prev.selectedThemes.filter(t => t.id !== themeId)
    }))
  }, [])

  // 清空主题
  const clearThemes = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedThemes: []
    }))
  }, [])

  // 生成基于主题的提示词
  const generateThemePrompt = useCallback((themes: ThemeMode[], originalPrompt: string): string => {
    if (themes.length === 0) return originalPrompt

    const themeDescriptions = themes.map(theme => 
      `${theme.emoji} ${theme.name}模式：${theme.description}`
    ).join('；')

    return `${originalPrompt}

请特别注意以下主题偏好：
${themeDescriptions}

请根据这些主题特点调整推荐的景点、餐厅、住宿和活动安排。`
  }, [])

  return {
    ...state,
    parseThemeTags,
    setSelectedThemes,
    addTheme,
    removeTheme,
    clearThemes,
    generateThemePrompt,
    allThemes: THEME_MODES
  }
}