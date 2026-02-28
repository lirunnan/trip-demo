# Python Terminal Command API

一个可以通过HTTP接口调用终端命令的Python后端项目。

## 功能特性

- 通过POST接口执行终端命令
- 支持命令超时设置
- 支持指定工作目录
- 返回命令执行结果（stdout、stderr、返回码）
- 健康检查接口

## 项目结构

```
python-backend/
├── app/
│   ├── __init__.py
│   └── command_api.py     # 主要API逻辑
├── main.py               # 应用启动入口
├── requirements.txt      # 依赖包
└── venv/                # 虚拟环境
```

## 安装和运行

1. 激活虚拟环境：
```bash
cd python-backend
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 启动服务：
```bash
python main.py
```

服务将在 http://localhost:8000 启动

## API接口

### 1. 执行命令
- **URL**: `POST /execute`
- **请求体**:
```json
{
  "command": "ls -la",
  "timeout": 30,           // 可选，默认30秒
  "working_directory": "/path/to/dir"  // 可选
}
```

- **响应**:
```json
{
  "command": "ls -la",
  "stdout": "文件列表...",
  "stderr": "错误信息（如果有）",
  "return_code": 0,
  "success": true
}
```

### 2. 健康检查
- **URL**: `GET /health`
- **响应**: `{"status": "healthy"}`

### 3. 根路径
- **URL**: `GET /`
- **响应**: `{"message": "Terminal Command API is running"}`

## API文档

启动服务后，访问以下地址查看自动生成的API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 安全注意事项

⚠️ **警告**: 此API允许执行任意命令，在生产环境中使用时请注意安全性：
- 建议添加身份验证
- 限制可执行的命令
- 在隔离的环境中运行
- 定期审核命令执行日志