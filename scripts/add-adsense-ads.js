const fs = require('fs');
const path = require('path');

// AdSense广告代码示例
const adsenseAds = {
  // 横幅广告
  banner: `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6886160126549046"
     data-ad-slot="YOUR_BANNER_AD_SLOT"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,

  // 侧边栏广告
  sidebar: `<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6886160126549046"
     data-ad-slot="YOUR_SIDEBAR_AD_SLOT"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,

  // 文章内广告
  inArticle: `<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-6886160126549046"
     data-ad-slot="YOUR_IN_ARTICLE_AD_SLOT"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,

  // 游戏页面广告
  gamePage: `<div class="ad-container bg-gray-100 p-4 rounded-lg my-4">
  <div class="text-center text-sm text-gray-500 mb-2">Advertisement</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-6886160126549046"
       data-ad-slot="YOUR_GAME_PAGE_AD_SLOT"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>`
};

// 在首页添加广告位
function addAdsToHomePage() {
  const indexPath = path.join(__dirname, '../public/index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // 在游戏网格之前添加横幅广告
  const gameGridPattern = /<div class="game-grid mt-8" id="gameGrid">/;
  if (gameGridPattern.test(html)) {
    const bannerAd = `<div class="ad-banner mb-8">
  <div class="text-center text-sm text-gray-500 mb-2">Advertisement</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-6886160126549046"
       data-ad-slot="YOUR_BANNER_AD_SLOT"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>`;
    
    html = html.replace(gameGridPattern, bannerAd + '\n        <div class="game-grid mt-8" id="gameGrid">');
  }
  
  // 在页脚之前添加侧边栏广告
  const footerPattern = /<footer class="bg-gray-100 py-8 mt-12 border-t">/;
  if (footerPattern.test(html)) {
    const sidebarAd = `<div class="ad-sidebar my-8">
  <div class="text-center text-sm text-gray-500 mb-2">Advertisement</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-6886160126549046"
       data-ad-slot="YOUR_SIDEBAR_AD_SLOT"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>`;
    
    html = html.replace(footerPattern, sidebarAd + '\n    <footer class="bg-gray-100 py-8 mt-12 border-t">');
  }
  
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✅ 已添加广告位到首页');
}

// 在游戏页面添加广告位
function addAdsToGamePages() {
  const gamesDir = path.join(__dirname, '../public/games');
  const gameFiles = fs.readdirSync(gamesDir).filter(file => file.endsWith('.html'));
  
  gameFiles.forEach(file => {
    const filePath = path.join(gamesDir, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    
    // 在游戏标题之后添加广告
    const titlePattern = /<h1[^>]*>.*?<\/h1>/;
    if (titlePattern.test(html)) {
      const gameAd = `<div class="ad-game-page my-4">
  <div class="text-center text-sm text-gray-500 mb-2">Advertisement</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-6886160126549046"
       data-ad-slot="YOUR_GAME_PAGE_AD_SLOT"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>`;
      
      html = html.replace(titlePattern, match => match + '\n    ' + gameAd);
    }
    
    // 在相关游戏推荐之前添加广告
    const relatedPattern = /<h3[^>]*>More.*?Games<\/h3>/;
    if (relatedPattern.test(html)) {
      const relatedAd = `<div class="ad-related-games my-4">
  <div class="text-center text-sm text-gray-500 mb-2">Advertisement</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-6886160126549046"
       data-ad-slot="YOUR_RELATED_GAMES_AD_SLOT"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
       (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>`;
      
      html = html.replace(relatedPattern, relatedAd + '\n  <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">More Action Games</h3>');
    }
    
    fs.writeFileSync(filePath, html, 'utf-8');
  });
  
  console.log(`✅ 已添加广告位到 ${gameFiles.length} 个游戏页面`);
}

// 生成AdSense配置文档
function generateAdSenseConfig() {
  const config = {
    publisherId: 'ca-pub-6886160126549046',
    ads: {
      banner: {
        description: '首页横幅广告',
        slot: 'YOUR_BANNER_AD_SLOT',
        placement: '首页游戏网格上方',
        size: '响应式'
      },
      sidebar: {
        description: '首页侧边栏广告',
        slot: 'YOUR_SIDEBAR_AD_SLOT',
        placement: '页脚之前',
        size: '响应式'
      },
      gamePage: {
        description: '游戏页面广告',
        slot: 'YOUR_GAME_PAGE_AD_SLOT',
        placement: '游戏标题之后',
        size: '响应式'
      },
      relatedGames: {
        description: '相关游戏推荐广告',
        slot: 'YOUR_RELATED_GAMES_AD_SLOT',
        placement: '相关游戏推荐之前',
        size: '响应式'
      }
    },
    instructions: [
      '1. 登录Google AdSense账户',
      '2. 创建新的广告单元',
      '3. 复制广告代码中的data-ad-slot值',
      '4. 替换代码中的YOUR_*_AD_SLOT为实际的广告位ID',
      '5. 等待Google审核和批准',
      '6. 监控广告表现和收入'
    ],
    bestPractices: [
      '不要在游戏内容区域放置过多广告',
      '确保广告不影响用户体验',
      '遵守AdSense政策',
      '定期检查广告表现',
      '优化广告位置以提高点击率'
    ]
  };
  
  fs.writeFileSync(path.join(__dirname, '../public/adsense-config.json'), JSON.stringify(config, null, 2));
  console.log('✅ 已生成AdSense配置文档');
}

// 主函数
function main() {
  console.log('🚀 开始添加AdSense广告位...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 添加广告位到首页
  addAdsToHomePage();
  
  // 添加广告位到游戏页面
  addAdsToGamePages();
  
  // 生成配置文档
  generateAdSenseConfig();
  
  console.log('\n📈 广告位添加完成！');
  console.log('\n💡 下一步操作:');
  console.log('  1. 登录Google AdSense账户');
  console.log('  2. 创建广告单元并获取广告位ID');
  console.log('  3. 替换代码中的YOUR_*_AD_SLOT');
  console.log('  4. 等待Google审核');
  console.log('  5. 监控广告表现');
  
  console.log('\n📝 注意: 请确保遵守AdSense政策，不要过度放置广告影响用户体验。');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  addAdsToHomePage,
  addAdsToGamePages,
  generateAdSenseConfig
}; 