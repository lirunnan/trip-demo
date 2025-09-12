import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { imageData, fileName } = await request.json()
    
    if (!imageData || !fileName) {
      return NextResponse.json(
        { error: 'Missing imageData or fileName' },
        { status: 400 }
      )
    }
    
    // 移除base64前缀（如果存在）
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // 将base64转换为buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // 构建文件路径
    const publicImagesDir = join(process.cwd(), 'public', 'images')
    const filePath = join(publicImagesDir, fileName)
    
    // 保存文件
    await writeFile(filePath, buffer)
    
    // 返回相对路径，用于前端访问
    const relativePath = `/images/${fileName}`
    
    return NextResponse.json({
      success: true,
      filePath: relativePath,
      fileName
    })
    
  } catch (error) {
    console.error('保存图片失败:', error)
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    )
  }
}