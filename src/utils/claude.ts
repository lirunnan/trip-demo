import Anthropic from '@anthropic-ai/sdk';

// Claude API 配置
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ClaudeAnalysisResult {
  success: boolean;
  data?: {
    title: string;
    destination: string;
    duration: string;
    theme: string;
    content: string;
    highlights: string[];
    locations: Array<{
      name: string;
      description: string;
      type: string;
      coordinates?: [number, number];
    }>;
    tips: string[];
    budget?: string;
    bestTime?: string;
    transportation?: string;
    accommodation?: string;
  };
  error?: string;
}

// 构建小红书内容分析的Prompt
function buildAnalysisPrompt(content: string, url: string): string {
  return `你是一个专业的旅游攻略分析师。请分析以下小红书内容，提取出结构化的旅游信息。

**小红书链接**: ${url}

**原始内容**:
${content}

请按照以下JSON格式返回分析结果（请确保返回有效的JSON）：

{
  "title": "攻略标题",
  "destination": "目的地（城市或地区）",
  "duration": "建议游玩天数（如：3天2夜）",
  "theme": "旅行主题（如：文化体验、美食探索、自然风光等）",
  "content": "详细的攻略内容描述",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "locations": [
    {
      "name": "地点名称",
      "description": "地点描述",
      "type": "地点类型（如：景点、餐厅、酒店等）",
      "coordinates": [经度, 纬度] // 如果能推断出大概位置的话
    }
  ],
  "tips": ["实用建议1", "实用建议2"],
  "budget": "预算建议（如果有提到）",
  "bestTime": "最佳游玩时间（如果有提到）",
  "transportation": "交通建议（如果有提到）",
  "accommodation": "住宿建议（如果有提到）"
}

**分析要求**：
1. 仔细提取文中提到的具体地点、景点、餐厅等
2. 总结旅行的主要特色和亮点
3. 提取实用的旅行建议和注意事项
4. 如果内容中有预算、时间、交通等信息，请一并提取
5. 对于地点坐标，如果无法确定具体位置，可以省略coordinates字段
6. 确保返回的是标准的JSON格式，不要包含其他文字

请开始分析：`;
}

// 调用Claude API进行内容分析
export async function analyzeXiaohongshuContent(
  content: string, 
  url: string
): Promise<ClaudeAnalysisResult> {
  try {
    console.log('开始调用Claude API分析小红书内容...');
    
    const prompt = buildAnalysisPrompt(content, url);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysisText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    console.log('Claude API响应:', analysisText);

    // 尝试解析JSON响应
    try {
      const analysisData = JSON.parse(analysisText);
      
      return {
        success: true,
        data: {
          title: analysisData.title || '小红书旅游攻略',
          destination: analysisData.destination || '未知目的地',
          duration: analysisData.duration || '建议3-5天',
          theme: analysisData.theme || '综合旅游',
          content: analysisData.content || content,
          highlights: Array.isArray(analysisData.highlights) ? analysisData.highlights : [],
          locations: Array.isArray(analysisData.locations) ? analysisData.locations : [],
          tips: Array.isArray(analysisData.tips) ? analysisData.tips : [],
          budget: analysisData.budget,
          bestTime: analysisData.bestTime,
          transportation: analysisData.transportation,
          accommodation: analysisData.accommodation
        }
      };
    } catch (parseError) {
      console.error('解析Claude响应JSON失败:', parseError);
      console.error('原始响应:', analysisText);
      
      // 如果JSON解析失败，尝试从响应中提取有用信息
      return {
        success: false,
        error: 'AI分析结果格式异常，请重试'
      };
    }

  } catch (error) {
    console.error('Claude API调用失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return {
          success: false,
          error: 'API密钥配置错误，请检查环境变量'
        };
      } else if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'API调用频率超限，请稍后重试'
        };
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        return {
          success: false,
          error: '网络连接异常，请检查网络后重试'
        };
      }
    }
    
    return {
      success: false,
      error: 'AI分析服务暂时不可用，请稍后重试'
    };
  }
}

// 将分析结果转换为旅行提示词
export function convertAnalysisToTravelPrompt(analysis: ClaudeAnalysisResult['data']): string {
  if (!analysis) return '';

  let prompt = `基于小红书攻略内容，为我生成详细的旅行计划：

📝 **攻略标题**: ${analysis.title}
📍 **目的地**: ${analysis.destination}
⏰ **建议时长**: ${analysis.duration}
🎯 **旅行主题**: ${analysis.theme}

🎨 **攻略内容**:
${analysis.content}

✨ **精彩亮点**:
${analysis.highlights.map((highlight, index) => `${index + 1}. ${highlight}`).join('\n')}

📍 **推荐地点**:
${analysis.locations.map((location, index) => 
  `${index + 1}. ${location.name} - ${location.description} (${location.type})`
).join('\n')}

💡 **实用建议**:
${analysis.tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n')}`;

  // 添加可选信息
  if (analysis.budget) {
    prompt += `\n\n💰 **预算参考**: ${analysis.budget}`;
  }
  
  if (analysis.bestTime) {
    prompt += `\n\n🗓️ **最佳时间**: ${analysis.bestTime}`;
  }
  
  if (analysis.transportation) {
    prompt += `\n\n🚗 **交通建议**: ${analysis.transportation}`;
  }
  
  if (analysis.accommodation) {
    prompt += `\n\n🏨 **住宿建议**: ${analysis.accommodation}`;
  }

  prompt += `

📋 **请基于以上信息，为我制定详细的旅行计划**，包括：
- 具体的日程安排
- 景点的详细介绍和坐标信息
- 最优的游览路线规划
- 餐饮和住宿的具体推荐
- 交通方式和时间安排
- 预算明细和省钱技巧
- 当地特色体验和注意事项

请确保推荐的所有地点都有准确的地理坐标，方便在地图上标注和导航。`;

  return prompt;
}
