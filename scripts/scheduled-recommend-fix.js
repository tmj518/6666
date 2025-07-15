const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 定时推荐区修复配置
const RECOMMEND_CONFIG = {
  schedule: '0 2 * * *', // 每日凌晨2点
  logFile: path.join(__dirname, '../logs/recommend-fix.log'),
  maxLogSize: 10 * 1024 * 1024
};

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  const logDir = path.dirname(RECOMMEND_CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (fs.existsSync(RECOMMEND_CONFIG.logFile)) {
    const stats = fs.statSync(RECOMMEND_CONFIG.logFile);
    if (stats.size > RECOMMEND_CONFIG.maxLogSize) {
      const backupLog = RECOMMEND_CONFIG.logFile + '.bak';
      fs.renameSync(RECOMMEND_CONFIG.logFile, backupLog);
    }
  }
  fs.appendFileSync(RECOMMEND_CONFIG.logFile, logEntry);
  console.log(message);
}

function scheduledRecommendFix() {
  writeLog('🕐 开始定时推荐区修复...');
  exec('node scripts/fix-recommend-area.js', (err, stdout, stderr) => {
    if (err) {
      writeLog(`❌ 推荐区修复失败: ${err.message}`);
      return;
    }
    writeLog('✅ 推荐区修复完成!');
    if (stdout) writeLog(stdout);
    if (stderr) writeLog(stderr);
  });
}

if (require.main === module) {
  console.log('🕐 定时推荐区修复脚本启动...');
  console.log(`📅 修复时间: ${RECOMMEND_CONFIG.schedule}`);
  console.log(`📝 日志文件: ${RECOMMEND_CONFIG.logFile}`);
  scheduledRecommendFix();
  setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    if (hour === 2 && minute === 0) {
      scheduledRecommendFix();
    }
  }, 60 * 1000);
  console.log('⏰ 定时器已启动，等待下次执行...');
}

module.exports = { scheduledRecommendFix, RECOMMEND_CONFIG }; 