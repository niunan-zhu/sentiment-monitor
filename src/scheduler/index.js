/**
 * 定时任务调度器
 */

const schedule = require('node-schedule');
const fetcher = require('../fetcher');
const jsonStore = require('../storage/jsonStore');
const emailSender = require('../sender/email');

// 每天早上 8:00 执行
function startScheduler() {
  console.log('定时任务已启动，每天早上 8:00 自动抓取');
  
  schedule.scheduleJob('0 8 * * *', async () => {
    console.log('【定时任务】开始抓取...');
    
    try {
      const articles = await fetcher.fetchAll();
      await jsonStore.save(articles);
      await emailSender.sendEmail(articles);
      console.log('【定时任务】完成！');
    } catch (e) {
      console.error('【定时任务】失败:', e.message);
    }
  });
}

module.exports = { startScheduler };
