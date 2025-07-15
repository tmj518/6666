const fs = require('fs-extra');
const path = require('path');

const gamesDir = path.join(__dirname, '../public/games');
const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

const NAVBAR = `\n<nav class="w-full bg-white shadow mb-4 flex items-center px-4 py-2">\n  <div class="flex items-center gap-4">\n    <a href="https://www.ukhtml5games.com/" class="flex items-center" title="PlayHTML5 Home">\n      <picture>\n        <source srcset="/images/games/logo.webp" type="image/webp">\n        <img src="/images/games/logo.png" alt="PlayHTML5 Logo" height="32" loading="lazy">\n      </picture>\n    </a>\n    <a href="https://www.ukhtml5games.com/" class="text-gray-700 hover:text-blue-600 font-medium">Home</a>\n    <a href="https://www.ukhtml5games.com/" class="text-gray-700 hover:text-blue-600 font-medium">All Games</a>\n  </div>\n  <div class="flex-1"></div>\n</nav>\n`;

function fixNavbar(html) {
  // 移除所有旧导航栏
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  // 插入新导航栏到<body>后
  if (/<body[^>]*>/i.test(html)) {
    html = html.replace(/<body[^>]*>/i, match => match + NAVBAR);
  } else {
    html = NAVBAR + html;
  }
  return html;
}

files.forEach(file => {
  const filePath = path.join(gamesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const before = content;
  content = fixNavbar(content);
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`已优化导航栏: ${file}`);
  } else {
    console.log(`导航栏已达标: ${file}`);
  }
}); 