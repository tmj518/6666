const fs = require('fs');
const path = require('path');

// 删除剩余的使用重复图片的游戏
function removeRemainingDuplicates() {
  console.log('🧹 开始删除剩余的使用重复图片的游戏...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const imagesDir = path.join(__dirname, '../public/images/games');
  const gamesDir = path.join(__dirname, '../public/games');
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  // 读取游戏数据
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  console.log(`📊 当前游戏数量: ${games.length} 个`);
  
  // 要删除的游戏ID列表（使用重复图片的游戏）
  const gamesToRemoveIds = [1002, 1008, 1011, 1017, 1019];
  
  const gamesToRemove = games.filter(game => gamesToRemoveIds.includes(game.id));
  
  console.log(`\n🔍 找到使用重复图片的游戏:`);
  gamesToRemove.forEach(game => {
    console.log(`  🎮 ${game.title.en} (ID: ${game.id}) - ${game.image}`);
  });
  
  if (gamesToRemove.length === 0) {
    console.log(`\n✅ 没有找到使用重复图片的游戏`);
    return;
  }
  
  // 删除重复的图片文件
  console.log(`\n🗑️ 删除重复的图片文件...`);
  const deletedImages = new Set();
  
  gamesToRemove.forEach(game => {
    const imagePath = path.join(__dirname, '../public', game.image);
    const webpPath = imagePath.replace('.jpg', '.webp');
    
    // 删除 jpg 文件
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        deletedImages.add(path.basename(imagePath));
        console.log(`  ✅ 删除图片文件: ${path.basename(imagePath)}`);
      } catch (error) {
        console.log(`  ❌ 删除图片失败: ${path.basename(imagePath)} - ${error.message}`);
      }
    }
    
    // 删除 webp 文件
    if (fs.existsSync(webpPath)) {
      try {
        fs.unlinkSync(webpPath);
        deletedImages.add(path.basename(webpPath));
        console.log(`  ✅ 删除图片文件: ${path.basename(webpPath)}`);
      } catch (error) {
        console.log(`  ❌ 删除图片失败: ${path.basename(webpPath)} - ${error.message}`);
      }
    }
  });
  
  // 删除对应的HTML文件
  console.log(`\n🗑️ 删除对应的HTML文件...`);
  const deletedHtmls = new Set();
  
  gamesToRemove.forEach(game => {
    const htmlFileName = path.basename(game.url);
    const htmlPath = path.join(gamesDir, htmlFileName);
    
    if (fs.existsSync(htmlPath)) {
      try {
        fs.unlinkSync(htmlPath);
        deletedHtmls.add(htmlFileName);
        console.log(`  ✅ 删除HTML文件: ${htmlFileName}`);
      } catch (error) {
        console.log(`  ❌ 删除HTML失败: ${htmlFileName} - ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ HTML文件不存在: ${htmlFileName}`);
    }
  });
  
  // 从游戏数据中移除这些游戏
  console.log(`\n📊 从数据中移除游戏...`);
  const originalCount = games.length;
  const gamesToKeep = games.filter(game => !gamesToRemoveIds.includes(game.id));
  gamesData.games = gamesToKeep;
  
  console.log(`  🗑️ 移除了 ${originalCount - gamesToKeep.length} 个游戏`);
  
  // 重新分配ID
  gamesToKeep.forEach((game, index) => {
    game.id = 1001 + index;
  });
  
  // 保存更新后的游戏数据
  try {
    fs.writeFileSync(gamesDataPath, JSON.stringify(gamesData, null, 2));
    console.log(`  ✅ 已保存更新的游戏数据`);
  } catch (error) {
    console.log(`  ❌ 保存数据失败: ${error.message}`);
  }
  
  // 更新分类统计
  console.log(`\n📊 更新分类统计...`);
  const categoryCounts = {};
  gamesToKeep.forEach(game => {
    game.category.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  const categoriesPath = path.join(__dirname, '../public/data/categories.json');
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  
  categoriesData.categories.forEach(category => {
    if (categoryCounts[category.id]) {
      category.count = categoryCounts[category.id];
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
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个游戏`);
  });
  
  // 最终验证
  const finalImageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json'));
  
  const finalHtmlFiles = fs.readdirSync(gamesDir)
    .filter(file => file.endsWith('.html'));
  
  console.log(`\n📈 清理完成总结:`);
  console.log(`  🗑️ 删除重复图片: ${deletedImages.size} 个`);
  console.log(`  🗑️ 删除HTML文件: ${deletedHtmls.size} 个`);
  console.log(`  🗑️ 删除游戏数据: ${gamesToRemove.length} 个`);
  console.log(`  🎮 最终游戏数量: ${gamesToKeep.length} 个`);
  console.log(`  🖼️ 最终图片文件: ${finalImageFiles.length} 个`);
  console.log(`  📄 最终HTML文件: ${finalHtmlFiles.length} 个`);
  
  if (gamesToKeep.length === finalImageFiles.length && gamesToKeep.length === finalHtmlFiles.length) {
    console.log(`\n🎉 重复图片和游戏清理完成！`);
    console.log(`  ✅ 每个游戏对应一个唯一的图片`);
    console.log(`  ✅ 每个游戏对应一个唯一的HTML文件`);
    console.log(`  ✅ 前端不会再显示重复的图片`);
  } else {
    console.log(`\n⚠️ 仍需手动检查一些文件`);
  }
}

// 运行清理
removeRemainingDuplicates(); 