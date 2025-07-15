#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

class DevServer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.publicDir = path.join(this.projectRoot, 'public');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.port = process.env.PORT || 3000;
  }

  // 检查依赖是否安装
  async checkDependencies() {
    console.log('🔍 检查项目依赖...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    
    if (!await fs.pathExists(packageJsonPath)) {
      console.error('❌ 未找到 package.json 文件');
      process.exit(1);
    }
    
    if (!await fs.pathExists(nodeModulesPath)) {
      console.log('📦 依赖未安装，正在安装...');
      try {
        execSync('npm install', { 
          cwd: this.projectRoot, 
          stdio: 'inherit' 
        });
        console.log('✅ 依赖安装完成');
      } catch (error) {
        console.error('❌ 依赖安装失败:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ 依赖已安装');
    }
  }

  // 检查端口是否可用
  async checkPort() {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(this.port, () => {
        server.close();
        resolve(true);
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  // 自动同步文件
  async syncFiles() {
    console.log('🔄 同步源文件到 public 目录...');
    
    try {
      // 同步 src/data 到 public/data
      if (await fs.pathExists(path.join(this.srcDir, 'data'))) {
        await fs.copy(
          path.join(this.srcDir, 'data'),
          path.join(this.publicDir, 'data'),
          { overwrite: true }
        );
        console.log('✅ 数据文件同步完成');
      }
      
      // 同步 src/assets/js 到 public/js
      if (await fs.pathExists(path.join(this.srcDir, 'assets', 'js'))) {
        await fs.copy(
          path.join(this.srcDir, 'assets', 'js'),
          path.join(this.publicDir, 'js'),
          { overwrite: true }
        );
        console.log('✅ JavaScript 文件同步完成');
      }
      
      // 同步 src/assets/css 到 public/css
      if (await fs.pathExists(path.join(this.srcDir, 'assets', 'css'))) {
        await fs.copy(
          path.join(this.srcDir, 'assets', 'css'),
          path.join(this.publicDir, 'css'),
          { overwrite: true }
        );
        console.log('✅ CSS 文件同步完成');
      }
      
    } catch (error) {
      console.error('❌ 文件同步失败:', error.message);
    }
  }

  // 显示启动信息
  showStartupInfo() {
    console.log('\n🎮 PlayHTML5 开发环境启动器');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 项目根目录: ${this.projectRoot}`);
    console.log(`📁 静态文件目录: ${this.publicDir}`);
    console.log(`📁 源码目录: ${this.srcDir}`);
    console.log(`🌐 服务端口: ${this.port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 启动开发服务器
  async start() {
    try {
      this.showStartupInfo();
      
      // 检查依赖
      await this.checkDependencies();
      
      // 检查端口
      const portAvailable = await this.checkPort();
      if (!portAvailable) {
        console.error(`❌ 端口 ${this.port} 已被占用！`);
        console.log('💡 解决方案:');
        console.log(`   1. 关闭占用端口的程序`);
        console.log(`   2. 或使用其他端口: PORT=3001 npm run dev`);
        console.log(`   3. 或查找占用进程: netstat -ano | findstr :${this.port}`);
        
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('\n是否尝试使用其他端口？(y/n): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() === 'y') {
          this.port = 3001;
          console.log(`🔄 尝试使用端口 ${this.port}`);
        } else {
          process.exit(1);
        }
      }
      
      // 同步文件
      await this.syncFiles();
      
      // 启动开发服务器
      console.log('🚀 启动开发服务器...\n');
      
      const serverProcess = spawn('node', ['scripts/dev-server.js'], {
        cwd: this.projectRoot,
        stdio: 'inherit',
        env: { ...process.env, PORT: this.port }
      });
      
      // 处理进程退出
      serverProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ 服务器异常退出，退出码: ${code}`);
        }
        process.exit(code);
      });
      
      // 处理信号
      process.on('SIGINT', () => {
        console.log('\n👋 正在关闭开发环境...');
        serverProcess.kill('SIGINT');
      });
      
      process.on('SIGTERM', () => {
        serverProcess.kill('SIGTERM');
      });
      
    } catch (error) {
      console.error('❌ 启动失败:', error.message);
      process.exit(1);
    }
  }
}

// 启动开发环境
const devServer = new DevServer();
devServer.start(); 