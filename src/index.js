/**
 * 市场舆情监测系统 - 主入口
 * Web 服务器 + API
 */

const express = require('express');
const path = require('path');
const jsonStore = require('./storage/jsonStore');
const { startScheduler } = require('./scheduler');

const app = express();

// 启动定时任务
startScheduler();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../views')));

// 首页 - Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// API: 获取文章列表
app.get('/api/articles', async (req, res) => {
  try {
    const { keyword, platform, sentiment, startDate, endDate } = req.query;
    let articles = await jsonStore.getAll();
    
    // 筛选
    if (keyword) {
      articles = articles.filter(a => 
        a.title?.includes(keyword) || a.summary?.includes(keyword)
      );
    }
    if (platform) {
      articles = articles.filter(a => a.platform === platform);
    }
    if (sentiment) {
      articles = articles.filter(a => a.sentiment === sentiment);
    }
    if (startDate) {
      articles = articles.filter(a => new Date(a.pubTime) >= new Date(startDate));
    }
    if (endDate) {
      articles = articles.filter(a => new Date(a.pubTime) <= new Date(endDate));
    }
    
    // 按时间倒序
    articles.sort((a, b) => new Date(b.pubTime) - new Date(a.pubTime));
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 获取统计
app.get('/api/stats', async (req, res) => {
  try {
    const articles = await jsonStore.getAll();
    const today = new Date().toDateString();
    
    const todayArticles = articles.filter(a => 
      new Date(a.pubTime).toDateString() === today
    );
    
    const stats = {
      total: articles.length,
      today: todayArticles.length,
      byPlatform: {},
      bySentiment: { positive: 0, negative: 0, neutral: 0 }
    };
    
    articles.forEach(a => {
      stats.byPlatform[a.platform] = (stats.byPlatform[a.platform] || 0) + 1;
      if (a.sentiment) {
        stats.bySentiment[a.sentiment] = (stats.bySentiment[a.sentiment] || 0) + 1;
      }
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: 手动触发抓取
app.post('/api/fetch', async (req, res) => {
  try {
    const fetcher = require('./fetcher');
    const articles = await fetcher.fetchAll();
    await jsonStore.save(articles);
    res.json({ success: true, count: articles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`舆情监测 Dashboard: http://localhost:${PORT}`);
});

module.exports = app;
