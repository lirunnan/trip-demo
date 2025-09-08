import { NextRequest, NextResponse } from 'next/server';

const TARGET_URL = 'http://101.32.77.73:8085/api/conversations';

// 重试函数
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 10秒超时
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw new Error('All retry attempts failed');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Proxying request to:', TARGET_URL);
    console.log('Request body:', body);
    
    const response = await fetchWithRetry(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Proxy/1.0',
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Backend request failed', 
          status: response.status,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    // 处理不同类型的错误
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout', 
            message: 'The backend server is taking too long to respond. Please try again later.',
            code: 'TIMEOUT'
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            error: 'Connection failed', 
            message: 'Unable to connect to the backend server. Please check if the server is running.',
            code: 'CONNECTION_ERROR'
          },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: 'An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROXY_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Proxying GET request to:', TARGET_URL);
    
    // 从URL参数中获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = queryString ? `${TARGET_URL}?${queryString}` : TARGET_URL;
    
    const response = await fetchWithRetry(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Proxy/1.0',
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Backend request failed', 
          status: response.status,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    // 处理不同类型的错误
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout', 
            message: 'The backend server is taking too long to respond. Please try again later.',
            code: 'TIMEOUT'
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            error: 'Connection failed', 
            message: 'Unable to connect to the backend server. Please check if the server is running.',
            code: 'CONNECTION_ERROR'
          },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: 'An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROXY_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}