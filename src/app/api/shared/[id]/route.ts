import { NextRequest, NextResponse } from 'next/server'

interface SharedItineraryData {
  id: string
  title: string
  html: string
  createdAt: string
}

// Mock数据，模拟服务端返回的HTML内容
const mockSharedData: Record<string, SharedItineraryData> = {
  '1': {
    id: '1',
    title: '北京3日游',
    createdAt: '2024-01-15T08:00:00.000Z',
    html: `
      <div class="shared-content">
        <div class="header-section">
          <h1 class="main-title">北京3日游</h1>
          <div class="trip-stats">
            <span class="stat-item">3天行程</span>
            <span class="stat-item">8个景点</span>
            <span class="stat-item">经典路线</span>
          </div>
        </div>
        
        <div class="itinerary-section">
          <div class="day-card">
            <h2 class="day-title">第1天 - 故宫·天安门</h2>
            <div class="locations">
              <div class="location-item">
                <h3>天安门广场</h3>
                <p>感受首都的庄严与雄伟，观看升国旗仪式</p>
                <span class="time">08:00 - 10:00 • 2小时</span>
              </div>
              <div class="location-item">
                <h3>故宫博物院</h3>
                <p>明清两朝的皇家宫殿，中华文明的瑰宝</p>
                <span class="time">10:30 - 15:00 • 4.5小时</span>
              </div>
              <div class="location-item">
                <h3>王府井大街</h3>
                <p>繁华的商业街，品尝北京特色小吃</p>
                <span class="time">15:30 - 18:00 • 2.5小时</span>
              </div>
            </div>
          </div>
          
          <div class="day-card">
            <h2 class="day-title">第2天 - 长城·明十三陵</h2>
            <div class="locations">
              <div class="location-item">
                <h3>八达岭长城</h3>
                <p>不到长城非好汉，体验中华民族的伟大工程</p>
                <span class="time">08:00 - 12:00 • 4小时</span>
              </div>
              <div class="location-item">
                <h3>明十三陵</h3>
                <p>明朝皇帝陵墓群，感受帝王陵寝的庄重</p>
                <span class="time">14:00 - 16:30 • 2.5小时</span>
              </div>
            </div>
          </div>
          
          <div class="day-card">
            <h2 class="day-title">第3天 - 颐和园·圆明园</h2>
            <div class="locations">
              <div class="location-item">
                <h3>颐和园</h3>
                <p>清朝皇家园林，山水园林艺术的杰作</p>
                <span class="time">09:00 - 13:00 • 4小时</span>
              </div>
              <div class="location-item">
                <h3>圆明园遗址公园</h3>
                <p>万园之园的残垣断壁，历史的见证</p>
                <span class="time">14:30 - 17:00 • 2.5小时</span>
              </div>
              <div class="location-item">
                <h3>北京大学</h3>
                <p>中国顶尖学府，感受浓厚的学术氛围</p>
                <span class="time">17:30 - 19:00 • 1.5小时</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tips-section">
          <h2>旅行贴士</h2>
          <ul>
            <li>建议提前预约故宫门票，避免现场排队</li>
            <li>长城路程较远，建议早出发</li>
            <li>颐和园较大，合理安排游览时间</li>
            <li>注意保暖，北京昼夜温差较大</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <p>由 <strong>行呗AI旅游助手</strong> 精心规划</p>
          <p>生成时间：2024年1月15日</p>
        </div>
        
        <style>
          .shared-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
          }
          
          .main-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .trip-stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .stat-item {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
          }
          
          .day-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
          
          .day-title {
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .location-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .location-item:last-child {
            margin-bottom: 0;
          }
          
          .location-item h3 {
            color: #1f2937;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .location-item p {
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .time {
            color: #3b82f6;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .tips-section {
            background: #fffbeb;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #f59e0b;
          }
          
          .tips-section h2 {
            color: #f59e0b;
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .tips-section ul {
            list-style: none;
            padding: 0;
          }
          
          .tips-section li {
            padding: 8px 0;
            position: relative;
            padding-left: 20px;
            color: #92400e;
          }
          
          .tips-section li:before {
            content: "💡";
            position: absolute;
            left: 0;
          }
          
          .footer-section {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
          }
          
          .footer-section strong {
            color: #3b82f6;
          }
          
          @media (max-width: 768px) {
            .shared-content {
              padding: 15px;
            }
            
            .main-title {
              font-size: 2rem;
            }
            
            .trip-stats {
              gap: 10px;
            }
            
            .day-card {
              padding: 20px;
            }
          }
        </style>
      </div>
    `
  },
  '2': {
    id: '2',
    title: '上海2日游',
    createdAt: '2024-01-16T10:30:00.000Z',
    html: `
      <div class="shared-content">
        <div class="header-section">
          <h1 class="main-title">上海2日游</h1>
          <div class="trip-stats">
            <span class="stat-item">2天行程</span>
            <span class="stat-item">6个景点</span>
            <span class="stat-item">都市风情</span>
          </div>
        </div>
        
        <div class="itinerary-section">
          <div class="day-card">
            <h2 class="day-title">第1天 - 外滩·南京路</h2>
            <div class="locations">
              <div class="location-item">
                <h3>外滩</h3>
                <p>上海的标志性景观，欣赏黄浦江两岸风光</p>
                <span class="time">09:00 - 11:00 • 2小时</span>
              </div>
              <div class="location-item">
                <h3>南京路步行街</h3>
                <p>中华商业第一街，购物美食的天堂</p>
                <span class="time">11:30 - 15:00 • 3.5小时</span>
              </div>
              <div class="location-item">
                <h3>豫园</h3>
                <p>江南古典园林，体验传统文化</p>
                <span class="time">15:30 - 18:00 • 2.5小时</span>
              </div>
            </div>
          </div>
          
          <div class="day-card">
            <h2 class="day-title">第2天 - 陆家嘴·世博园</h2>
            <div class="locations">
              <div class="location-item">
                <h3>东方明珠塔</h3>
                <p>上海地标建筑，俯瞰整个上海滩</p>
                <span class="time">09:00 - 11:30 • 2.5小时</span>
              </div>
              <div class="location-item">
                <h3>上海中心大厦</h3>
                <p>中国第一高楼，云端观景体验</p>
                <span class="time">12:00 - 14:00 • 2小时</span>
              </div>
              <div class="location-item">
                <h3>中华艺术宫</h3>
                <p>原世博会中国馆，艺术文化殿堂</p>
                <span class="time">15:00 - 17:30 • 2.5小时</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tips-section">
          <h2>旅行贴士</h2>
          <ul>
            <li>外滩最佳观景时间为傍晚时分</li>
            <li>东方明珠塔建议提前购买门票</li>
            <li>豫园周边小笼包不容错过</li>
            <li>地铁出行便利，推荐购买交通卡</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <p>由 <strong>行呗AI旅游助手</strong> 精心规划</p>
          <p>生成时间：2024年1月16日</p>
        </div>
        
        <style>
          .shared-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            color: white;
            border-radius: 12px;
          }
          
          .main-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .trip-stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .stat-item {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
          }
          
          .day-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
          
          .day-title {
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .location-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #ff6b6b;
          }
          
          .location-item:last-child {
            margin-bottom: 0;
          }
          
          .location-item h3 {
            color: #1f2937;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .location-item p {
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .time {
            color: #ff6b6b;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .tips-section {
            background: #fff1f2;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #ff6b6b;
          }
          
          .tips-section h2 {
            color: #dc2626;
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .tips-section ul {
            list-style: none;
            padding: 0;
          }
          
          .tips-section li {
            padding: 8px 0;
            position: relative;
            padding-left: 20px;
            color: #991b1b;
          }
          
          .tips-section li:before {
            content: "🌟";
            position: absolute;
            left: 0;
          }
          
          .footer-section {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
          }
          
          .footer-section strong {
            color: #ff6b6b;
          }
          
          @media (max-width: 768px) {
            .shared-content {
              padding: 15px;
            }
            
            .main-title {
              font-size: 2rem;
            }
            
            .trip-stats {
              gap: 10px;
            }
            
            .day-card {
              padding: 20px;
            }
          }
        </style>
      </div>
    `
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 检查是否为预设的mock数据
    const sharedData = mockSharedData[id]
    
    if (!sharedData) {
      return NextResponse.json(
        { error: '分享内容不存在或已过期' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: sharedData
    })
    
  } catch (error) {
    console.error('获取分享内容失败:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 处理创建新的服务端渲染内容
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, itinerary } = body
    
    // 生成HTML内容
    const html = generateHTMLFromItinerary(title, itinerary)
    
    const newData: SharedItineraryData = {
      id,
      title,
      html,
      createdAt: new Date().toISOString()
    }
    
    // 在实际应用中，这里会保存到数据库
    // 这里我们暂时添加到mock数据中
    mockSharedData[id] = newData
    
    return NextResponse.json({
      success: true,
      data: newData
    })
    
  } catch (error) {
    console.error('创建分享内容失败:', error)
    return NextResponse.json(
      { error: '创建失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 生成HTML内容的辅助函数
function generateHTMLFromItinerary(title: string, itinerary: any[]): string {
  const totalDays = itinerary.length
  const totalAttractions = itinerary.reduce((total: number, day: any) => total + day.locations.length, 0)
  
  const daysHtml = itinerary.map((day: any, dayIndex: number) => `
    <div class="day-card">
      <h2 class="day-title">第${day.day}天 - ${day.date}</h2>
      <div class="locations">
        ${day.locations.map((location: any) => `
          <div class="location-item">
            <h3>${location.name}</h3>
            <p>${location.description}</p>
            <span class="time">${location.duration} • ${location.type}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')

  return `
    <div class="shared-content">
      <div class="header-section">
        <h1 class="main-title">${title}</h1>
        <div class="trip-stats">
          <span class="stat-item">${totalDays}天行程</span>
          <span class="stat-item">${totalAttractions}个景点</span>
          <span class="stat-item">AI定制</span>
        </div>
      </div>
      
      <div class="itinerary-section">
        ${daysHtml}
      </div>
      
      <div class="tips-section">
        <h2>旅行贴士</h2>
        <ul>
          <li>建议提前预订门票，避免现场排队</li>
          <li>注意天气变化，随身携带雨具</li>
          <li>保持手机电量，随时导航</li>
          <li>尊重当地文化和习俗</li>
        </ul>
      </div>
      
      <div class="footer-section">
        <p>由 <strong>行呗AI旅游助手</strong> 精心规划</p>
        <p>生成时间：${new Date().toLocaleDateString('zh-CN')}</p>
      </div>
      
      <style>
        .shared-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px 20px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border-radius: 12px;
        }
        
        .main-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .trip-stats {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }
        
        .day-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }
        
        .day-title {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .location-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #4f46e5;
        }
        
        .location-item:last-child {
          margin-bottom: 0;
        }
        
        .location-item h3 {
          color: #1f2937;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .location-item p {
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .time {
          color: #4f46e5;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .tips-section {
          background: #f0f9ff;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 1px solid #0284c7;
        }
        
        .tips-section h2 {
          color: #0284c7;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .tips-section ul {
          list-style: none;
          padding: 0;
        }
        
        .tips-section li {
          padding: 8px 0;
          position: relative;
          padding-left: 20px;
          color: #0369a1;
        }
        
        .tips-section li:before {
          content: "💡";
          position: absolute;
          left: 0;
        }
        
        .footer-section {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 0.9rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 30px;
        }
        
        .footer-section strong {
          color: #4f46e5;
        }
        
        @media (max-width: 768px) {
          .shared-content {
            padding: 15px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .trip-stats {
            gap: 10px;
          }
          
          .day-card {
            padding: 20px;
          }
        }
      </style>
    </div>
  `
}