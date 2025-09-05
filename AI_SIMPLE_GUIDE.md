# 🚀 AI模型调用 - 快速指南

## 核心函数

从 `@/utils/openrouter` 导入以下函数：

```typescript
import { callAI, callAIWithAutoModel } from '@/utils/openrouter';
```

## 基础调用

```typescript
// 最简单的调用
const response = await callAI({
  prompt: '你的问题或需求'
});

if (response.success) {
  console.log(response.data?.content); // AI的回复
} else {
  console.log(response.error); // 错误信息
}
```

## 智能调用（推荐）

```typescript
// 系统会自动选择最合适的模型
const response = await callAIWithAutoModel({
  prompt: '你的问题或需求'
});
```

## 常用参数

```typescript
const response = await callAI({
  prompt: '你的问题',
  systemPrompt: '你是专业助手', // 可选：系统角色
  model: 'qwen/qwen-3-14b',     // 可选：指定模型
  responseFormat: 'json',       // 可选：'text' 或 'json'
  temperature: 0.7              // 可选：0-1，控制创造性
});
```

## 就这样，直接用就行！ 🎉 


# 🎯 OpenRouter模型选择指南

## 📋 可选择的模型

### 🆓 免费模型（推荐测试）
- **Qwen3-8B** - 中文支持好，完全免费
- **Qwen3-14B** - 性能更强，完全免费  
- **Qwen3-235B** - 大模型，完全免费

### 💰 低成本模型
- **Qwen3-32B** - $0.018/1K tokens，性价比高
- **DeepSeek-V3** - $0.30/1K tokens，推理能力强

### 🏆 高质量模型
- **Claude-3-Haiku** - $0.25/1K tokens，快速响应
- **Claude-3.5-Sonnet** - $3.0/1K tokens，最高质量
- **GPT-4o** - $2.5/1K tokens，综合能力强

## 🔧 如何选择模型

### 方法1: 环境变量指定（推荐）

编辑 `.env.local` 文件：

```bash
# OpenRouter API配置
OPENROUTER_API_KEY=sk-or-v1-你的密钥

# 指定首选模型
OPENROUTER_PREFERRED_MODEL=anthropic/claude-3.5-sonnet

# 开发环境配置
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3030
```

### 方法2: 代码中直接调用

```typescript
import { analyzeWithSpecificModel } from '@/utils/openrouter';

// 使用Claude-3.5-Sonnet
const result = await analyzeWithSpecificModel(content, url, 'anthropic/claude-3.5-sonnet');

// 使用免费的Qwen3-14B
const result = await analyzeWithSpecificModel(content, url, 'qwen/qwen-3-14b');
```

## 💡 模型选择建议

### 🧪 开发测试阶段
```bash
OPENROUTER_PREFERRED_MODEL=qwen/qwen-3-14b
```
- 完全免费
- 中文支持好
- 性能足够测试使用

### 🚀 生产环境
```bash
OPENROUTER_PREFERRED_MODEL=anthropic/claude-3.5-sonnet
```
- 最高质量分析
- 完美的JSON输出
- 优秀的中文理解

### 💰 成本敏感
```bash
OPENROUTER_PREFERRED_MODEL=qwen/qwen-3-32b
```
- 超低成本 $0.018/1K tokens
- 性能优秀
- 中文支持好

## 🔄 自动降级机制

如果不指定模型，系统会自动按成本从低到高尝试：

1. Qwen3-8B (免费)
2. Qwen3-14B (免费)  
3. Qwen3-32B (低成本)
4. Claude-3-Haiku (中等)
5. Claude-3.5-Sonnet (最高质量)

## 🚀 快速开始

1. **注册OpenRouter** → https://openrouter.ai/
2. **获取API密钥** → 在Keys页面创建
3. **配置环境变量**：
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-你的密钥
   OPENROUTER_PREFERRED_MODEL=anthropic/claude-3.5-sonnet
   ```
4. **重启应用测试**

---

**现在您可以自由选择最适合的模型！** 🌟 