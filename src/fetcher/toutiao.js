/**
 * 今日头条抓取
 */

const { chromium } = require('playwright');

async function fetchToutiao(keywords) {
  const articles = [];
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const keyword of keywords.slice(0, 3)) {
      console.log(`头条搜索: ${keyword}`);
      
      const page = await browser.newPage();
      await page.goto(`https://www.toutiao.com/search/?keyword=${encodeURIComponent(keyword)}`, {
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(3000);
      
      const results = await page.evaluate(() => {
        const items = document.querySelectorAll('.article');
        return Array.from(items).map(item => ({
          title: item.querySelector('.article-title')?.textContent?.trim(),
          url: item.querySelector('.article-link')?.href,
          summary: item.querySelector('.article-subtitle')?.textContent?.trim()
        })).filter(item => item.title);
      });
      
      results.forEach(item => {
        articles.push({
          ...item,
          platform: '头条号',
          source: '今日头条',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await page.close();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error) {
    console.error('头条抓取失败:', error.message);
  } finally {
    await browser.close();
  }
  
  return articles;
}

module.exports = fetchToutiao;
