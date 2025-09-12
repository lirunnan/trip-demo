import { existsSync } from 'fs'
import { join } from 'path'

export function checkImageExists(imagePath: string): boolean {
  const fullPath = join(process.cwd(), 'public', imagePath.replace(/^\//, ''))
  return existsSync(fullPath)
}

export function getFallbackImagePath(): string {
  return '/images/fallback-travel.png'
}

export function getImagePath(convId: string): string {
  const generatedPath = `/images/generated-${convId}.png`
  
  // 检查生成的图片是否存在
  if (checkImageExists(generatedPath)) {
    return generatedPath
  }
  
  // 如果不存在则返回兜底图片
  return getFallbackImagePath()
}