const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const chokidar = require('chokidar');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');
const SRC_DIR = path.join(__dirname, '../src');

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

// 存储连接的客户端（用于热重载）
const clients = new Set();

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 解析 URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 处理热重载请求
  if (pathname === '/__webpack_hmr') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    clients.add(res);
    
    req.on('close', () => {
      clients.delete(res);
    });
    
    return;
  }
  
  // 默认页面
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // 处理游戏页面路由 - 自动添加 .html 扩展名
  if (pathname.startsWith('/games/') && !pathname.endsWith('.html')) {
    pathname = pathname + '.html';
  }
  
  // 构建文件路径
  const filePath = path.join(PUBLIC_DIR, pathname);
  
  // 获取文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  
  // 设置 MIME 类型
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，返回 404
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - 页面未找到</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
              }
              .error-container {
                text-align: center;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 1rem;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              }
              .error-code {
                font-size: 8rem;
                font-weight: 700;
                margin-bottom: 1rem;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
              }
              .error-message {
                font-size: 1.5rem;
                margin-bottom: 2rem;
                opacity: 0.9;
              }
              .back-link {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 0.5rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
              }
              .back-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
              }
              .file-path {
                margin-top: 1rem;
                font-size: 0.9rem;
                opacity: 0.7;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-code">404</div>
              <div class="error-message">页面未找到</div>
              <a href="/" class="back-link">返回首页</a>
              <div class="file-path">请求路径: ${pathname}</div>
            </div>
          </body>
          </html>
        `);
      } else {
        // 其他错误
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="utf-8">
            <title>500 - 服务器错误</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; font-size: 72px; margin-bottom: 20px; }
              .message { color: #7f8c8d; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="error">500</div>
            <div class="message">服务器内部错误</div>
          </body>
          </html>
        `);
      }
      return;
    }
    
    // 设置响应头
    res.writeHead(200, { 
      'Content-Type': contentType + (contentType.includes('text/') ? '; charset=utf-8' : ''),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // 发送文件内容
    res.end(data);
  });
});

// 文件监听器（热重载）
function setupFileWatcher() {
  console.log('👀 启动文件监听器...');
  
  const watcher = chokidar.watch([
    path.join(PUBLIC_DIR, '**/*'),
    path.join(SRC_DIR, '**/*')
  ], {
    ignored: /(node_modules|\.git|backups)/,
    persistent: true
  });
  
  watcher.on('change', (filePath) => {
    console.log(`📝 文件变更: ${path.relative(process.cwd(), filePath)}`);
    
    // 通知所有连接的客户端进行热重载
    clients.forEach(client => {
      client.write('data: {"type": "reload"}\n\n');
    });
  });
  
  watcher.on('add', (filePath) => {
    console.log(`➕ 新增文件: ${path.relative(process.cwd(), filePath)}`);
  });
  
  watcher.on('unlink', (filePath) => {
    console.log(`🗑️ 删除文件: ${path.relative(process.cwd(), filePath)}`);
  });
  
  return watcher;
}

// 启动服务器
server.listen(PORT, () => {
  console.log('\n🚀 PlayHTML5 开发服务器已启动！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 服务目录: ${PUBLIC_DIR}`);
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`📱 移动端测试: http://localhost:${PORT}`);
  console.log(`🔄 热重载: 已启用`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 开发提示:');
  console.log('   • 修改文件后浏览器会自动刷新');
  console.log('   • 按 Ctrl+C 停止服务器');
  console.log('   • 支持所有静态文件类型');
  console.log('   • 自动同步 src/ 到 public/');
  console.log('\n🎮 开始开发吧！\n');
  
  // 启动文件监听
  setupFileWatcher();
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭开发服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用！`);
    console.error(`💡 解决方案:`);
    console.error(`   1. 关闭占用端口的程序`);
    console.error(`   2. 或使用其他端口: PORT=3001 npm run dev`);
    console.error(`   3. 或查找占用进程: netstat -ano | findstr :${PORT}`);
  } else {
    console.error('❌ 服务器错误:', err);
  }
  process.exit(1);
});

// 未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
}); 