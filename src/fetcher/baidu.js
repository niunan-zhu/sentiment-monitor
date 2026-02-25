/**
 * 百度百家号抓取 - 百度搜索
 */

const { chromium } = require('playwright');

async function fetchBaidu(keywords) {
  const articles = [];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const keyword of keywords.slice(0, 3)) {
      console.log(`百度搜索: ${keyword}`);
      
      const page = await browser.newPage();
      await page.goto(`https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}+site:baijiahao.baidu.com`, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
      
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.result');
        return Array.from(items).map(item => ({
          title: item.querySelector('h3 a')?.textContent?.trim(),
          url: item.querySelector('h3 a')?.href,
          summary: item.querySelector('.c-abstract')?.textContent?.trim(),
          pubTime: item.querySelector('.c-abstract .new-time_factor')?.textContent
        })).filter(item => item.title);
      });
      
      results.forEach(item => {
        articles.push({
          ...item,
          platform: '百家号',
          source: '百度搜索',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('百度搜索抓取失败:', error.message);
  } finally {
    await browser.close();
  }
  
  return articles;
}

module.exports = fetchBaidu;
