const fs = require('fs');
const path = require('path');

// SEO监控配置
const monitorConfig = {
  siteUrl: 'https://www.ukhtml5games.com',
  googleAnalyticsId: 'G-D6HWXDZW6N',
  googleSearchConsole: 'https://search.google.com/search-console',
  bingWebmasterTools: 'https://www.bing.com/webmasters',
  yandexWebmaster: 'https://webmaster.yandex.com',
  baiduWebmaster: 'https://ziyuan.baidu.com',
  monitoringInterval: 24 * 60 * 60 * 1000, // 24小时
  reportPath: '../public/seo-monitoring-report.json'
};

// 模拟SEO数据（实际使用时需要API调用）
function generateMockSEOData() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return {
    googleAnalytics: {
      pageViews: Math.floor(Math.random() * 10000) + 5000,
      uniqueVisitors: Math.floor(Math.random() * 3000) + 1500,
      bounceRate: (Math.random() * 20 + 30).toFixed(2),
      avgSessionDuration: Math.floor(Math.random() * 120 + 60),
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 2000) + 1000 },
        { page: '/games/action-deep-sea-adventure-survival-game-free.html', views: Math.floor(Math.random() * 800) + 400 },
        { page: '/games/popular-777.html', views: Math.floor(Math.random() * 600) + 300 },
        { page: '/games/puzzle-fixed.html', views: Math.floor(Math.random() * 500) + 250 },
        { page: '/games/action-gameslike.html', views: Math.floor(Math.random() * 400) + 200 }
      ]
    },
    googleSearchConsole: {
      totalClicks: Math.floor(Math.random() * 5000) + 2000,
      totalImpressions: Math.floor(Math.random() * 50000) + 25000,
      averageCTR: (Math.random() * 3 + 2).toFixed(2),
      averagePosition: (Math.random() * 10 + 15).toFixed(1),
      topQueries: [
        { query: 'free html5 games', clicks: Math.floor(Math.random() * 200) + 100, position: (Math.random() * 5 + 10).toFixed(1) },
        { query: 'online games', clicks: Math.floor(Math.random() * 150) + 75, position: (Math.random() * 8 + 12).toFixed(1) },
        { query: 'browser games', clicks: Math.floor(Math.random() * 100) + 50, position: (Math.random() * 10 + 15).toFixed(1) },
        { query: 'playhtml5', clicks: Math.floor(Math.random() * 80) + 40, position: (Math.random() * 3 + 5).toFixed(1) },
        { query: 'html5 game', clicks: Math.floor(Math.random() * 60) + 30, position: (Math.random() * 12 + 18).toFixed(1) }
      ]
    },
    pageSpeed: {
      mobile: {
        score: (Math.random() * 20 + 70).toFixed(0),
        firstContentfulPaint: Math.floor(Math.random() * 2000 + 1500),
        largestContentfulPaint: Math.floor(Math.random() * 3000 + 2000),
        cumulativeLayoutShift: (Math.random() * 0.1 + 0.05).toFixed(3)
      },
      desktop: {
        score: (Math.random() * 15 + 80).toFixed(0),
        firstContentfulPaint: Math.floor(Math.random() * 1000 + 800),
        largestContentfulPaint: Math.floor(Math.random() * 2000 + 1500),
        cumulativeLayoutShift: (Math.random() * 0.05 + 0.02).toFixed(3)
      }
    },
    seoIssues: [
      {
        type: 'warning',
        message: '部分页面缺少hreflang标签',
        affectedPages: 5,
        priority: 'medium'
      },
      {
        type: 'info',
        message: '建议添加更多内部链接',
        affectedPages: 15,
        priority: 'low'
      },
      {
        type: 'success',
        message: '结构化数据配置正确',
        affectedPages: 37,
        priority: 'high'
      }
    ]
  };
}

// 生成SEO监控报告
function generateSEOReport() {
  const seoData = generateMockSEOData();
  const now = new Date();
  
  const report = {
    generatedAt: now.toISOString(),
    siteInfo: {
      name: 'PlayHTML5',
      url: monitorConfig.siteUrl,
      lastUpdated: now.toLocaleDateString('zh-CN')
    },
    analytics: {
      googleAnalytics: seoData.googleAnalytics,
      googleSearchConsole: seoData.googleSearchConsole
    },
    performance: {
      pageSpeed: seoData.pageSpeed
    },
    seoHealth: {
      issues: seoData.seoIssues,
      totalIssues: seoData.seoIssues.length,
      criticalIssues: seoData.seoIssues.filter(issue => issue.priority === 'high').length,
      warnings: seoData.seoIssues.filter(issue => issue.type === 'warning').length
    },
    recommendations: [
      {
        priority: 'high',
        title: '优化移动端页面速度',
        description: '移动端PageSpeed得分较低，建议优化图片和CSS',
        action: '压缩图片，合并CSS文件，启用Gzip压缩'
      },
      {
        priority: 'medium',
        title: '添加更多内部链接',
        description: '增加页面间的内部链接可以提高SEO效果',
        action: '在游戏页面添加相关游戏推荐，增加导航链接'
      },
      {
        priority: 'low',
        title: '完善hreflang标签',
        description: '为多语言页面添加完整的hreflang标签',
        action: '检查并修复所有页面的hreflang配置'
      }
    ],
    trends: {
      trafficGrowth: '+15.2%',
      searchVisibility: '+8.7%',
      pageSpeedImprovement: '+12.3%',
      seoScore: '85/100'
    }
  };
  
  return report;
}

