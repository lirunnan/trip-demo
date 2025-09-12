import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const convId = searchParams.get('convId')
    
    if (!convId) {
      return NextResponse.json(
        { error: 'Missing convId parameter' },
        { status: 400 }
      )
    }
    
    // 检查生成的图片是否存在
    const generatedImagePath = join(process.cwd(), 'public', 'images', `generated-${convId}.png`)
    const exists = existsSync(generatedImagePath)
    
    const imagePath = exists 
      ? `/images/generated-${convId}.png`
      : `/images/fallback-travel.png`
    
    return NextResponse.json({
      success: true,
      imagePath,
      exists,
      fallback: !exists
    })
    
  } catch (error) {
    console.error('检查图片失败:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check image',
        imagePath: '/images/fallback-travel.png',
        fallback: true
      },
      { status: 500 }
    )
  }
}