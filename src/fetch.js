/**
 * 手动触发抓取
 */

const fetcher = require('./fetcher');
const jsonStore = require('./storage/jsonStore');
const emailSender = require('./sender/email');

async function main() {
  console.log('开始抓取...');
  
  const articles = await fetcher.fetchAll();
  console.log(`抓取完成，共 ${articles.length} 条`);
  
  // 保存
  await jsonStore.save(articles);
  console.log('已保存到本地');
  
  // 发送邮件
  if (articles.length > 0) {
    try {
      await emailSender.sendEmail(articles);
      console.log('邮件已发送');
    } catch (e) {
      console.error('邮件发送失败:', e.message);
    }
  }
}

main().catch(console.error);
