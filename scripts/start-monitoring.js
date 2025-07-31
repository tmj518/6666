#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

class MonitoringManager {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.processes = new Map();
    this.logDir = path.join(this.projectRoot, 'logs');
  }

  // 确保日志目录存在
  async ensureLogDir() {
    await fs.ensureDir(this.logDir);
  }

  // 启动单个监控进程
  startProcess(name, script, args = []) {
    console.log(`🚀 启动 ${name}...`);
    
    const logFile = path.join(this.logDir, `${name}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    
    const process = spawn('node', [script, ...args], {
      cwd: this.projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 重定向输出到日志文件和控制台
    process.stdout.pipe(logStream);
    process.stderr.pipe(logStream);
    process.stdout.pipe(process.stdout);
    process.stderr.pipe(process.stderr);

    // 存储进程信息
    this.processes.set(name, {
      process,
      logFile,
      startTime: new Date()
    });

    process.on('close', (code) => {
      console.log(`📝 ${name} 进程已退出，退出码: ${code}`);
      this.processes.delete(name);
    });

    process.on('error', (error) => {
      console.error(`❌ ${name} 进程错误:`, error.message);
    });

    return process;
  }

  // 启动所有监控服务
  async startAll() {
    console.log('\n🎮 PlayHTML5 监控和自动化系统');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await this.ensureLogDir();

    // 启动各种监控服务
    this.startProcess('watch-sync', 'scripts/watch-sync.js');
    this.startProcess('scheduled-cleanup', 'scripts/scheduled-cleanup.js');
    this.startProcess('ai-assistant', 'scripts/ai-assistant.js');

    console.log('\n✅ 所有监控服务已启动！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 运行中的服务:');
    this.processes.forEach((info, name) => {
      console.log(`  • ${name} (PID: ${info.process.pid})`);
    });
    console.log('\n💡 监控功能说明:');
    console.log('  🔄 watch-sync: 文件变更监听和自动同步');
    console.log('  🧹 scheduled-cleanup: 定时备份清理');
    console.log('  🤖 ai-assistant: AI智能命令助手');
    console.log('\n📝 日志文件位置: logs/ 目录');
    console.log('🛑 按 Ctrl+C 停止所有服务');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 停止所有进程
  stopAll() {
    console.log('\n🛑 正在停止所有监控服务...');
    
    this.processes.forEach((info, name) => {
      console.log(`📝 停止 ${name}...`);
      info.process.kill('SIGINT');
    });

    // 等待所有进程结束
    setTimeout(() => {
      this.processes.forEach((info, name) => {
        if (!info.process.killed) {
          console.log(`🔨 强制停止 ${name}...`);
          info.process.kill('SIGKILL');
        }
      });
      
      console.log('✅ 所有监控服务已停止');
      process.exit(0);
    }, 3000);
  }

  // 显示状态
  showStatus() {
    console.log('\n📊 监控服务状态:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (this.processes.size === 0) {
      console.log('❌ 没有运行中的监控服务');
      return;
    }

    this.processes.forEach((info, name) => {
      const uptime = Date.now() - info.startTime.getTime();
      const uptimeStr = this.formatUptime(uptime);
      console.log(`✅ ${name}:`);
      console.log(`   PID: ${info.process.pid}`);
      console.log(`   运行时间: ${uptimeStr}`);
      console.log(`   日志文件: ${info.logFile}`);
    });
  }

  // 格式化运行时间
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天 ${hours % 24}小时`;
    if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`;
    if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`;
    return `${seconds}秒`;
  }
}

// 主函数
async function main() {
  const manager = new MonitoringManager();

  // 处理命令行参数
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      await manager.startAll();
      break;
    case 'stop':
      manager.stopAll();
      break;
    case 'status':
      manager.showStatus();
      break;
    default:
      console.log('🎮 PlayHTML5 监控和自动化管理器');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 使用方法:');
      console.log('  node scripts/start-monitoring.js start   # 启动所有监控');
      console.log('  node scripts/start-monitoring.js stop    # 停止所有监控');
      console.log('  node scripts/start-monitoring.js status  # 查看状态');
      console.log('');
      console.log('🔧 监控服务包括:');
      console.log('  • 文件变更监听和自动同步');
      console.log('  • 定时备份清理');
      console.log('  • AI智能命令助手');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return;
  }

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 检测到 Ctrl+C，正在停止所有服务...');
    manager.stopAll();
  });

  // 处理进程退出
  process.on('exit', () => {
    manager.stopAll();
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MonitoringManager; 