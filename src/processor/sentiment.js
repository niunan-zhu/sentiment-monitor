/**
 * 情感分析 - 基于关键词匹配（简单版）
 * 完整版可接入 MiniMax API
 */

function analyze(article) {
  const title = (article.title || '').toLowerCase();
  const summary = (article.summary || '').toLowerCase();
  
  // 正面关键词
  const positive = ['发布', '新品', '获奖', '融资', '突破', '创新', '领先', '最佳', '优秀', '增长'];
  // 负面关键词  
  const negative = ['倒闭', '裁员', '亏损', '丑闻', '投诉', '违规', '违法', '破产', '危机', '负面'];
  
  for (const word of positive) {
    if (title.includes(word) || summary.includes(word)) {
      return 'positive';
    }
  }
  
  for (const word of negative) {
    if (title.includes(word) || summary.includes(word)) {
      return 'negative';
    }
  }
  
  return 'neutral';
}

module.exports = { analyze };
