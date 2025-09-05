import { NextRequest, NextResponse } from 'next/server';
import { scrapeXiaohongshuContent, validateXiaohongshuUrl } from '@/utils/xiaohongshu-scraper';
import { analyzeXiaohongshuContent, convertAnalysisToTravelPrompt } from '@/utils/claude';

interface XiaohongshuContent {
  title: string;
  content: string;
  images?: string[];
  location?: string;
  tags?: string[];
  author?: string;
}

// 智能抓取和分析小红书内容
async function extractAndAnalyzeXiaohongshuContent(url: string): Promise<{
  originalContent: XiaohongshuContent;
  analysisResult: any;
  travelPrompt: string;
}> {
  try {
    console.log(`开始处理小红书链接: ${url}`);
    
    // 第一步：抓取原始内容
    const originalContent = await scrapeXiaohongshuContent(url);
    console.log('原始内容抓取完成:', originalContent.title);
    
    // 第二步：使用Claude分析内容
    const analysisResult = await analyzeXiaohongshuContent(originalContent.content, url);
    console.log('Claude分析完成:', analysisResult.success ? '成功' : '失败');
    
    // 第三步：生成旅行提示词
    let travelPrompt: string;
    
    if (analysisResult.success && analysisResult.data) {
      // 使用Claude分析结果生成提示词
      travelPrompt = convertAnalysisToTravelPrompt(analysisResult.data);
      console.log('基于AI分析生成提示词');
    } else {
      // 如果Claude分析失败，使用原始内容生成基础提示词
      travelPrompt = generateFallbackPrompt(originalContent);
      console.log('使用备用方案生成提示词');
    }
    
    return {
      originalContent,
      analysisResult: analysisResult.success ? analysisResult.data : null,
      travelPrompt
    };
    
  } catch (error) {
    console.error('小红书内容处理失败:', error);
    throw error;
  }
}

// 备用提示词生成函数
function generateFallbackPrompt(content: XiaohongshuContent): string {
  return `基于以下小红书内容，为我生成详细的旅行攻略：

📝 **原内容标题**: ${content.title}
📍 **目的地**: ${content.location || '未指定'}
🏷️ **相关标签**: ${content.tags?.join(', ') || '无'}
👤 **作者**: ${content.author || '匿名用户'}

🎨 **内容摘要**:
${content.content}

📋 **请基于以上内容，为我制定详细的旅行计划**，包括：
- 行程安排建议
- 景点详细信息和坐标
- 交通路线规划
- 美食餐厅推荐
- 住宿建议
- 预算估算
- 实用出行贴士

请确保推荐的地点都有准确的地理坐标，方便在地图上标注。`;
}
    

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  try {
    // 解码URL参数
    const decodedUrl = decodeURIComponent(params.url);
    console.log(`处理GET请求，URL: ${decodedUrl}`);
    
    // 验证是否为小红书链接
    if (!validateXiaohongshuUrl(decodedUrl)) {
      return NextResponse.json(
        { error: '请提供有效的小红书链接' },
        { status: 400 }
      );
    }

    // 智能抓取和分析小红书内容
    const result = await extractAndAnalyzeXiaohongshuContent(decodedUrl);
    
    return NextResponse.json({
      success: true,
      data: {
        originalContent: result.originalContent,
        analysisResult: result.analysisResult,
        travelPrompt: result.travelPrompt,
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'xiaohongshu',
          url: decodedUrl,
          aiAnalyzed: !!result.analysisResult,
          processor: result.analysisResult ? 'claude-4-sonnet' : 'fallback'
        }
      }
    });

  } catch (error) {
    console.error('处理小红书链接失败:', error);
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '抓取失败，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('无效的小红书链接')) {
        errorMessage = '链接格式不正确，请检查后重试';
        statusCode = 400;
      } else if (error.message.includes('API key') || error.message.includes('API密钥')) {
        errorMessage = 'AI分析服务配置异常，请联系管理员';
        statusCode = 503;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'AI分析服务忙碌中，请稍后重试';
        statusCode = 429;
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = '网络连接异常，请检查网络后重试';
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    console.log(`处理POST请求，URL: ${url}`);

    if (!url) {
      return NextResponse.json(
        { error: '请提供小红书链接' },
        { status: 400 }
      );
    }

    // 验证是否为小红书链接
    if (!validateXiaohongshuUrl(url)) {
      return NextResponse.json(
        { error: '请提供有效的小红书链接' },
        { status: 400 }
      );
    }

    // 智能抓取和分析小红书内容
    const result = await extractAndAnalyzeXiaohongshuContent(url);
    
    return NextResponse.json({
      success: true,
      data: {
        originalContent: result.originalContent,
        analysisResult: result.analysisResult,
        travelPrompt: result.travelPrompt,
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'xiaohongshu',
          url: url,
          aiAnalyzed: !!result.analysisResult,
          processor: result.analysisResult ? 'claude-4-sonnet' : 'fallback'
        }
      }
    });

  } catch (error) {
    console.error('处理小红书链接失败:', error);
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '抓取失败，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('无效的小红书链接')) {
        errorMessage = '链接格式不正确，请检查后重试';
        statusCode = 400;
      } else if (error.message.includes('API key') || error.message.includes('API密钥')) {
        errorMessage = 'AI分析服务配置异常，请联系管理员';
        statusCode = 503;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'AI分析服务忙碌中，请稍后重试';
        statusCode = 429;
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = '网络连接异常，请检查网络后重试';
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: statusCode }
    );
  }
}
