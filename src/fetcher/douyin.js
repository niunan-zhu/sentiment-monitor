/**
 * 抖音抓取
 */

const { chromium } = require('playwright');

async function fetchDouyin(keywords) {
  const articles = [];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const keyword of keywords.slice(0, 3)) {
      console.log(`抖音搜索: ${keyword}`);
      
      const page = await browser.newPage();
      await page.goto(`https://www.douyin.com/search/${encodeURIComponent(keyword)}`, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
      
      // 抖音数据在JSON中
      const data = await page.evaluate(() => {
        const script = document.querySelector('#__NEXT_DATA__');
        if (!script) return null;
        try {
          const json = JSON.parse(script.textContent);
          return json.props?.pageProps?.initialState?.video?.list || [];
        } catch {
          return [];
        }
      });
      
      data.slice(0, 10).forEach(item => {
        articles.push({
          title: item.desc || item.title,
          url: `https://www.douyin.com/video/${item.aweme_id}`,
          summary: item.desc?.substring(0, 100),
          pubTime: new Date(item.create_time * 1000).toISOString(),
          platform: '抖音',
          source: '抖音网页',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('抖音抓取失败:', error.message);
  } finally {
    await browser.close();
  }
  
  return articles;
}

module.exports = fetchDouyin;
