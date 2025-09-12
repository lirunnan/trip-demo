/**
   * 根据攻略ID获取对应的web展示URL
 * 只有特定的攻略才有对应的外部展示页面
 */
export const getWebUrlByGuideId = (guideId: string, isUpgraded: boolean = false): string => {
  switch (guideId) {
    case 'uk-harry-potter-7days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_uk_7days.html`
    case 'japan-sakura-7days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_jp_7days.html`
    case 'chengdu-3days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_chengdu_3days.html`
    case 'chongqing-5days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_chongqing_5days.html`
    case 'datong-3days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_datong_3days.html`
    case 'japan-3days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_jp_3days.html`
    case 'lasa-7days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_lasa_7days.html`
    case 'sanya-3days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_sanya_3days.html`
    case 'usa-7days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_usa_7days.html`
    case 'xiamen-3days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_xiamen_3days.html`
    case 'xizang-7days':
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/templates/templates_xizang_7days.html`
    default:
      return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'}/shared/${guideId}.html` // 其他攻略暂无对应的web展示页面
  }
}

/**
 * 检查指定攻略是否支持web嵌入模式
 */
export const hasWebUrl = (guideId: string): boolean => {
  return getWebUrlByGuideId(guideId) !== ''
}