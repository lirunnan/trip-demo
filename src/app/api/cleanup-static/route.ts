import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 清理策略配置
const CLEANUP_CONFIG = {
  // 文件保存的最大天数（超过后自动删除）
  MAX_AGE_DAYS: 30,
  // 最大文件数量（超过后删除最旧的）
  MAX_FILES: 1000,
  // 单次清理的最大删除数量
  MAX_DELETE_PER_CLEANUP: 50
}

interface FileInfo {
  filename: string
  path: string
  createdAt: Date
  size: number
}

export async function POST(request: NextRequest) {
  try {
    const { force = false } = await request.json().catch(() => ({}))
    
    const sharedDir = join(process.cwd(), 'public', 'shared')
    if (!existsSync(sharedDir)) {
      return NextResponse.json({
        success: true,
        message: '没有找到shared目录',
        deleted: 0
      })
    }

    // 获取所有HTML文件信息
    const files = await readdir(sharedDir)
    const htmlFiles = files.filter(file => file.endsWith('.html'))
    
    if (htmlFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到HTML文件',
        deleted: 0
      })
    }

    const fileInfos: FileInfo[] = await Promise.all(
      htmlFiles.map(async (file) => {
        const filePath = join(sharedDir, file)
        const stats = await stat(filePath)
        
        return {
          filename: file,
          path: filePath,
          createdAt: stats.birthtime,
          size: stats.size
        }
      })
    )

    // 按创建时间排序（最旧的在前）
    fileInfos.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const now = new Date()
    const maxAgeMs = CLEANUP_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60 * 1000
    
    let toDelete: FileInfo[] = []
    let deletedCount = 0
    let totalSize = 0

    if (force) {
      // 强制清理：删除所有文件
      toDelete = fileInfos
    } else {
      // 1. 删除过期文件
      const expiredFiles = fileInfos.filter(file => {
        const age = now.getTime() - file.createdAt.getTime()
        return age > maxAgeMs
      })
      toDelete.push(...expiredFiles)

      // 2. 如果文件数量超限，删除最旧的文件
      const remainingFiles = fileInfos.filter(file => !toDelete.includes(file))
      if (remainingFiles.length > CLEANUP_CONFIG.MAX_FILES) {
        const excessCount = remainingFiles.length - CLEANUP_CONFIG.MAX_FILES
        const excessFiles = remainingFiles.slice(0, excessCount)
        toDelete.push(...excessFiles)
      }

      // 3. 限制单次删除数量
      toDelete = toDelete.slice(0, CLEANUP_CONFIG.MAX_DELETE_PER_CLEANUP)
    }

    // 执行删除
    const deleteResults = await Promise.allSettled(
      toDelete.map(async (file) => {
        await unlink(file.path)
        totalSize += file.size
        return file.filename
      })
    )

    deletedCount = deleteResults.filter(result => result.status === 'fulfilled').length
    
    const failedCount = deleteResults.filter(result => result.status === 'rejected').length
    const remainingCount = fileInfos.length - deletedCount

    console.log(`🧹 清理完成: 删除 ${deletedCount} 个文件，剩余 ${remainingCount} 个文件`)

    return NextResponse.json({
      success: true,
      message: `清理完成`,
      stats: {
        deleted: deletedCount,
        failed: failedCount,
        remaining: remainingCount,
        totalSizeDeleted: totalSize,
        deletedFiles: deleteResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<string>).value)
      }
    })

  } catch (error) {
    console.error('❌ 清理静态文件失败:', error)
    return NextResponse.json(
      { error: '清理失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取清理状态和统计信息
export async function GET() {
  try {
    const sharedDir = join(process.cwd(), 'public', 'shared')
    
    if (!existsSync(sharedDir)) {
      return NextResponse.json({
        success: true,
        stats: {
          totalFiles: 0,
          totalSize: 0,
          oldestFile: null,
          newestFile: null,
          expiredFiles: 0
        },
        config: CLEANUP_CONFIG
      })
    }

    const files = await readdir(sharedDir)
    const htmlFiles = files.filter(file => file.endsWith('.html'))
    
    if (htmlFiles.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalFiles: 0,
          totalSize: 0,
          oldestFile: null,
          newestFile: null,
          expiredFiles: 0
        },
        config: CLEANUP_CONFIG
      })
    }

    let totalSize = 0
    let oldestFile: { name: string, date: Date } | null = null
    let newestFile: { name: string, date: Date } | null = null
    let expiredCount = 0

    const now = new Date()
    const maxAgeMs = CLEANUP_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60 * 1000

    for (const file of htmlFiles) {
      const filePath = join(sharedDir, file)
      const stats = await stat(filePath)
      
      totalSize += stats.size
      
      const createdAt = stats.birthtime
      const age = now.getTime() - createdAt.getTime()
      
      if (age > maxAgeMs) {
        expiredCount++
      }
      
      if (!oldestFile || createdAt < oldestFile.date) {
        oldestFile = { name: file, date: createdAt }
      }
      
      if (!newestFile || createdAt > newestFile.date) {
        newestFile = { name: file, date: createdAt }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles: htmlFiles.length,
        totalSize,
        oldestFile,
        newestFile,
        expiredFiles: expiredCount,
        shouldCleanup: expiredCount > 0 || htmlFiles.length > CLEANUP_CONFIG.MAX_FILES
      },
      config: CLEANUP_CONFIG
    })

  } catch (error) {
    console.error('❌ 获取清理统计失败:', error)
    return NextResponse.json(
      { error: '获取统计信息失败' },
      { status: 500 }
    )
  }
}