const fs = require('fs');
const path = require('path');

// 修复分类重复问题
function fixCategoryDuplicates() {
  console.log('🔧 开始修复分类重复问题...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  const categoriesPath = path.join(__dirname, '../public/data/categories.json');
  
  // 读取游戏数据
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  console.log(`📊 当前游戏数量: ${games.length} 个`);
  
  // 统计每个分类的游戏数量
  const categoryCounts = {};
  games.forEach(game => {
    game.category.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  console.log(`\n📋 修复前的分类统计:`);
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个游戏`);
  });
  
  // 修复分类重复问题
  console.log(`\n🔧 开始修复分类重复...`);
  let fixedGames = 0;
  
  games.forEach(game => {
    if (game.category.length > 1) {
      console.log(`\n🎮 修复游戏: ${game.title.en}`);
      console.log(`  原分类: [${game.category.join(', ')}]`);
      
      // 根据游戏标题和描述确定主要分类
      const title = game.title.en.toLowerCase();
      const description = game.description.en.toLowerCase();
      
      let primaryCategory = game.category[0]; // 默认使用第一个分类
      
      // 根据游戏标题和描述智能分配分类
      if (title.includes('action') || description.includes('action') || description.includes('fast-paced')) {
        primaryCategory = 'action';
      } else if (title.includes('puzzle') || description.includes('puzzle') || description.includes('brain')) {
        primaryCategory = 'puzzle';
      } else if (title.includes('adventure') || description.includes('adventure') || description.includes('explore')) {
        primaryCategory = 'adventure';
      } else if (title.includes('strategy') || description.includes('strategy') || description.includes('strategic')) {
        primaryCategory = 'strategy';
      } else if (title.includes('sports') || description.includes('sports') || description.includes('flappy')) {
        primaryCategory = 'sports';
      } else if (title.includes('educational') || description.includes('educational') || description.includes('learn')) {
        primaryCategory = 'educational';
      } else if (title.includes('card') || description.includes('card') || description.includes('solitaire')) {
        primaryCategory = 'card';
      } else if (title.includes('arcade') || description.includes('arcade') || description.includes('retro')) {
        primaryCategory = 'arcade';
      } else if (title.includes('popular') || description.includes('popular') || description.includes('trending')) {
        primaryCategory = 'popular';
      } else if (title.includes('new') || description.includes('new') || description.includes('latest')) {
        primaryCategory = 'new';
      } else if (description.includes('casual') || description.includes('relaxing')) {
        primaryCategory = 'casual';
      }
      
      // 更新游戏分类
      game.category = [primaryCategory];
      console.log(`  新分类: [${primaryCategory}]`);
      fixedGames++;
    }
  });
  
  // 保存更新后的游戏数据
  if (fixedGames > 0) {
    try {
      fs.writeFileSync(gamesDataPath, JSON.stringify(gamesData, null, 2));
      console.log(`\n✅ 已保存更新的游戏数据`);
    } catch (error) {
      console.log(`\n❌ 保存数据失败: ${error.message}`);
    }
  }
  
  // 更新分类统计
  console.log(`\n📊 更新分类统计...`);
  const newCategoryCounts = {};
  games.forEach(game => {
    game.category.forEach(cat => {
      newCategoryCounts[cat] = (newCategoryCounts[cat] || 0) + 1;
    });
  });
  
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  
  categoriesData.categories.forEach(category => {
    if (newCategoryCounts[category.id]) {
      category.count = newCategoryCounts[category.id];
    } else {
      category.count = 0;
    }
  });
  
  try {
    fs.writeFileSync(categoriesPath, JSON.stringify(categoriesData, null, 2));
    console.log(`  ✅ 已更新分类统计`);
  } catch (error) {
    console.log(`  ❌ 更新分类统计失败: ${error.message}`);
  }
  
  // 显示修复后的分类统计
  console.log(`\n📋 修复后的分类统计:`);
  Object.entries(newCategoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个游戏`);
  });
  
  // 检查是否还有重复的图片在不同分类中
  console.log(`\n🔍 检查图片分类重复...`);
  const imageCategoryMap = {};
  let duplicateImages = 0;
  
  games.forEach(game => {
    const imagePath = game.image;
    if (!imageCategoryMap[imagePath]) {
      imageCategoryMap[imagePath] = [];
    }
    imageCategoryMap[imagePath].push(game.category[0]);
  });
  
  Object.entries(imageCategoryMap).forEach(([imagePath, categories]) => {
    if (categories.length > 1) {
      console.log(`  ⚠️ 图片 ${path.basename(imagePath)} 出现在多个分类: [${categories.join(', ')}]`);
      duplicateImages++;
    }
  });
  
  if (duplicateImages === 0) {
    console.log(`  ✅ 没有图片出现在多个分类中`);
  }
  
  // 总结
  console.log(`\n📈 修复完成总结:`);
  console.log(`  🔧 修复分类重复的游戏: ${fixedGames} 个`);
  console.log(`  🎮 总游戏数量: ${games.length} 个`);
  console.log(`  📁 图片分类重复: ${duplicateImages} 个`);
  
  if (fixedGames > 0) {
    console.log(`\n🎉 分类重复问题修复完成！`);
    console.log(`  ✅ 每个游戏现在只属于一个分类`);
    console.log(`  ✅ 前端不会再在不同分类中显示同一张图片`);
  } else {
    console.log(`\n✅ 没有需要修复的分类重复问题`);
  }
}

// 运行修复
fixCategoryDuplicates(); 