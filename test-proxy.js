// 测试代理API的简单脚本
const testProxy = async () => {
  try {
    console.log('Testing proxy API...');
    
    const response = await fetch('http://localhost:3000/api/proxy/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: 'test-' + Date.now(),
        query: 'Hello, this is a test message'
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Proxy is working correctly!');
    } else {
      console.log('❌ Proxy returned an error:', data.error || data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProxy();