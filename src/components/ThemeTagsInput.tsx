'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Hash, Sparkles, Send, Loader2 } from 'lucide-react'
import { ThemeMode, THEME_MODES } from '@/hooks/useThemeMode'

interface ThemeTagsInputProps {
  selectedThemes: ThemeMode[]
  onThemeAdd: (theme: ThemeMode) => void
  onThemeRemove: (themeId: string) => void
  onInputChange: (value: string) => void
  inputValue: string
  placeholder?: string
  onSubmit?: () => void
  isLoading?: boolean
  submitButtonText?: string
  disabled?: boolean
}

export default function ThemeTagsInput({
  selectedThemes,
  onThemeAdd,
  onThemeRemove,
  onInputChange,
  inputValue,
  placeholder,
  onSubmit,
  isLoading = false,
  submitButtonText = '发送',
  disabled = false
}: ThemeTagsInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredThemes, setFilteredThemes] = useState<ThemeMode[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 过滤主题建议
  useEffect(() => {
    const input = inputValue.toLowerCase()
    const lastHashIndex = input.lastIndexOf('#')
    
    if (lastHashIndex !== -1 && lastHashIndex === input.length - 1) {
      // 刚输入 # 时显示所有主题
      setFilteredThemes(THEME_MODES.filter(theme => 
        !selectedThemes.find(selected => selected.id === theme.id)
      ))
      setShowSuggestions(true)
    } else if (lastHashIndex !== -1) {
      // 有 # 并且后面有字符时过滤主题
      const searchTerm = input.slice(lastHashIndex + 1)
      const filtered = THEME_MODES.filter(theme => {
        const isNotSelected = !selectedThemes.find(selected => selected.id === theme.id)
        const matchesSearch = theme.name.toLowerCase().includes(searchTerm) ||
                             theme.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        return isNotSelected && matchesSearch
      })
      setFilteredThemes(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [inputValue, selectedThemes])

  // 选择主题建议
  const handleThemeSelect = (theme: ThemeMode) => {
    const lastHashIndex = inputValue.lastIndexOf('#')
    if (lastHashIndex !== -1) {
      // 移除 #标签 部分，保留其他文本
      const beforeHash = inputValue.slice(0, lastHashIndex)
      const afterTag = inputValue.slice(inputValue.indexOf(' ', lastHashIndex) + 1) || ''
      const newValue = `${beforeHash}${afterTag}`.trim()
      onInputChange(newValue)
    }
    onThemeAdd(theme)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter' && showSuggestions && filteredThemes.length > 0) {
      e.preventDefault()
      handleThemeSelect(filteredThemes[0])
    } else if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  return (
    <div className="relative">
      {/* 已选主题标签 */}
      {selectedThemes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedThemes.map((theme) => (
            <div
              key={theme.id}
              className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
            >
              <span className="text-base">{theme.emoji}</span>
              <span>{theme.name}</span>
              <button
                onClick={() => onThemeRemove(theme.id)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-4 pr-20 border border-gray-300 dark:border-gray-600 rounded-2xl 
                   bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* 提示图标 */}
        {inputValue.includes('#') && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <Hash className="w-4 h-4 text-blue-500" />
          </div>
        )}
        
        {/* 发送按钮 */}
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!inputValue.trim() || isLoading || disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 
                     disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                     text-white transition-colors"
            title={submitButtonText}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 主题建议下拉框 */}
      {showSuggestions && filteredThemes.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <Sparkles className="w-4 h-4" />
              <span>选择主题模式</span>
            </div>
            {filteredThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-xl">{theme.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {theme.name}模式
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {theme.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      {selectedThemes.length === 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 输入 # 可选择主题模式，如 #亲子 #美食 #背包
        </div>
      )}
    </div>
  )
}