// 小红书内容抓取工具 - 真实抓取版本
import * as cheerio from 'cheerio';

export interface XiaohongshuContent {
  title: string;
  content: string;
  images?: string[];
  author?: string;
  publishTime?: string;
  tags?: string[];
  location?: string;
}

/**
 * 从小红书URL中提取内容ID
 */
export function extractContentId(url: string): string | null {
  try {
    // 匹配不同格式的小红书链接
    const patterns = [
      /xiaohongshu\.com\/explore\/([a-zA-Z0-9]+)/,
      /xiaohongshu\.com\/discovery\/item\/([a-zA-Z0-9]+)/,
      /xhslink\.com\/([a-zA-Z0-9]+)/,
      /xhs\.cn\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.error('提取内容ID失败:', error);
    return null;
  }
}

/**
 * 验证小红书URL格式
 */
export function validateXiaohongshuUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  const validDomains = [
    'xiaohongshu.com',
    'xhslink.com',
    'xhs.cn'
  ];
  
  return validDomains.some(domain => url.includes(domain));
}

/**
 * 解析HTML内容，提取小红书笔记信息
 */
function parseXiaohongshuHTML(html: string, url: string): XiaohongshuContent {
  const $ = cheerio.load(html);
  
  console.log('🔍 [解析] 开始解析HTML内容...');
  
  // 尝试多种选择器提取标题
  let title = '';
  const titleSelectors = [
    'title',
    'h1',
    '[data-testid="title"]',
    '.note-item-title',
    '.title',
    'meta[property="og:title"]'
  ];
  
  for (const selector of titleSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      title = element.attr('content') || element.text().trim();
      if (title && title.length > 0) {
        console.log(`✅ [解析] 找到标题 (${selector}):`, title.substring(0, 50));
        break;
      }
    }
  }
  
  // 尝试多种选择器提取内容
  let content = '';
  const contentSelectors = [
    '.note-item-desc',
    '.content',
    '.desc',
    '[data-testid="content"]',
    'meta[property="og:description"]',
    'meta[name="description"]',
    'p'
  ];
  
  for (const selector of contentSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      if (selector.startsWith('meta')) {
        content = elements.attr('content') || '';
      } else {
        content = elements.map((_, el) => $(el).text().trim()).get().join('\n');
      }
      if (content && content.length > 10) {
        console.log(`✅ [解析] 找到内容 (${selector}):`, content.substring(0, 100));
        break;
      }
    }
  }
  
  // 提取图片
  const images: string[] = [];
  const imageSelectors = [
    'img[src*="ci.xiaohongshu.com"]',
    'img[src*="sns-img"]',
    '.note-item-image img',
    '.image-container img',
    'img'
  ];
  
  for (const selector of imageSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr('src');
      if (src && (src.includes('xiaohongshu') || src.includes('sns-img') || src.startsWith('http'))) {
        images.push(src);
      }
    });
    if (images.length > 0) break;
  }
  
  // 提取作者信息
  let author = '';
  const authorSelectors = [
    '.author-name',
    '.user-name',
    '[data-testid="author"]',
    '.note-item-author'
  ];
  
  for (const selector of authorSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      author = element.text().trim();
      if (author && author.length > 0) {
        console.log(`✅ [解析] 找到作者 (${selector}):`, author);
        break;
      }
    }
  }
  
  // 提取标签
  const tags: string[] = [];
  const tagSelectors = [
    '.tag',
    '.hashtag',
    '[data-testid="tag"]',
    '.note-item-tag'
  ];
  
  for (const selector of tagSelectors) {
    $(selector).each((_, el) => {
      const tag = $(el).text().trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    if (tags.length > 0) break;
  }
  
  // 如果没有提取到有效内容，使用备用方案
  if (!title || title.length < 5) {
    title = '小红书旅游攻略';
  }
  
  if (!content || content.length < 20) {
    content = `这是一个小红书旅游攻略链接：${url}\n\n由于网页结构限制，无法直接提取详细内容。请手动复制小红书内容，或者尝试访问原链接获取完整信息。\n\n建议内容包括：\n- 目的地介绍\n- 行程安排\n- 景点推荐\n- 美食指南\n- 住宿建议\n- 交通信息\n- 费用预算\n- 实用贴士`;
  }
  
  console.log('📊 [解析] 解析结果统计:', {
    titleLength: title.length,
    contentLength: content.length,
    imageCount: images.length,
    tagCount: tags.length,
    hasAuthor: !!author
  });
  
  return {
    title: title.substring(0, 200), // 限制标题长度
    content: content.substring(0, 2000), // 限制内容长度
    images: images.slice(0, 10), // 最多10张图片
    author: author || '小红书用户',
    publishTime: new Date().toISOString(),
    tags: tags.slice(0, 10), // 最多10个标签
    location: '从内容中提取'
  };
}

/**
 * 真实抓取小红书内容
 */
export async function scrapeXiaohongshuContent(url: string): Promise<XiaohongshuContent> {
  // 验证URL
  if (!validateXiaohongshuUrl(url)) {
    throw new Error('无效的小红书链接格式');
  }

  // 提取内容ID
  const contentId = extractContentId(url);
  if (!contentId) {
    console.warn('⚠️ [抓取] 无法提取内容ID，将尝试直接访问URL');
  }

  console.log(`🔍 [抓取] 开始抓取小红书内容`);
  console.log(`🔗 [抓取] 目标URL: ${url}`);
  console.log(`🆔 [抓取] 内容ID: ${contentId || '未知'}`);

  try {
    // 设置请求头，模拟真实浏览器
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    console.log('🌐 [抓取] 发送HTTP请求...');
    
    // 发送请求获取网页内容
    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    console.log('📥 [抓取] 响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('📄 [抓取] HTML长度:', html.length, '字符');
    
    // 检查是否被重定向或阻止
    if (html.includes('验证码') || html.includes('captcha') || html.includes('blocked')) {
      console.warn('⚠️ [抓取] 可能遇到验证码或访问限制');
    }
    
    // 解析HTML内容
    const content = parseXiaohongshuHTML(html, url);
    
    console.log('✅ [抓取] 内容抓取完成!');
    console.log('📋 [抓取] 结果预览:', {
      title: content.title.substring(0, 50),
      contentLength: content.content.length,
      imageCount: content.images?.length || 0
    });
    
    return content;
    
  } catch (error) {
    console.error('❌ [抓取] 抓取失败:', error);
    
    // 如果抓取失败，返回基础信息供AI分析
    console.log('🔄 [抓取] 抓取失败，返回基础链接信息供AI分析');
    
    return {
      title: `小红书旅游攻略 - ${contentId || 'Unknown'}`,
      content: `抓取失败，但这是一个小红书旅游攻略链接：${url}
      
请基于链接信息和常见的小红书旅游攻略格式，生成合理的旅游规划建议。

通常小红书旅游攻略包含：
- 目的地介绍和特色
- 详细行程安排（按天规划）
- 必去景点推荐和介绍
- 当地美食推荐
- 住宿建议（位置和价位）
- 交通指南（如何到达和当地交通）
- 费用预算估算
- 实用贴士和注意事项
- 最佳旅游时间
- 拍照打卡地点

错误信息: ${error instanceof Error ? error.message : '未知错误'}`,
      author: '小红书用户',
      publishTime: new Date().toISOString(),
      tags: ['小红书', '旅游攻略', '抓取失败'],
      location: '未知',
      images: []
    };
  }
}
