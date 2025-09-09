'use client'

import { useState } from 'react'
import { Share, Copy, Check, ExternalLink } from 'lucide-react'
import { saveAsStaticFile, ShareToStaticResult } from '@/utils/indexedDB'
import { copyToClipboard } from '@/utils/clipboard'

interface ShareButtonProps {
  pageId: string
  onShare?: (result: ShareToStaticResult) => void
}

export default function ShareButton({ pageId, onShare }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareResult, setShareResult] = useState<ShareToStaticResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (isSharing) return

    setIsSharing(true)
    try {
      const result = await saveAsStaticFile(pageId)
      setShareResult(result)
      onShare?.(result)

      if (result.success && result.shareUrl) {
        // 自动复制链接到剪贴板
        const fullUrl = `${window.location.origin}${result.shareUrl}`
        const copyResult = await copyToClipboard(fullUrl)
        if (copyResult.success) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } else {
          console.warn('自动复制失败:', copyResult.error)
        }
      }
    } catch (error) {
      console.error('分享失败:', error)
      setShareResult({
        success: false,
        error: '分享失败，请稍后重试'
      })
    } finally {
      setIsSharing(false)
    }
  }

  const copyLink = async () => {
    if (!shareResult?.shareUrl) return

    const fullUrl = `${window.location.origin}${shareResult.shareUrl}`
    const copyResult = await copyToClipboard(fullUrl)
    
    if (copyResult.success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      console.error('复制失败:', copyResult.error)
      alert(`复制失败: ${copyResult.error}\n\n请手动复制链接: ${fullUrl}`)
    }
  }

  const openInNewTab = () => {
    if (!shareResult?.shareUrl) return
    window.open(shareResult.shareUrl, '_blank')
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      {!shareResult ? (
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Share className={`w-4 h-4 ${isSharing ? 'animate-spin' : ''}`} />
          {isSharing ? '生成分享链接中...' : '分享攻略'}
        </button>
      ) : shareResult.success ? (
        <div className="flex flex-col items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-200 font-medium text-center">
            ✅ 分享链接已生成！
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  复制链接
                </>
              )}
            </button>
            <button
              onClick={openInNewTab}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              预览
            </button>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            链接: {shareResult.shareUrl}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="text-sm text-red-800 dark:text-red-200 text-center">
            ❌ {shareResult.error || '分享失败'}
          </div>
          <button
            onClick={() => setShareResult(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}

// 使用示例组件
export function ShareExample() {
  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">分享你的旅游攻略</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        点击按钮将生成一个可直接访问的静态链接，无需登录即可查看
      </p>
      
      <ShareButton
        pageId="example-page-id"
        onShare={(result) => {
          console.log('分享结果:', result)
          if (result.success) {
            // 可以在这里添加统计、通知等逻辑
            console.log('分享链接:', `${window.location.origin}${result.shareUrl}`)
          }
        }}
      />
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
        💡 提示：生成的静态文件将保存在 public/shared/ 目录下
      </div>
    </div>
  )
}