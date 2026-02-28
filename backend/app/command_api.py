import subprocess
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Terminal Command API", version="1.0.0")

class CommandRequest(BaseModel):
    command: str
    timeout: Optional[int] = 30
    working_directory: Optional[str] = None

class CommandResponse(BaseModel):
    command: str
    stdout: str
    stderr: str
    return_code: int
    success: bool

class ClaudePlanRequest(BaseModel):
    project_path: Optional[str] = None
    timeout: Optional[int] = 6000000

@app.get("/")
async def root():
    return {"message": "Terminal Command API is running"}

@app.post("/execute", response_model=CommandResponse)
async def execute_command(request: CommandRequest):
    """
    执行终端命令并返回结果
    """
    try:
        # 执行命令
        result = subprocess.run(
            request.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=request.timeout,
            cwd=request.working_directory
        )
        
        # 构建响应
        response = CommandResponse(
            command=request.command,
            stdout=result.stdout,
            stderr=result.stderr,
            return_code=result.returncode,
            success=result.returncode == 0
        )
        
        return response
        
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail=f"Command timed out after {request.timeout} seconds"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing command: {str(e)}"
        )

@app.post("/claude-plan", response_model=CommandResponse)
async def execute_claude_plan(request: ClaudePlanRequest):
    """
    执行 claude -p 命令进行项目规划
    """
    try:
        # 构建 claude -p 命令
        command = "claude -p"
        
        # 执行命令
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=request.timeout,
            cwd=request.project_path
        )
        
        # 构建响应
        response = CommandResponse(
            command=command,
            stdout=result.stdout,
            stderr=result.stderr,
            return_code=result.returncode,
            success=result.returncode == 0
        )
        
        return response
        
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail=f"Claude plan command timed out after {request.timeout} seconds"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing claude plan: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)