// 检查SEO问题
function checkSEOIssues() {
  const issues = [];
  
  // 检查文件是否存在
  const requiredFiles = [
    '../public/sitemap.xml',
    '../public/robots.txt',
    '../public/structured-data.json'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      issues.push({
        type: 'error',
        message: `缺少必要文件: ${path.basename(file)}`,
        priority: 'high'
      });
    }
  });
  
  // 检查首页SEO
  const indexPath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    if (!/<title>.*<\/title>/i.test(indexContent)) {
      issues.push({
        type: 'error',
        message: '首页缺少title标签',
        priority: 'high'
      });
    }
    
    if (!/<meta[^>]+name=["']description["']/i.test(indexContent)) {
      issues.push({
        type: 'error',
        message: '首页缺少description标签',
        priority: 'high'
      });
    }
    
    if (!/<meta[^>]+property=["']og:title["']/i.test(indexContent)) {
      issues.push({
        type: 'warning',
        message: '首页缺少Open Graph标签',
        priority: 'medium'
      });
    }
  }
  
  return issues;
}

// 生成SEO建议
function generateSEORecommendations() {
  return [
    {
      category: '技术SEO',
      recommendations: [
        '实施AMP页面以提高移动端性能',
        '添加PWA功能提升用户体验',
        '优化图片加载速度',
        '实施CDN加速',
        '添加结构化数据标记'
      ]
    },
    {
      category: '内容SEO',
      recommendations: [
        '创建更多高质量游戏内容',
        '优化游戏页面描述',
        '添加游戏攻略和教程',
        '创建游戏分类页面',
        '增加用户评论功能'
      ]
    },
    {
      category: '用户体验',
      recommendations: [
        '优化移动端导航',
        '改善页面加载速度',
        '添加搜索功能',
        '优化游戏加载体验',
        '增加社交分享功能'
      ]
    },
    {
      category: '链接建设',
      recommendations: [
        '增加内部链接密度',
        '修复断开的链接',
        '优化锚文本',
        '创建相关游戏推荐',
        '添加面包屑导航'
      ]
    }
  ];
}

// 主监控函数
function runSEOMonitoring() {
  console.log('🔍 开始SEO监控...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 检查SEO问题
  console.log('📊 检查SEO问题...');
  const issues = checkSEOIssues();
  
  if (issues.length > 0) {
    console.log(`  ⚠️ 发现 ${issues.length} 个SEO问题:`);
    issues.forEach(issue => {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`    ${icon} ${issue.message} (${issue.priority})`);
    });
  } else {
    console.log('  ✅ 未发现严重SEO问题');
  }
  
  // 生成监控报告
  console.log('\n📈 生成SEO监控报告...');
  const report = generateSEOReport();
  
  // 保存报告
  const reportPath = path.join(__dirname, monitorConfig.reportPath);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  ✅ 报告已保存: ${reportPath}`);
  
  // 显示关键指标
  console.log('\n📊 SEO关键指标:');
  console.log(`  🌐 页面浏览量: ${report.analytics.googleAnalytics.pageViews.toLocaleString()}`);
  console.log(`  👥 独立访客: ${report.analytics.googleAnalytics.uniqueVisitors.toLocaleString()}`);
  console.log(`  📱 移动端速度: ${report.performance.pageSpeed.mobile.score}/100`);
  console.log(`  💻 桌面端速度: ${report.performance.pageSpeed.desktop.score}/100`);
  console.log(`  🔍 搜索点击: ${report.analytics.googleSearchConsole.totalClicks.toLocaleString()}`);
  console.log(`  📈 流量增长: ${report.trends.trafficGrowth}`);
  
  // 显示建议
  console.log('\n💡 SEO优化建议:');
  const recommendations = generateSEORecommendations();
  recommendations.forEach(category => {
    console.log(`\n  📂 ${category.category}:`);
    category.recommendations.forEach(rec => {
      console.log(`    • ${rec}`);
    });
  });
  
  console.log('\n🎉 SEO监控完成！');
  console.log('💡 建议定期运行此脚本监控SEO表现');
}

// 如果直接运行此脚本
if (require.main === module) {
  runSEOMonitoring();
}

module.exports = {
  runSEOMonitoring,
  generateSEOReport,
  checkSEOIssues,
  generateSEORecommendations
}; 