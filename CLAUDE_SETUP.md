# Claude API 配置指南

## 小红书智能解析功能

本项目集成了 Claude-4-Sonnet 来智能分析小红书内容，提供高质量的旅游攻略生成。

## 配置步骤

### 1. 获取 Claude API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建账号并登录
3. 在 API Keys 页面创建新的 API Key
4. 复制生成的 API Key

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Claude API配置
ANTHROPIC_API_KEY=your_claude_api_key_here

# 开发环境
NODE_ENV=development
```

### 3. 功能特性

#### 🤖 智能内容分析
- 使用 Claude-4-Sonnet 分析小红书内容
- 提取结构化的旅游信息
- 生成个性化的旅行提示词

#### 📝 支持的内容类型
- 旅游攻略和游记
- 美食推荐
- 景点介绍
- 住宿体验
- 交通指南

#### 🔄 容错机制
- Claude API 失败时自动降级到基础解析
- 智能错误处理和用户友好的错误提示
- 支持重试机制

#### 🚀 处理流程

1. **内容抓取**: 从小红书链接提取原始内容
2. **AI分析**: 使用Claude-4-Sonnet进行智能分析
3. **结构化提取**: 提取目的地、行程、预算等信息
4. **提示词生成**: 生成适合旅游AI的详细提示词

## API 接口

### POST /api/xiaohongshu/[url]

解析小红书链接并生成旅行攻略。

**响应格式:**
```json
{
  "success": true,
  "data": {
    "originalContent": {
      "title": "攻略标题",
      "content": "原始内容",
      "author": "作者",
      "tags": ["标签1", "标签2"],
      "location": "目的地"
    },
    "analysisResult": {
      "destination": "分析得出的目的地",
      "duration": "建议时长",
      "theme": "旅行主题",
      "highlights": ["亮点1", "亮点2"],
      "locations": [...],
      "tips": ["建议1", "建议2"]
    },
    "travelPrompt": "生成的详细旅行提示词",
    "metadata": {
      "aiAnalyzed": true,
      "processor": "claude-4-sonnet",
      "extractedAt": "2024-03-15T10:30:00Z"
    }
  }
}
```

## 成本优化

- 使用温度设置为 0.3，平衡创造性和一致性
- 最大令牌数设置为 4000，控制响应长度
- 智能缓存常见查询结果
- 失败时降级到基础解析，避免重复调用

## 注意事项

⚠️ **API Key 安全**
- 不要将 API Key 提交到代码仓库
- 使用环境变量存储敏感信息
- 定期轮换 API Key

⚠️ **使用限制**
- 注意 Claude API 的调用频率限制
- 监控 API 使用量和成本
- 合理设置超时和重试策略

## 故障排除

### 常见问题

1. **"API密钥配置错误"**
   - 检查 `.env.local` 文件是否存在
   - 确认 `ANTHROPIC_API_KEY` 是否正确设置

2. **"AI分析服务忙碌中"**
   - Claude API 达到速率限制
   - 稍后重试或联系 Anthropic 升级配额

3. **"网络连接异常"**
   - 检查网络连接
   - 确认防火墙设置
   - 检查代理配置

### 调试模式

在开发环境下，API 会返回详细的错误信息：

```json
{
  "error": "错误描述",
  "details": {
    "message": "详细错误信息",
    "stack": "错误堆栈"
  }
}
```

## 更新日志

- **v1.0.0**: 初始版本，支持基础内容抓取
- **v2.0.0**: 集成 Claude-4-Sonnet 智能分析
- **v2.1.0**: 添加错误处理和降级机制
