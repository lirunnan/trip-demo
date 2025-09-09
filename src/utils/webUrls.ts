/**
 * 根据攻略ID获取对应的web展示URL
 * 只有特定的攻略才有对应的外部展示页面
 */
export const getWebUrlByGuideId = (guideId: string, isUpgraded: boolean = false): string => {
  switch (guideId) {
    case 'uk-harry-potter-7days':
      return !isUpgraded 
        ? 'https://v0-harry-potter-trip-zf.vercel.app/'
        : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/uk-harry-potter-7days.html`
    case 'japan-sakura-7days':
      return !isUpgraded 
        ? 'https://v0-japan-travel-website-six.vercel.app/'
        : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/japan-7days.html`
    default:
      return '' // 其他攻略暂无对应的web展示页面
  }
}

/**
 * 检查指定攻略是否支持web嵌入模式
 */
export const hasWebUrl = (guideId: string): boolean => {
  return getWebUrlByGuideId(guideId) !== ''
}