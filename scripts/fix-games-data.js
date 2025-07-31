const fs = require('fs');
const path = require('path');

// 修复games.json中的plays字段
function fixGamesData() {
  console.log('🔧 开始修复games.json中的plays字段...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  if (!fs.existsSync(gamesDataPath)) {
    console.log('❌ games.json文件不存在');
    return;
  }
  
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  console.log(`📊 找到 ${games.length} 个游戏需要修复`);
  
  let fixedCount = 0;
  
  games.forEach((game, index) => {
    if (game.plays) {
      const oldPlays = game.plays;
      
      // 将字符串格式转换为有效整数
      let newPlays;
      if (typeof oldPlays === 'string') {
        if (oldPlays.includes('K+')) {
          // 将 "980K+" 转换为 980000
          newPlays = parseInt(oldPlays.replace('K+', '')) * 1000;
        } else if (oldPlays.includes('M+')) {
          // 将 "1M+" 转换为 1000000
          newPlays = parseInt(oldPlays.replace('M+', '')) * 1000000;
        } else if (oldPlays.includes('+')) {
          // 将 "1000+" 转换为 1000
          newPlays = parseInt(oldPlays.replace('+', ''));
        } else {
          // 直接转换为整数
          newPlays = parseInt(oldPlays) || 100;
        }
      } else {
        newPlays = oldPlays;
      }
      
      // 确保是有效整数
      if (isNaN(newPlays) || newPlays <= 0) {
        newPlays = 100;
      }
      
      if (oldPlays !== newPlays) {
        game.plays = newPlays;
        console.log(`✅ 修复游戏 ${index + 1}: ${game.title.en}`);
        console.log(`   plays: "${oldPlays}" → ${newPlays}`);
        fixedCount++;
      }
    }
  });
  
  // 保存修复后的数据
  fs.writeFileSync(gamesDataPath, JSON.stringify(gamesData, null, 2));
  
  console.log('\n🎉 games.json修复完成！');
  console.log(`📊 修复了 ${fixedCount} 个游戏的plays字段`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 验证修复结果
  console.log('\n🔍 验证修复结果:');
  games.forEach((game, index) => {
    if (game.plays) {
      const plays = game.plays;
      const isValid = typeof plays === 'number' && !isNaN(plays) && plays > 0;
      console.log(`   ${game.title.en}: ${plays} ${isValid ? '✅' : '❌'}`);
    }
  });
}

// 运行脚本
fixGamesData(); 