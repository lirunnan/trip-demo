// OpenRouter API 集成 - 支持模型选择

export interface OpenRouterAnalysisResult {
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
  modelUsed?: string;
  cost?: number;
}

// 可选择的模型列表
export const AVAILABLE_MODELS = [
  // 免费模型
  { 
    name: 'qwen/qwen-3-8b',
    displayName: 'Qwen3-8B (免费)',
    cost: 0,
    maxTokens: 4000,
    category: '免费'
  },
  { 
    name: 'qwen/qwen-3-14b',
    displayName: 'Qwen3-14B (免费)',
    cost: 0,
    maxTokens: 4000,
    category: '免费'
  },
  { 
    name: 'qwen/qwen-3-235b-a22b',
    displayName: 'Qwen3-235B (免费)',
    cost: 0,
    maxTokens: 4000,
    category: '免费'
  },
  
  // 低成本模型
  { 
    name: 'qwen/qwen-3-32b',
    displayName: 'Qwen3-32B',
    cost: 0.018,
    maxTokens: 4000,
    category: '低成本'
  },
  { 
    name: 'deepseek/deepseek-v3',
    displayName: 'DeepSeek-V3',
    cost: 0.30,
    maxTokens: 4000,
    category: '低成本'
  },
  
  // 高质量模型
  { 
    name: 'anthropic/claude-3-haiku',
    displayName: 'Claude-3-Haiku',
    cost: 0.25,
    maxTokens: 4000,
    category: '高质量'
  },
  { 
    name: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude-3.5-Sonnet',
    cost: 3.0,
    maxTokens: 4000,
    category: '高质量'
  },
  { 
    name: 'openai/gpt-4o',
    displayName: 'GPT-4o',
    cost: 2.5,
    maxTokens: 4000,
    category: '高质量'
  }
];

// 构建小红书链接分析的Prompt
function buildAnalysisPrompt(content: string, url: string): string {
  return `你是一个专业的旅游攻略分析师。请分析以下小红书内容信息，提取出结构化的旅游信息。

**小红书链接**: ${url}

**内容信息**: ${content}

**重要：必须严格按照JSON格式回复，不要添加任何解释文字！**

请按照以下JSON格式返回分析结果：

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

**重要提醒**：
- 只能回复JSON格式，不要任何其他文字
- 不要使用代码块标记
- 不要添加解释或说明
- 如果无法分析，请返回基础的JSON结构

直接返回JSON：`;
}

