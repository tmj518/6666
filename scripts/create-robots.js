const fs = require('fs');
const path = require('path');

const robotsContent = `# PlayHTML5 Robots.txt
# 适用于HTML5游戏网站的爬虫协议

# 允许所有搜索引擎爬虫访问
User-agent: *

# 允许抓取网站根目录下的所有内容
Allow: /

# 禁止抓取后台管理目录
Disallow: /admin/
Disallow: /private/
Disallow: /temp/

# 禁止抓取动态脚本文件
Disallow: /*.php$
Disallow: /*.asp$
Disallow: /*.jsp$

# 禁止抓取包含特定参数的页面，防止重复内容
Disallow: /?page=*
Disallow: /?sort=*
Disallow: /?filter=*

# 允许抓取游戏相关目录
Allow: /games/
Allow: /images/games/
Allow: /data/

# 禁止抓取日志和配置文件
Disallow: /logs/
Disallow: /config/
Disallow: /.env
Disallow: /package.json
Disallow: /README.md

# 禁止抓取API接口
Disallow: /api/
Disallow: /ajax/

# 网站地图地址
Sitemap: https://www.ukhtml5games.com/sitemap.xml

# 爬取延迟（可选，单位为秒）
Crawl-delay: 1
`;

const robotsPath = path.join(__dirname, '../public/robots.txt');

try {
  fs.writeFileSync(robotsPath, robotsContent, 'utf8');
  console.log('✅ robots.txt文件创建成功！');
  console.log(`📁 文件路径: ${robotsPath}`);
  console.log(`📊 文件大小: ${robotsContent.length} 字符`);
  
  // 验证文件内容
  const content = fs.readFileSync(robotsPath, 'utf8');
  console.log('\n📋 文件内容预览:');
  console.log(content.split('\n').slice(0, 10).join('\n'));
  console.log('...');
  
} catch (error) {
  console.error('❌ 创建robots.txt文件失败:', error.message);
} 