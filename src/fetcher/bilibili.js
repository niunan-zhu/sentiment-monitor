/**
 * B站抓取 - 使用开放API
 */

const axios = require('axios');

async function fetchBilibili(keywords) {
  const articles = [];
  
  try {
    for (const keyword of keywords.slice(0, 3)) {
      console.log(`B站搜索: ${keyword}`);
      
      const response = await axios.get('https://api.bilibili.com/x/web-interface/search', {
        params: {
          search_type: 'video',
          keyword: keyword
        },
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      const results = response.data?.data?.result || [];
      
      results.slice(0, 10).forEach(item => {
        articles.push({
          title: item.title?.replace(/<[^>]+>/g, ''),
          url: item.arcurl,
          summary: item.description?.replace(/<[^>]+>/g, ''),
          pubTime: new Date(item.pubdate * 1000).toISOString(),
          author: item.author,
          platform: 'B站',
          source: 'B站开放API',
          keyword,
          category: 'brand',
          sentiment: null
        });
      });
      
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (error) {
    console.error('B站抓取失败:', error.message);
  }
  
  return articles;
}

module.exports = fetchBilibili;
