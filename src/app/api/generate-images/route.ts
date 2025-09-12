import { NextRequest, NextResponse } from 'next/server'

// 精简的图片生成API
export async function POST(request: NextRequest) {
  console.log('🎨 [ImageGeneration] 开始生成图片...')
  
  try {
    const { query } = await request.json()
    
    if (!query?.trim()) {
      return NextResponse.json({
        success: false,
        error: '查询内容不能为空'
      }, { status: 400 })
    }
    
    console.log('📝 [ImageGeneration] 查询:', query)
    
    // API密钥
    const apiKey = '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'
    
    // 调用Gemini API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `生成一个${query}的图片`
              }
            ]
          }
        ]
      })
    })
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ [ImageGeneration] API调用成功')
    
    // 解析图片数据
    const message = result.choices?.[0]?.message
    let imageUrl = ''
    
    // 关键：图片数据在 message.images[0].image_url.url
    if (message?.images?.[0]?.image_url?.url) {
      imageUrl = message.images[0].image_url.url
      console.log('✅ [ImageGeneration] 找到图片，大小:', Math.round(imageUrl.length / 1024), 'KB')
    } else {
      console.log('❌ [ImageGeneration] 未找到图片数据')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        description: message?.content || `生成的${query}图片`,
        modelUsed: 'google/gemini-2.5-flash-image-preview'
      }
    })
    
  } catch (error) {
    console.error('❌ [ImageGeneration] 失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成失败'
    }, { status: 500 })
  }
}

// 支持GET请求用于快速测试
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || '北京旅游'
  
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' }
  }))
}