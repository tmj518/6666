const { cleanBackups } = require('./clean-backups');
const fs = require('fs');
const path = require('path');

// 定时清理配置
const CLEANUP_CONFIG = {
  // 每日凌晨2点执行
  schedule: '0 2 * * *',
  // 清理日志文件
  logFile: path.join(__dirname, '../logs/cleanup.log'),
  // 最大日志文件大小 (10MB)
  maxLogSize: 10 * 1024 * 1024
};

// 写入日志
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // 确保日志目录存在
  const logDir = path.dirname(CLEANUP_CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // 检查日志文件大小
  if (fs.existsSync(CLEANUP_CONFIG.logFile)) {
    const stats = fs.statSync(CLEANUP_CONFIG.logFile);
    if (stats.size > CLEANUP_CONFIG.maxLogSize) {
      // 备份并清空日志文件
      const backupLog = CLEANUP_CONFIG.logFile + '.bak';
      fs.renameSync(CLEANUP_CONFIG.logFile, backupLog);
    }
  }
  
  // 追加日志
  fs.appendFileSync(CLEANUP_CONFIG.logFile, logEntry);
  console.log(message);
}

// 执行定时清理
function scheduledCleanup() {
  writeLog('🕐 开始定时备份清理...');
  
  try {
    const startTime = Date.now();
    cleanBackups();
    const duration = Date.now() - startTime;
    
    writeLog(`✅ 定时清理完成! 耗时: ${duration}ms`);
  } catch (error) {
    writeLog(`❌ 定时清理失败: ${error.message}`);
    console.error('定时清理错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  console.log('🕐 定时清理脚本启动...');
  console.log(`📅 清理时间: ${CLEANUP_CONFIG.schedule}`);
  console.log(`📝 日志文件: ${CLEANUP_CONFIG.logFile}`);
  
  // 立即执行一次清理
  scheduledCleanup();
  
  // 设置定时任务 (每小时检查一次)
  setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 每天凌晨2点执行
    if (hour === 2 && minute === 0) {
      scheduledCleanup();
    }
  }, 60 * 1000); // 每分钟检查一次
  
  console.log('⏰ 定时器已启动，等待下次执行...');
}

module.exports = { scheduledCleanup, CLEANUP_CONFIG }; 