// 使用指定模型调用OpenRouter API
export async function analyzeWithSpecificModel(
  content: string, 
  url: string,
  modelName: string
): Promise<OpenRouterAnalysisResult> {
  
  console.log('🚀 [OpenRouter] 开始调用指定模型分析小红书内容...');
  console.log('🎯 [OpenRouter] 指定模型:', modelName);
  console.log('🔗 [OpenRouter] URL:', url);
  
  // 检查API密钥配置
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('🔑 [OpenRouter] API Key配置状态:', apiKey ? `已配置 (长度: ${apiKey.length})` : '未配置');
  
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.error('❌ [OpenRouter] API密钥未正确配置!');
    return {
      success: false,
      error: 'API密钥未配置或使用默认值，请在.env.local中设置真实的OPENROUTER_API_KEY'
    };
  }

  // 查找指定模型的配置
  const modelConfig = AVAILABLE_MODELS.find(m => m.name === modelName);
  if (!modelConfig) {
    return {
      success: false,
      error: `未找到模型: ${modelName}`
    };
  }

  try {
    console.log(`🔄 [OpenRouter] 使用 ${modelConfig.displayName} (成本: $${modelConfig.cost}/1K tokens)...`);
    const startTime = Date.now();
    
    const prompt = buildAnalysisPrompt(content, url);
    console.log('📊 [OpenRouter] 提示词长度:', prompt.length, '字符');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Travel Assistant AI',
        'HTTP-Referer': 'http://localhost:3030'
      },
      body: JSON.stringify({
        model: modelConfig.name,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: 0.3
      })
    });
    
    console.log('📥 [OpenRouter] 响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [OpenRouter] 错误响应:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    const endTime = Date.now();
    console.log(`✅ [OpenRouter] ${modelConfig.displayName} 调用成功！耗时:`, endTime - startTime, 'ms');
    
    const analysisText = result.choices?.[0]?.message?.content || '';
    
    if (!analysisText) {
      console.error('❌ [OpenRouter] 响应中没有内容');
      throw new Error('API响应中没有内容');
    }
    
    console.log('📥 [OpenRouter] 响应长度:', analysisText.length, '字符');
    console.log('📄 [OpenRouter] 响应内容预览:', analysisText.substring(0, 300) + '...');

    // 计算成本
    const estimatedTokens = Math.ceil(prompt.length / 4) + Math.ceil(analysisText.length / 4);
    const estimatedCost = (estimatedTokens / 1000) * modelConfig.cost;
    console.log('💰 [OpenRouter] 预估成本: $', estimatedCost.toFixed(6));

    // 解析JSON响应
    try {
      console.log('🔍 [OpenRouter] 原始响应内容:', analysisText);
      
      // 多种清理方式
      let cleanedText = analysisText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^[^{]*/, '') // 移除开头的非JSON内容
        .replace(/[^}]*$/, '') // 移除结尾的非JSON内容
        .trim();
      
      // 如果找不到JSON，尝试提取大括号内的内容
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      console.log('🧹 [OpenRouter] 清理后的JSON:', cleanedText.substring(0, 200) + '...');
      
      const analysisData = JSON.parse(cleanedText);
      console.log('✅ [OpenRouter] JSON解析成功!');
      
      return {
        success: true,
        modelUsed: modelConfig.displayName,
        cost: estimatedCost,
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
      console.error('❌ [OpenRouter] JSON解析失败:', parseError);
      console.error('🔍 [OpenRouter] 解析失败的内容:', analysisText);
      return {
        success: false,
        error: `模型返回格式错误，请尝试其他模型。错误: ${parseError instanceof Error ? parseError.message : '格式错误'}`
      };
    }
    
  } catch (error) {
    console.error('❌ [OpenRouter] 调用失败:', error);
    return {
      success: false,
      error: `API调用失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

// 自动降级模式：按成本从低到高尝试
export async function analyzeXiaohongshuContent(
  content: string, 
  url: string
): Promise<OpenRouterAnalysisResult> {
  
  // 获取环境变量中的首选模型
  const preferredModel = process.env.OPENROUTER_PREFERRED_MODEL;
  
  if (preferredModel) {
    console.log('🎯 [OpenRouter] 使用环境变量指定的模型:', preferredModel);
    return await analyzeWithSpecificModel(content, url, preferredModel);
  }
  
  // 如果没有指定模型，按成本从低到高尝试
  const defaultModels = [
    'qwen/qwen-3-8b',           // 免费
    'qwen/qwen-3-14b',          // 免费
    'qwen/qwen-3-32b',          // 低成本
    'anthropic/claude-3-haiku', // 中等成本，高质量
    'anthropic/claude-3.5-sonnet' // 高成本，最高质量
  ];
  
  console.log('🔄 [OpenRouter] 未指定模型，使用默认降级策略...');
  
  for (const modelName of defaultModels) {
    console.log(`🔄 [OpenRouter] 尝试模型: ${modelName}`);
    const result = await analyzeWithSpecificModel(content, url, modelName);
    
    if (result.success) {
      console.log(`✅ [OpenRouter] 模型 ${modelName} 调用成功!`);
      return result;
    } else {
      console.log(`❌ [OpenRouter] 模型 ${modelName} 失败:`, result.error);
      continue;
    }
  }
  
  return {
    success: false,
    error: '所有模型都调用失败'
  };
}

// 将分析结果转换为旅行提示词
export function convertAnalysisToTravelPrompt(analysis: OpenRouterAnalysisResult['data']): string {
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

// ============= 通用AI模型调用接口 =============

// 通用AI请求参数接口
export interface AIRequest {
  prompt: string;                    // 用户提示词
  systemPrompt?: string;             // 系统提示词（可选）
  model?: string;                    // 指定模型（可选，不指定则自动选择）
  temperature?: number;              // 温度参数（0-1，默认0.3）
  maxTokens?: number;               // 最大输出token数（默认4000）
  responseFormat?: 'text' | 'json'; // 响应格式（默认text）
}

// 通用AI响应接口
export interface AIResponse {
  success: boolean;
  data?: {
    content: string;                 // AI生成的内容
    modelUsed?: string;             // 实际使用的模型
    cost?: number;                  // 调用成本（美元）
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
  };
  error?: string;
}

// 构建通用提示词
function buildUniversalPrompt(request: AIRequest): string {
  let prompt = '';
  
  if (request.systemPrompt) {
    prompt += `系统提示：${request.systemPrompt}\n\n`;
  }
  
  prompt += `用户请求：${request.prompt}`;
  
  // 如果需要JSON格式，添加格式说明
  if (request.responseFormat === 'json') {
    prompt += `\n\n**重要：请严格按照JSON格式回复，不要添加任何解释文字或代码块标记！**`;
  }
  
  return prompt;
}

// 统一的AI模型调用函数
export async function callAI(request: AIRequest): Promise<AIResponse> {
  console.log('🚀 [AI] 开始调用AI模型...');
  console.log('📝 [AI] 请求参数:', {
    promptLength: request.prompt.length,
    model: request.model || '自动选择',
    temperature: request.temperature || 0.3,
    responseFormat: request.responseFormat || 'text'
  });
  
  // 检查API密钥配置
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.error('❌ [AI] API密钥未正确配置!');
    return {
      success: false,
      error: 'API密钥未配置或使用默认值，请在.env.local中设置真实的OPENROUTER_API_KEY'
    };
  }

  // 确定使用的模型
  let selectedModel = request.model;
  if (!selectedModel) {
    // 如果未指定模型，使用环境变量或默认策略
    selectedModel = process.env.OPENROUTER_PREFERRED_MODEL || 'qwen/qwen-3-8b';
  }

  // 查找模型配置
  const modelConfig = AVAILABLE_MODELS.find(m => m.name === selectedModel);
  if (!modelConfig) {
    return {
      success: false,
      error: `未找到模型配置: ${selectedModel}`
    };
  }

  try {
    console.log(`🔄 [AI] 使用 ${modelConfig.displayName} (成本: $${modelConfig.cost}/1K tokens)...`);
    const startTime = Date.now();
    
    const prompt = buildUniversalPrompt(request);
    console.log('📊 [AI] 提示词长度:', prompt.length, '字符');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Travel Assistant AI',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3030'
      },
      body: JSON.stringify({
        model: modelConfig.name,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: request.maxTokens || modelConfig.maxTokens,
        temperature: request.temperature || 0.3
      })
    });
    
    console.log('📥 [AI] 响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AI] 错误响应:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    const endTime = Date.now();
    console.log(`✅ [AI] ${modelConfig.displayName} 调用成功！耗时:`, endTime - startTime, 'ms');
    
    const content = result.choices?.[0]?.message?.content || '';
    
    if (!content) {
      console.error('❌ [AI] 响应中没有内容');
      throw new Error('API响应中没有内容');
    }
    
    console.log('📥 [AI] 响应长度:', content.length, '字符');
    console.log('📄 [AI] 响应内容预览:', content.substring(0, 200) + '...');

    // 计算token使用量和成本
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = (totalTokens / 1000) * modelConfig.cost;
    
    console.log('💰 [AI] 预估成本: $', estimatedCost.toFixed(6));
    console.log('📊 [AI] Token使用量:', {
      input: inputTokens,
      output: outputTokens,
      total: totalTokens
    });

    // 如果需要JSON格式，尝试解析验证
    let finalContent = content;
    if (request.responseFormat === 'json') {
      try {
        // 清理JSON内容
        let cleanedContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/^[^{]*/, '')
          .replace(/[^}]*$/, '')
          .trim();
        
        // 尝试提取大括号内的内容
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }
        
        // 验证JSON格式
        JSON.parse(cleanedContent);
        finalContent = cleanedContent;
        console.log('✅ [AI] JSON格式验证通过');
      } catch (parseError) {
        console.warn('⚠️ [AI] JSON解析失败，返回原始内容:', parseError);
        // JSON解析失败不算错误，返回原始内容
      }
    }
    
    return {
      success: true,
      data: {
        content: finalContent,
        modelUsed: modelConfig.displayName,
        cost: estimatedCost,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens
        }
      }
    };
    
  } catch (error) {
    console.error('❌ [AI] 调用失败:', error);
    return {
      success: false,
      error: `API调用失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

// 智能模型选择：根据任务类型自动选择最合适的模型
export async function callAIWithAutoModel(request: AIRequest): Promise<AIResponse> {
  console.log('🎯 [AI] 智能模型选择模式...');
  
  // 分析任务类型
  const taskType = analyzeTaskType(request.prompt);
  console.log('📋 [AI] 任务类型:', taskType);
  
  // 根据任务类型选择模型策略
  const modelStrategy = getModelStrategy(taskType);
  console.log('🎯 [AI] 模型策略:', modelStrategy.map(m => m.displayName).join(' → '));
  
  // 按策略依次尝试模型
  for (const model of modelStrategy) {
    console.log(`🔄 [AI] 尝试模型: ${model.displayName}`);
    
    const result = await callAI({
      ...request,
      model: model.name
    });
    
    if (result.success) {
      console.log(`✅ [AI] 模型 ${model.displayName} 调用成功!`);
      return result;
    } else {
      console.log(`❌ [AI] 模型 ${model.displayName} 失败:`, result.error);
      continue;
    }
  }
  
  return {
    success: false,
    error: '所有推荐模型都调用失败'
  };
}

// 分析任务类型
function analyzeTaskType(prompt: string): 'creative' | 'analytical' | 'conversational' | 'structured' {
  const lowerPrompt = prompt.toLowerCase();
  
  // 创意类任务（需要想象力和创造性）
  if (lowerPrompt.includes('创作') || lowerPrompt.includes('写作') || 
      lowerPrompt.includes('故事') || lowerPrompt.includes('诗歌') ||
      lowerPrompt.includes('设计') || lowerPrompt.includes('创意')) {
    return 'creative';
  }
  
  // 分析类任务（需要逻辑推理）
  if (lowerPrompt.includes('分析') || lowerPrompt.includes('比较') || 
      lowerPrompt.includes('评估') || lowerPrompt.includes('推理') ||
      lowerPrompt.includes('解释') || lowerPrompt.includes('原因')) {
    return 'analytical';
  }
  
  // 结构化任务（需要格式化输出）
  if (lowerPrompt.includes('json') || lowerPrompt.includes('表格') || 
      lowerPrompt.includes('列表') || lowerPrompt.includes('格式') ||
      lowerPrompt.includes('结构化') || lowerPrompt.includes('提取')) {
    return 'structured';
  }
  
  // 默认为对话类
  return 'conversational';
}

// 根据任务类型获取模型策略
function getModelStrategy(taskType: string) {
  switch (taskType) {
    case 'creative':
      // 创意任务：优先使用高质量模型
      return [
        AVAILABLE_MODELS.find(m => m.name === 'anthropic/claude-3.5-sonnet')!,
        AVAILABLE_MODELS.find(m => m.name === 'openai/gpt-4o')!,
        AVAILABLE_MODELS.find(m => m.name === 'anthropic/claude-3-haiku')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-32b')!
      ].filter(Boolean);
      
    case 'analytical':
      // 分析任务：平衡质量和成本
      return [
        AVAILABLE_MODELS.find(m => m.name === 'anthropic/claude-3-haiku')!,
        AVAILABLE_MODELS.find(m => m.name === 'deepseek/deepseek-v3')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-32b')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-14b')!
      ].filter(Boolean);
      
    case 'structured':
      // 结构化任务：优先使用擅长格式化的模型
      return [
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-32b')!,
        AVAILABLE_MODELS.find(m => m.name === 'anthropic/claude-3-haiku')!,
        AVAILABLE_MODELS.find(m => m.name === 'deepseek/deepseek-v3')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-14b')!
      ].filter(Boolean);
      
    case 'conversational':
    default:
      // 对话任务：优先使用免费和低成本模型
      return [
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-14b')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-8b')!,
        AVAILABLE_MODELS.find(m => m.name === 'qwen/qwen-3-32b')!,
        AVAILABLE_MODELS.find(m => m.name === 'anthropic/claude-3-haiku')!
      ].filter(Boolean);
  }
} 