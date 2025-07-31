const fs = require('fs');
const path = require('path');

// 修复结构化数据中的ratingCount字段
function fixStructuredData() {
  console.log('🔧 开始修复结构化数据中的ratingCount字段...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const structuredDataPath = path.join(__dirname, '../public/structured-data.json');
  
  if (!fs.existsSync(structuredDataPath)) {
    console.log('❌ 结构化数据文件不存在');
    return;
  }
  
  const structuredData = JSON.parse(fs.readFileSync(structuredDataPath, 'utf8'));
  const games = structuredData.games;
  
  console.log(`📊 找到 ${games.length} 个游戏需要修复`);
  
  let fixedCount = 0;
  
  games.forEach((game, index) => {
    if (game.aggregateRating && game.aggregateRating.ratingCount) {
      const oldRatingCount = game.aggregateRating.ratingCount;
      
      // 将字符串格式转换为有效整数
      let newRatingCount;
      if (typeof oldRatingCount === 'string') {
        if (oldRatingCount.includes('K+')) {
          // 将 "980K+" 转换为 980000
          newRatingCount = parseInt(oldRatingCount.replace('K+', '')) * 1000;
        } else if (oldRatingCount.includes('M+')) {
          // 将 "1M+" 转换为 1000000
          newRatingCount = parseInt(oldRatingCount.replace('M+', '')) * 1000000;
        } else if (oldRatingCount.includes('+')) {
          // 将 "1000+" 转换为 1000
          newRatingCount = parseInt(oldRatingCount.replace('+', ''));
        } else {
          // 直接转换为整数
          newRatingCount = parseInt(oldRatingCount) || 100;
        }
      } else {
        newRatingCount = oldRatingCount;
      }
      
      // 确保是有效整数
      if (isNaN(newRatingCount) || newRatingCount <= 0) {
        newRatingCount = 100;
      }
      
      if (oldRatingCount !== newRatingCount) {
        game.aggregateRating.ratingCount = newRatingCount;
        console.log(`✅ 修复游戏 ${index + 1}: ${game.name}`);
        console.log(`   ratingCount: "${oldRatingCount}" → ${newRatingCount}`);
        fixedCount++;
      }
    }
  });
  
  // 保存修复后的数据
  fs.writeFileSync(structuredDataPath, JSON.stringify(structuredData, null, 2));
  
  console.log('\n🎉 结构化数据修复完成！');
  console.log(`📊 修复了 ${fixedCount} 个游戏的ratingCount字段`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 验证修复结果
  console.log('\n🔍 验证修复结果:');
  games.forEach((game, index) => {
    if (game.aggregateRating && game.aggregateRating.ratingCount) {
      const ratingCount = game.aggregateRating.ratingCount;
      const isValid = typeof ratingCount === 'number' && !isNaN(ratingCount) && ratingCount > 0;
      console.log(`   ${game.name}: ${ratingCount} ${isValid ? '✅' : '❌'}`);
    }
  });
}

// 运行脚本
fixStructuredData(); 