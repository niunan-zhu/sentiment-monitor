/**
 * JSON 存储模块
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data/articles');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 获取所有文章
async function getAll() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const allArticles = [];
  
  for (const file of files) {
    const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    const articles = JSON.parse(data);
    allArticles.push(...articles);
  }
  
  return allArticles;
}

// 保存文章
async function save(articles) {
  const date = new Date().toISOString().split('T')[0];
  const filePath = path.join(DATA_DIR, `${date}.json`);
  
  // 读取已有数据
  let existing = [];
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  // 合并去重
  const existingTitles = new Set(existing.map(a => a.title));
  const newArticles = articles.filter(a => !existingTitles.has(a.title));
  
  const merged = [...existing, ...newArticles];
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  
  return merged.length;
}

// 获取指定日期的数据
async function getByDate(date) {
  const filePath = path.join(DATA_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { getAll, save, getByDate };
