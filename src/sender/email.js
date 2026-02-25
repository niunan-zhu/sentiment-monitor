/**
 * 邮件发送模块
 */

const nodemailer = require('nodemailer');
const settings = require('../../config/settings.json');

async function sendEmail(articles) {
  const transporter = nodemailer.createTransport({
    host: settings.email.host,
    port: settings.email.port,
    secure: settings.email.secure,
    auth: settings.email.auth
  });
  
  const html = generateReport(articles);
  
  await transporter.sendMail({
    from: settings.email.auth.user,
    to: settings.email.recipients.join(','),
    subject: `📊 市场舆情日报 - ${new Date().toLocaleDateString()}`,
    html
  });
  
  console.log('邮件发送成功!');
}

function generateReport(articles) {
  const today = new Date().toDateString();
  const todayArticles = articles.filter(a => 
    new Date(a.pubTime).toDateString() === today
  );
  
  // 按平台分组
  const byPlatform = {};
  todayArticles.forEach(a => {
    byPlatform[a.platform] = byPlatform[a.platform] || [];
    byPlatform[a.platform].push(a);
  });
  
  let html = `
    <h1>📊 市场舆情日报</h1>
    <p><strong>日期：${new Date().toLocaleDateString()}</strong></p>
    
    <h2>📈 今日概览</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <tr style="background: #f5f5f5;">
        <th style="border: 1px solid #ddd; padding: 8px;">平台</th>
        <th style="border: 1px solid #ddd; padding: 8px;">数量</th>
      </tr>
  `;
  
  for (const [platform, list] of Object.entries(byPlatform)) {
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${platform}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${list.length}</td>
      </tr>
    `;
  }
  
  html += `
    </table>
    <h2>📰 详细内容</h2>
  `;
  
  for (const [platform, list] of Object.entries(byPlatform)) {
    html += `<h3>${platform}</h3>`;
    list.forEach(article => {
      html += `
        <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
          <h4>${article.title}</h4>
          <p>来源：${article.source}</p>
          <p>摘要：${article.summary || '无'}</p>
          <p>链接：<a href="${article.url}">${article.url}</a></p>
        </div>
      `;
    });
  }
  
  html += `
    <hr>
    <p>查看更多：<a href="http://localhost:3000">舆情监测 Dashboard</a></p>
  `;
  
  return html;
}

module.exports = { sendEmail };
