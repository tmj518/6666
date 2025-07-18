const fs = require('fs');
const path = require('path');

/**
 * 测试robots.txt功能
 */
function testRobotsTxt() {
  console.log('🔍 开始测试robots.txt功能...\n');
  
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  
  // 1. 检查文件是否存在
  if (!fs.existsSync(robotsPath)) {
    console.log('❌ robots.txt文件不存在');
    return false;
  }
  console.log('✅ robots.txt文件存在');
  
  // 2. 读取文件内容
  const content = fs.readFileSync(robotsPath, 'utf8');
  console.log('✅ robots.txt文件可读取');
  
  // 3. 检查基本语法
  const lines = content.split('\n').filter(line => line.trim());
  console.log(`📊 文件包含 ${lines.length} 行有效内容`);
  
  // 4. 检查必要元素
  const checks = {
    userAgent: content.includes('User-agent: *'),
    sitemap: content.includes('Sitemap:'),
    allow: content.includes('Allow:'),
    disallow: content.includes('Disallow:'),
    crawlDelay: content.includes('Crawl-delay:')
  };
  
  console.log('\n🔍 语法检查结果:');
  Object.entries(checks).forEach(([key, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${key}: ${passed ? '通过' : '缺失'}`);
  });
  
  // 5. 检查sitemap URL
  const sitemapMatch = content.match(/Sitemap:\s*(https?:\/\/[^\s]+)/);
  if (sitemapMatch) {
    console.log(`✅ Sitemap URL: ${sitemapMatch[1]}`);
  } else {
    console.log('❌ 未找到有效的Sitemap URL');
  }
  
  // 6. 检查禁止的目录
  const disallowPatterns = [
    '/admin/',
    '/private/',
    '/logs/',
    '/config/',
    '/api/',
    '/ajax/'
  ];
  
  console.log('\n🔍 禁止目录检查:');
  disallowPatterns.forEach(pattern => {
    const found = content.includes(`Disallow: ${pattern}`);
    console.log(`  ${found ? '✅' : '❌'} ${pattern}: ${found ? '已禁止' : '未禁止'}`);
  });
  
  // 7. 检查允许的目录
  const allowPatterns = [
    '/games/',
    '/images/games/',
    '/data/'
  ];
  
  console.log('\n🔍 允许目录检查:');
  allowPatterns.forEach(pattern => {
    const found = content.includes(`Allow: ${pattern}`);
    console.log(`  ${found ? '✅' : '❌'} ${pattern}: ${found ? '已允许' : '未允许'}`);
  });
  
  // 8. 验证robots.txt是否可以通过HTTP访问
  console.log('\n🌐 HTTP访问测试:');
  console.log('  请在浏览器中访问: http://localhost:3000/robots.txt');
  console.log('  或使用curl命令: curl http://localhost:3000/robots.txt');
  
  // 9. 生成测试报告
  const allChecksPassed = Object.values(checks).every(Boolean);
  console.log(`\n📊 测试总结: ${allChecksPassed ? '✅ 通过' : '❌ 失败'}`);
  
  if (allChecksPassed) {
    console.log('\n🎉 robots.txt配置正确！');
    console.log('💡 建议:');
    console.log('  1. 将sitemap.xml提交到Google Search Console');
    console.log('  2. 测试robots.txt是否被搜索引擎正确识别');
    console.log('  3. 定期更新robots.txt内容');
  } else {
    console.log('\n⚠️ 发现一些问题，请检查robots.txt配置');
  }
  
  return allChecksPassed;
}

// 如果直接运行此脚本
if (require.main === module) {
  testRobotsTxt();
}

module.exports = { testRobotsTxt }; 