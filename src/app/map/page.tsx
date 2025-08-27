'use client'

import dynamic from 'next/dynamic'

const BaiduMap = dynamic(
  () => import('./BaiduMap'),
  { ssr: false }
)

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题区域 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">行程地图</h1>
          <p className="mt-2 text-gray-600">查看完整的旅行路线和景点分布</p>
        </div>
      </div>

      {/* 地图容器 */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div style={{ height: '500px' }}>
            <BaiduMap 
              className="w-full h-full"
              style={{}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}