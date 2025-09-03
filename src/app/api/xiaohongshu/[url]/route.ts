import { NextRequest, NextResponse } from 'next/server';

interface XiaohongshuContent {
  title: string;
  content: string;
  images?: string[];
  location?: string;
  tags?: string[];
  author?: string;
}

// 模拟小红书内容抓取函数
async function extractXiaohongshuContent(url: string): Promise<XiaohongshuContent> {
  try {
    // 这里应该实现真实的爬虫逻辑
    // 为了演示，我们返回模拟数据
    
    // 简单解析URL，提取一些信息用于生成模拟内容
    const urlObj = new URL(url);
    const notePath = urlObj.pathname;
    
    // 模拟不同类型的小红书内容
    const mockContents = [
      {
        title: "京都樱花季完美3日游攻略🌸",
        content: `Day1: 抵达京都
📍 清水寺 - 早上8点就去，避开人群，樱花飞舞超美！
📍 二年坂三年坂 - 传统街道，买点纪念品
📍 金阁寺 - 下午光线最好，倒影超美

Day2: 岚山一日游  
📍 岚山竹林 - 绿意盎然，仿佛进入仙境
📍 天龙寺 - 庭院樱花配古建筑
📍 渡月桥 - 夕阳西下时分最美

Day3: 哲学之道
📍 银阁寺 - 幽静雅致
📍 哲学之道 - 樱花隧道，浪漫至极
📍 南禅寺 - 红叶季也很美

🏨 住宿推荐：京都站附近的酒店，交通便利
🍜 美食：一兰拉面、抹茶甜品、怀石料理
💰 预算：约8000-12000元/人（含机票）`,
        images: ['/images/japan-preview.png'],
        location: "京都, 日本",
        tags: ["樱花季", "京都旅游", "日本自由行", "古寺参观", "摄影打卡"],
        author: "旅行达人小美"
      },
      {
        title: "丽江古城深度游 | 慢时光里的文艺之旅✨",
        content: `在丽江待了一周，真的太舒服了！分享一下我的慢游路线～

🏮 Day1-2: 大研古城
- 四方街：古城的心脏，各种小店超有意思
- 木府：纳西族的紫禁城，建筑很壮观
- 酒吧街：晚上超热闹，但不要太晚回去

🗻 Day3-4: 玉龙雪山+蓝月谷
- 坐索道上山看雪景，记得带氧气瓶
- 蓝月谷的水真的是蒂芙尼蓝！
- 印象丽江演出值得一看

🌸 Day5-6: 束河古镇
- 比大研古城安静，适合发呆
- 茶马古道博物馆了解历史
- 青龙桥拍照超美

☕ 咖啡店推荐：
- 猫的天空之城：文艺青年必去
- 小锅巴纳西美食：当地特色菜
- 阿安酸奶：酸奶紫米露绝了

💡 Tips：
- 古城维护费80元要保留好票据
- 高原反应记得慢走
- 早晚温差大注意保暖`,
        images: [],
        location: "丽江, 云南",
        tags: ["丽江古城", "慢旅行", "文艺旅行", "雪山", "纳西文化"],
        author: "文艺女青年小雯"
      },
      {
        title: "新疆独库公路自驾 | 最美天路震撼之旅🏔️",
        content: `刚跑完独库公路，真的是此生必去的自驾路线！

🚗 路线规划（7天）：
Day1: 乌鲁木齐→乔尔玛 (住宿：乔尔玛酒店)
Day2: 乔尔玛→巴音布鲁克 (看九曲十八弯日落)
Day3: 巴音布鲁克→那拉提 (草原骑马)
Day4: 那拉提→伊宁 (薰衣草基地)
Day5: 伊宁→赛里木湖 (大西洋最后一滴眼泪)
Day6: 赛里木湖→克拉玛依
Day7: 克拉玛依→乌鲁木齐

🌟 必看景点：
- 天山神秘大峡谷：红色岩壁震撼
- 大小龙池：高山湖泊如翡翠
- 巴音布鲁克草原：中国最美湿地
- 那拉提空中草原：伊犁最美草原

🍖 美食推荐：
- 手抓饭、大盘鸡必须尝
- 烤包子、馕坑肉超香
- 马奶子、酸奶疙瘩很特别

⚠️ 注意事项：
- 6-10月通车，其他时间封路
- 全程限速，不要超速
- 加油要及时，服务区较少
- 高海拔地区注意高反`,
        images: [],
        location: "新疆",
        tags: ["独库公路", "自驾游", "新疆旅游", "草原", "天山"],
        author: "自驾达人阿力"
      },
      {
        title: "伦敦哈利波特主题深度游⚡️",
        content: `作为哈迷必须要分享这条完美路线！

🏰 Day1: 华纳兄弟工作室
- 提前预订！超级震撼的片场体验
- 霍格沃茨城堡模型太壮观了
- 可以喝到真正的黄油啤酒

🚂 Day2: 伦敦市区魔法地标
- 国王十字车站9¾站台 - 必须打卡！
- 伦敦动物园 - 哈利第一次与蛇对话的地方
- 千禧桥 - 《混血王子》中被摧毁的桥

🏛️ Day3: 牛津取景地
- 基督教会学院 - 霍格沃茨大厅原型
- 博德利图书馆 - 霍格沃茨图书馆
- 牛津大学各学院都超美

💡 小贴士：
- 记得买Oyster卡，交通更便宜
- 英式下午茶一定要试试
- 天气多变，记得带伞

真的是哈迷的天堂！每个场景都让人回想起电影情节 🥰`,
        images: ['/images/london-preview.png'],
        location: "伦敦, 英国",
        tags: ["哈利波特", "英国旅游", "电影取景地", "主题旅行", "牛津"],
        author: "哈迷小巫师"
      },
      {
        title: "成都美食3天2夜暴走攻略🌶️",
        content: `来成都怎么能不吃遍这些美食！

🔥 Day1: 春熙路+太古里
早餐：龙抄手 - 经典老店，皮薄馅大
午餐：陈麻婆豆腐 - 正宗川菜必尝
下午茶：鹤鸣茶社 - 人民公园里喝茶摆龙门阵
晚餐：大龙燚火锅 - 麻辣鲜香，排队也值得

🐼 Day2: 宽窄巷子+锦里
早餐：贺记蛋烘糕 - 成都特色小食
午餐：小谭豆花 - 嫩滑豆花配酥肉
下午：看大熊猫！萌到化了
晚餐：锦里小吃一条街 - 三大炮、糖油果子

🌶️ Day3: 建设路+电子科大
早餐：严太婆锅盔 - 外酥内软，配稀饭绝了
午餐：建设路小吃街 - 冒菜、串串、兔头
晚餐：玉林串串香 - 成都人都爱的宵夜

必买特产：
- 郫县豆瓣酱
- 灯影牛肉丝  
- 张飞牛肉

成都，一座来了就不想走的城市！`,
        images: [],
        location: "成都, 四川",
        tags: ["成都美食", "川菜", "火锅", "串串香", "大熊猫"],
        author: "成都吃货小分队"
      }
    ];
    
    // 随机选择一个模拟内容，或根据URL特征选择
    const randomIndex = Math.floor(Math.random() * mockContents.length);
    return mockContents[randomIndex];
    
  } catch (error) {
    console.error('抓取小红书内容失败:', error);
    throw new Error('无法抓取内容，请检查链接是否正确');
  }
}

