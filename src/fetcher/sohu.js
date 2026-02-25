/**
 * 搜狐号抓取
 */

const { chromium } = require('playwright');

async function fetchSohu(keywords) {
  const articles = [];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const keyword of keywords.slice(0, 3)) {
      console.log(`搜狐搜索: ${keyword}`);
      
      const page = await browser.newPage();
      await page.goto(`https://www.sohu.com/search?keyword=${encodeURIComponent(keyword)}`, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
      
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.news-list li');
        return Array.from(items).map(item => ({
          title: item.querySelector('.title')?.textContent?.trim(),
          url: item.querySelector('.title a')?.href,
          summary: item.querySelector('.plain')?.textContent?.trim()
        })).filter(item => item.title);
      });
      
      results.forEach(item => {
        articles.push({
          ...item,
          platform: '搜狐号',
          source: '搜狐',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('搜狐抓取失败:', error.message);
  } finally {
    await browser.close();
  }
  
  return articles;
}

module.exports = fetchSohu;
