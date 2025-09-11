import { useCallback } from 'react'
import { ItineraryDay } from '@/components/ChatInterface'

interface ShareableItinerary {
  id: string
  title: string
  itinerary: ItineraryDay[]
  createdAt: string
  totalDays: number
  totalAttractions: number
}

export function useExportFeatures() {
  // 生成分享链接
  const generateShareLink = useCallback(async (itinerary: ItineraryDay[], title?: string): Promise<string> => {
    try {
      // 模拟保存到后端
      const shareData: ShareableItinerary = {
        id: Date.now().toString(),
        title: title || `${itinerary.length}天旅行计划`,
        itinerary,
        createdAt: new Date().toISOString(),
        totalDays: itinerary.length,
        totalAttractions: itinerary.reduce((total, day) => total + day.locations.length, 0)
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 在实际应用中，这里会调用后端API保存数据并返回分享链接
      // const response = await fetch('/api/share', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(shareData)
      // })
      // const result = await response.json()
      // return result.shareUrl
      
      // 模拟生成的分享链接
      const shareUrl = `${window.location.origin}/shared/${shareData.id}`
      
      // 暂时保存到 localStorage 作为模拟后端存储
      const savedData = JSON.parse(localStorage.getItem('sharedItineraries') || '{}')
      savedData[shareData.id] = shareData
      localStorage.setItem('sharedItineraries', JSON.stringify(savedData))
      
      return shareUrl
    } catch (error) {
      console.error('生成分享链接失败:', error)
      throw new Error('分享链接生成失败，请稍后重试')
    }
  }, [])

  // 复制分享链接到剪贴板
  const copyShareLink = useCallback(async (itinerary: ItineraryDay[], title?: string): Promise<void> => {
    try {
      const shareUrl = await generateShareLink(itinerary, title)
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      // 可以显示成功提示
      console.log('分享链接已复制到剪贴板:', shareUrl)
    } catch (error) {
      console.error('复制分享链接失败:', error)
      throw error
    }
  }, [generateShareLink])

  // 生成PDF内容
  const generatePDFContent = useCallback((itinerary: ItineraryDay[], title?: string): string => {
    const pdfTitle = title || `${itinerary.length}天旅行计划`
    
    let content = `${pdfTitle}\n`
    content += `生成时间：${new Date().toLocaleString('zh-CN')}\n`
    content += `行程天数：${itinerary.length}天\n`
    content += `景点总数：${itinerary.reduce((total, day) => total + day.locations.length, 0)}个\n\n`
    
    itinerary.forEach((day, dayIndex) => {
      content += `=== 第${day.day}天 (${day.date}) ===\n\n`
      
      day.locations.forEach((location, locationIndex) => {
        const startHour = 9 + Math.floor(locationIndex * 2.5)
        const endHour = startHour + (parseInt(location.duration.match(/(\d+)小时/)?.[1] || '2'))
        
        content += `${locationIndex + 1}. ${location.name}\n`
        content += `   时间：${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00\n`
        content += `   类型：${location.type}\n`
        content += `   游览时长：${location.duration}\n`
        content += `   介绍：${location.description}\n`
        content += `   坐标：${location.coordinates[1]}, ${location.coordinates[0]}\n\n`
      })
      
      if (dayIndex < itinerary.length - 1) {
        content += '\n'
      }
    })
    
    content += '\n=== 旅行贴士 ===\n'
    content += '1. 请提前预订门票，避免排队等候\n'
    content += '2. 建议携带舒适的步行鞋\n'
    content += '3. 注意天气变化，随身携带雨具\n'
    content += '4. 保持手机电量，随时导航\n'
    content += '5. 尊重当地文化和习俗\n\n'
    content += '祝您旅途愉快！\n'
    content += '由行呗AI旅游助手生成'
    
    return content
  }, [])

  // 导出为文本文件（简化版PDF功能）
  const exportAsTextFile = useCallback((itinerary: ItineraryDay[], title?: string): void => {
    try {
      const content = generatePDFContent(itinerary, title)
      const fileName = `${title || '旅行计划'}_${new Date().toISOString().split('T')[0]}.txt`
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      console.log('文件导出成功:', fileName)
    } catch (error) {
      console.error('文件导出失败:', error)
      throw new Error('文件导出失败，请稍后重试')
    }
  }, [generatePDFContent])

  // 导出为JSON格式（用于数据备份）
  const exportAsJSON = useCallback((itinerary: ItineraryDay[], title?: string): void => {
    try {
      const exportData = {
        title: title || `${itinerary.length}天旅行计划`,
        exportTime: new Date().toISOString(),
        itinerary,
        metadata: {
          totalDays: itinerary.length,
          totalAttractions: itinerary.reduce((total, day) => total + day.locations.length, 0),
          generatedBy: '行呗AI旅游助手'
        }
      }
      
      const fileName = `${title || '旅行计划'}_${new Date().toISOString().split('T')[0]}.json`
      const content = JSON.stringify(exportData, null, 2)
      
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      console.log('JSON文件导出成功:', fileName)
    } catch (error) {
      console.error('JSON导出失败:', error)
      throw new Error('JSON导出失败，请稍后重试')
    }
  }, [])

  // 从分享链接加载行程
  const loadSharedItinerary = useCallback(async (shareId: string): Promise<ShareableItinerary | null> => {
    try {
      // 在实际应用中，这里会调用后端API
      // const response = await fetch(`/api/share/${shareId}`)
      // if (!response.ok) throw new Error('行程不存在或已过期')
      // return await response.json()
      
      // 从 localStorage 模拟加载
      const savedData = JSON.parse(localStorage.getItem('sharedItineraries') || '{}')
      const itineraryData = savedData[shareId]
      
      if (!itineraryData) {
        // throw new Error('行程不存在或已过期')
      }
      
      return itineraryData
    } catch (error) {
      console.error('加载分享行程失败:', error)
      return null
    }
  }, [])

  return {
    generateShareLink,
    copyShareLink,
    exportAsTextFile,
    exportAsJSON,
    loadSharedItinerary,
    generatePDFContent
  }
}