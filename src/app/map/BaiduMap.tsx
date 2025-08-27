'use client'

import { useEffect, useRef } from 'react'

interface BaiduMapProps {
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}

const BaiduMap = ({ className, style, ...props }: BaiduMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // 防止重复加载和 SSR
    if (typeof window === 'undefined' || !(window as any).BMap) {
      return
    }

    // 如果地图已经初始化，则不再初始化
    if (mapInstanceRef.current) return

    const BMap = (window as any).BMap
    console.log(BMap)
    
    // 初始化地图
    const map = new BMap.Map(mapRef.current)
    console.log(map)
    // 创建一个中心点坐标（示例：北京天安门）
    const point = new BMap.Point(116.404, 39.915)
    // 初始化地图，设置中心点坐标和缩放级别
    map.centerAndZoom(point, 15)
    // 启用鼠标滚轮缩放
    map.enableScrollWheelZoom(true)

    // 可选：添加一个标记
    const marker = new BMap.Marker(point)
    map.addOverlay(marker)

    // 将地图实例保存到 ref
    mapInstanceRef.current = map

    // 清理函数：组件卸载时销毁地图
    return () => {
      if (mapInstanceRef.current) {
        // 百度地图没有destroy方法，只需要清空引用
        mapInstanceRef.current = null
      }
    }
  }, [])
  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      {...props}
    />
  )
}

export default BaiduMap