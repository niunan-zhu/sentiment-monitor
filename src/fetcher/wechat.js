/**
 * 微信公众号抓取 - 搜狗微信搜索
 */

const { chromium } = require('playwright');

async function fetchWechat(keywords) {
  const articles = [];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const keyword of keywords.slice(0, 3)) { // 限制关键词数量
      console.log(`搜狗微信搜索: ${keyword}`);
      
      const page = await browser.newPage();
      await page.goto(`https://weixin.sogou.com/weixin?query=${encodeURIComponent(keyword)}`, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
      
      // 解析结果
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.news-list li');
        return Array.from(items).map(item => ({
          title: item.querySelector('.txt-box h3 a')?.textContent?.trim(),
          url: item.querySelector('.txt-box h3 a')?.href,
          summary: item.querySelector('.txt-box p')?.textContent?.trim(),
          pubTime: item.querySelector('.sou')?.textContent
        })).filter(item => item.title);
      });
      
      results.forEach(item => {
        articles.push({
          ...item,
          platform: '微信公众号',
          source: '搜狗微信',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await page.close();
      
      // 避免请求过快
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('搜狗微信抓取失败:', error.message);
  } finally {
    await browser.close();
  }
  
  return articles;
}

module.exports = fetchWechat;