// 将抓取的内容转换为适合AI的prompt
function convertToTravelPrompt(content: XiaohongshuContent): string {
  let prompt = `基于以下小红书内容，为我生成详细的旅行攻略：

📝 **原内容标题**: ${content.title}

📍 **目的地**: ${content.location || '未指定'}

🎯 **内容摘要**:
${content.content}

🏷️ **相关标签**: ${content.tags?.join(', ') || '无'}

📋 **请基于以上内容，为我制定详细的旅行计划**，包括：
- 行程安排建议
- 景点详细信息  
- 交通路线规划
- 美食餐厅推荐
- 住宿建议
- 预算估算
- 实用出行贴士

请确保推荐的地点都有准确的地理坐标，方便在地图上标注。`;

  return prompt;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  try {
    // 解码URL参数
    const decodedUrl = decodeURIComponent(params.url);
    
    // 验证是否为小红书链接
    if (!decodedUrl.includes('xiaohongshu.com') && !decodedUrl.includes('xhslink.com')) {
      return NextResponse.json(
        { error: '请提供有效的小红书链接' },
        { status: 400 }
      );
    }

    // 抓取小红书内容
    const extractedContent = await extractXiaohongshuContent(decodedUrl);
    
    // 转换为旅行提示词
    const travelPrompt = convertToTravelPrompt(extractedContent);
    
    return NextResponse.json({
      success: true,
      data: {
        originalContent: extractedContent,
        travelPrompt: travelPrompt,
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'xiaohongshu',
          url: decodedUrl
        }
      }
    });

  } catch (error) {
    console.error('处理小红书链接失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '抓取失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: '请提供小红书链接' },
        { status: 400 }
      );
    }

    // 验证是否为小红书链接
    if (!url.includes('xiaohongshu.com') && !url.includes('xhslink.com')) {
      return NextResponse.json(
        { error: '请提供有效的小红书链接' },
        { status: 400 }
      );
    }

    // 抓取小红书内容
    const extractedContent = await extractXiaohongshuContent(url);
    
    // 转换为旅行提示词
    const travelPrompt = convertToTravelPrompt(extractedContent);
    
    return NextResponse.json({
      success: true,
      data: {
        originalContent: extractedContent,
        travelPrompt: travelPrompt,
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'xiaohongshu',
          url: url
        }
      }
    });

  } catch (error) {
    console.error('处理小红书链接失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '抓取失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
