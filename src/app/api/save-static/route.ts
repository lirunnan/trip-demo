import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, html, createdAt } = body
    
    if (!id || !title || !html) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 确保 public/shared 目录存在
    const sharedDir = join(process.cwd(), 'public', 'shared')
    if (!existsSync(sharedDir)) {
      await mkdir(sharedDir, { recursive: true })
    }

    // 生成完整的HTML文件内容
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 行呗旅游攻略</title>
    <meta name="description" content="${title} - 由行呗AI生成的个性化旅游攻略">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="个性化AI旅游攻略">
    <meta property="og:type" content="website">
    <link rel="icon" href="/favicon.ico">
</head>
<body>
    ${html}
    
    <script>
        // 添加返回按钮（根据URL参数判断是否显示）
        document.addEventListener('DOMContentLoaded', function() {
            // 检查URL参数是否包含iframe=true
            const urlParams = new URLSearchParams(window.location.search);
            const isIframe = urlParams.get('iframe') === 'true';
            
            // 如果是iframe模式，则不显示返回按钮
            if (isIframe) {
                return;
            }
            
            const backButton = document.createElement('div');
            backButton.innerHTML = '← 返回首页';
            backButton.style.cssText = \`
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255,255,255,0.9);
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                font-weight: 500;
                color: #333;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.5);
                z-index: 1000;
                transition: all 0.3s ease;
            \`;
            
            backButton.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
            };
            
            backButton.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            };
            
            backButton.onclick = function() {
                window.location.href = '/';
            };
            
            document.body.appendChild(backButton);
        });
    </script>
</body>
</html>`

    // 写入文件
    const filePath = join(sharedDir, `${id}.html`)
    await writeFile(filePath, fullHtml, 'utf8')

    // 生成分享链接
    const shareUrl = `/shared/${id}.html`

    console.log(`✅ 静态文件保存成功: ${filePath}`)

    return NextResponse.json({
      success: true,
      data: {
        id,
        title,
        shareUrl,
        filePath: filePath,
        createdAt: createdAt || new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ 保存静态文件失败:', error)
    return NextResponse.json(
      { error: '保存失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取已保存的静态文件列表
export async function GET() {
  try {
    const { readdir, stat } = await import('fs/promises')
    const sharedDir = join(process.cwd(), 'public', 'shared')
    
    if (!existsSync(sharedDir)) {
      return NextResponse.json({ success: true, files: [] })
    }

    const files = await readdir(sharedDir)
    const htmlFiles = files.filter(file => file.endsWith('.html'))
    
    const fileDetails = await Promise.all(
      htmlFiles.map(async (file) => {
        const filePath = join(sharedDir, file)
        const stats = await stat(filePath)
        const id = file.replace('.html', '')
        
        return {
          id,
          filename: file,
          shareUrl: `/shared/${file}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        }
      })
    )

    return NextResponse.json({
      success: true,
      files: fileDetails.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })

  } catch (error) {
    console.error('❌ 获取文件列表失败:', error)
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    )
  }
}