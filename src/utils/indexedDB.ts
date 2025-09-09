// IndexedDB 存储工具
const DB_NAME = 'TripDemoStorage'
const DB_VERSION = 1
const STORE_NAME = 'htmlPages'

export interface StoredHTMLPage {
  id: string
  title: string
  html: string
  createdAt: string
  guideId?: string
}

class IndexedDBManager {
  private db: IDBDatabase | null = null

  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('guideId', 'guideId', { unique: false })
        }
      }
    })
  }

  async saveHTMLPage(pageData: StoredHTMLPage): Promise<void> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(pageData)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        console.log('✅ HTML页面保存到IndexedDB成功:', pageData.id)
        resolve()
      }
    })
  }

  async getHTMLPage(id: string): Promise<StoredHTMLPage | null> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        resolve(request.result || null)
      }
    })
  }

  async getAllPages(): Promise<StoredHTMLPage[]> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  async deletePage(id: string): Promise<void> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        console.log('✅ HTML页面从IndexedDB删除成功:', id)
        resolve()
      }
    })
  }
}

// 导出单例实例
export const indexedDBManager = new IndexedDBManager()

// 保存到静态文件的接口
export interface ShareToStaticResult {
  success: boolean
  shareUrl?: string
  error?: string
}

// 将IndexedDB中的HTML页面保存为静态文件
export const saveAsStaticFile = async (pageId: string): Promise<ShareToStaticResult> => {
  try {
    // 从IndexedDB获取页面数据
    const pageData = await indexedDBManager.getHTMLPage(pageId)
    if (!pageData) {
      return { success: false, error: '页面不存在' }
    }

    // 调用静态文件保存API
    const response = await fetch('/api/save-static', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: pageData.id,
        title: pageData.title,
        html: pageData.html,
        createdAt: pageData.createdAt
      })
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ 静态文件保存成功:', result.data.shareUrl)
      return {
        success: true,
        shareUrl: result.data.shareUrl
      }
    } else {
      console.error('❌ 静态文件保存失败:', result.error)
      return {
        success: false,
        error: result.error
      }
    }

  } catch (error) {
    console.error('❌ 保存静态文件时发生错误:', error)
    return {
      success: false,
      error: '网络错误，请稍后重试'
    }
  }
}

// 获取所有已保存的静态文件列表
export const getStaticFilesList = async () => {
  try {
    const response = await fetch('/api/save-static', {
      method: 'GET'
    })
    const result = await response.json()
    return result.success ? result.files : []
  } catch (error) {
    console.error('❌ 获取静态文件列表失败:', error)
    return []
  }
}

// 浏览器环境检查和初始化
export const initIndexedDB = async () => {
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      await indexedDBManager.initDB()
      console.log('✅ IndexedDB初始化成功')
      return true
    } catch (error) {
      console.error('❌ IndexedDB初始化失败:', error)
      return false
    }
  }
  return false
}