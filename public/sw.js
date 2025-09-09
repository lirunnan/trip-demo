// Service Worker for handling /saved-page/[id] routes
const CACHE_NAME = 'trip-demo-pages-v1'

// 打开IndexedDB
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TripDemoStorage', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('htmlPages')) {
        const store = db.createObjectStore('htmlPages', { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('guideId', 'guideId', { unique: false })
      }
    }
  })
}

// 从IndexedDB获取HTML页面
async function getHTMLFromIndexedDB(id) {
  try {
    const db = await openIndexedDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['htmlPages'], 'readonly')
      const store = transaction.objectStore('htmlPages')
      const request = store.get(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  } catch (error) {
    console.error('从IndexedDB获取HTML页面失败:', error)
    return null
  }
}

// 处理保存页面请求
async function handleSavedPageRequest(url) {
  const urlPath = new URL(url).pathname
  const match = urlPath.match(/\/saved-page\/(.+)/)
  
  if (!match) {
    return new Response('页面不存在', { 
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
  
  const pageId = match[1]
  console.log('尝试获取保存的页面:', pageId)
  
  try {
    const pageData = await getHTMLFromIndexedDB(pageId)
    
    if (pageData && pageData.html) {
      console.log('✅ 从IndexedDB找到页面:', pageId)
      
      return new Response(pageData.html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } else {
      console.warn('⚠️ 在IndexedDB中未找到页面:', pageId)
      
      // 返回404页面
      const notFoundHTML = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>页面未找到</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; margin-bottom: 2rem; }
            a {
              color: #ffd700;
              text-decoration: none;
              font-weight: 600;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>抱歉，找不到您要访问的旅游攻略页面</p>
            <p>页面ID: ${pageId}</p>
            <a href="/">返回首页</a>
          </div>
        </body>
        </html>
      `
      
      return new Response(notFoundHTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    }
  } catch (error) {
    console.error('获取保存页面时出错:', error)
    
    // 返回错误页面
    const errorHTML = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>页面加载错误</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 { font-size: 3rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; margin-bottom: 2rem; }
          a {
            color: #ffd700;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌</h1>
          <p>页面加载时出现错误</p>
          <p>请稍后重试或联系技术支持</p>
          <a href="/">返回首页</a>
        </div>
      </body>
      </html>
    `
    
    return new Response(errorHTML, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    })
  }
}

// Service Worker事件监听
self.addEventListener('install', event => {
  console.log('✅ Service Worker 安装成功')
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log('✅ Service Worker 激活成功')
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', event => {
  const url = event.request.url
  
  // 只处理 /saved-page/ 路由
  if (url.includes('/saved-page/')) {
    event.respondWith(handleSavedPageRequest(url))
  }
  // 其他请求直接通过
  else {
    return
  }
})

console.log('🔄 Service Worker 脚本已加载')