/**
 * 抓取模块 - 汇总各平台抓取
 */

const fetchWechat = require('./wechat');
const fetchBaidu = require('./baidu');
const fetchToutiao = require('./toutiao');
const fetchSohu = require('./sohu');
const fetchDouyin = require('./douyin');
const fetchBilibili = require('./bilibili');

const keywords = require('../../config/keywords.json');

// 获取所有关键词
function getAllKeywords() {
  return [
    ...keywords.brand,
    ...keywords.competitor,
    ...keywords.industry
  ];
}

// 抓取所有平台
async function fetchAll() {
  const allKeywords = getAllKeywords();
  const allArticles = [];
  
  console.log(`开始抓取，关键词: ${allKeywords.length}个`);
  
  // 并行抓取各平台
  const results = await Promise.allSettled([
    fetchWechat(allKeywords),
    fetchBaidu(allKeywords),
    fetchToutiao(allKeywords),
    fetchSohu(allKeywords),
    fetchDouyin(allKeywords),
    fetchBilibili(allKeywords)
  ]);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`平台${index + 1}抓取完成: ${result.value.length}条`);
      allArticles.push(...result.value);
    } else {
      console.error(`平台${index + 1}抓取失败: ${result.reason}`);
    }
  });
  
  // 去重
  const uniqueArticles = deduplicate(allArticles);
  console.log(`去重后: ${uniqueArticles.length}条`);
  
  return uniqueArticles;
}

// 简单去重（按标题）
function deduplicate(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const key = article.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { fetchAll, getAllKeywords };
