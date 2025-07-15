const fs = require('fs');
const path = require('path');

/**
 * 清理孤立游戏数据 - 移除图片或HTML文件已被删除的游戏
 */
function cleanOrphanedGames() {
  console.log('🧹 开始清理孤立游戏数据...');
  
  const gamesJsonPath = path.join(__dirname, '../public/data/games.json');
  const backupDir = path.join(__dirname, '../backups');
  
  // 确保备份目录存在
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // 读取现有游戏数据
  if (!fs.existsSync(gamesJsonPath)) {
    console.log('❌ games.json 文件不存在，跳过清理');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
  const originalCount = data.games.length;
  const orphanedGames = [];
  const validGames = [];
  
  console.log(`📊 开始校验 ${originalCount} 个游戏的文件存在性...`);
  
  // 遍历所有游戏，检查文件存在性
  for (const game of data.games) {
    // 修正路径拼接，确保 public 目录下的真实路径
    const imagePath = path.join(__dirname, '../public', game.image.replace(/^\//, ''));
    const htmlPath = path.join(__dirname, '../public', game.url.replace(/^\//, ''));
    
    const imageExists = fs.existsSync(imagePath);
    const htmlExists = fs.existsSync(htmlPath);
    
    if (!imageExists || !htmlExists) {
      orphanedGames.push({
        game: game,
        missingImage: !imageExists,
        missingHtml: !htmlExists,
        imagePath: game.image,
        htmlPath: game.url
      });
      
      console.log(`⚠️  发现孤立游戏: ${game.title.en}`);
      if (!imageExists) console.log(`   - 图片文件缺失: ${game.image}`);
      if (!htmlExists) console.log(`   - HTML文件缺失: ${game.url}`);
    } else {
      validGames.push(game);
    }
  }
  
  // 如果有孤立游戏，进行清理
  if (orphanedGames.length > 0) {
    console.log(`\n🗑️  发现 ${orphanedGames.length} 个孤立游戏，开始清理...`);
    
    // 创建备份
    const backupPath = path.join(backupDir, `games-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`💾 已备份原始数据到: ${backupPath}`);
    
    // 更新games.json，只保留有效游戏
    const cleanedData = {
      ...data,
      games: validGames
    };
    
    fs.writeFileSync(gamesJsonPath, JSON.stringify(cleanedData, null, 2));
    
    console.log(`✅ 清理完成:`);
    console.log(`   - 原始游戏数量: ${originalCount}`);
    console.log(`   - 清理后数量: ${validGames.length}`);
    console.log(`   - 移除孤立游戏: ${orphanedGames.length} 个`);
    
    // 输出被移除的游戏详情
    console.log('\n📋 被移除的孤立游戏列表:');
    orphanedGames.forEach((orphaned, index) => {
      console.log(`${index + 1}. ${orphaned.game.title.en} (ID: ${orphaned.game.id})`);
      if (orphaned.missingImage) console.log(`   - 图片缺失: ${orphaned.imagePath}`);
      if (orphaned.missingHtml) console.log(`   - HTML缺失: ${orphaned.htmlPath}`);
    });
    
  } else {
    console.log('✅ 所有游戏文件都存在，无需清理');
  }
  
  // 更新分类统计
  updateCategoryCounts(validGames);
  
  console.log('\n🎉 孤立游戏清理完成！');
}

/**
 * 更新分类统计
 */
function updateCategoryCounts(games) {
  console.log('\n📊 更新分类统计...');
  
  const categoriesPath = path.join(__dirname, '../public/data/categories.json');
  if (!fs.existsSync(categoriesPath)) {
    console.log('❌ categories.json 文件不存在，跳过统计更新');
    return;
  }
  
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  
  // 统计每个分类的游戏数量
  const categoryCounts = {};
  games.forEach(game => {
    if (game.category && Array.isArray(game.category)) {
      game.category.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
  });
  
  // 更新categories.json中的count字段
  categoriesData.categories.forEach(category => {
    category.count = categoryCounts[category.id] || 0;
  });
  
  fs.writeFileSync(categoriesPath, JSON.stringify(categoriesData, null, 2));
  
  console.log('✅ 分类统计已更新:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} 个游戏`);
  });
}

/**
 * 清理过期备份
 */
function cleanOldBackups() {
  console.log('\n🧹 开始清理过期备份...');
  
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    console.log('📁 备份目录不存在，跳过备份清理');
    return;
  }
  
  const files = fs.readdirSync(backupDir);
  const backupFiles = files.filter(file => file.startsWith('games-backup-') && file.endsWith('.json'));
  
  if (backupFiles.length <= 15) {
    console.log(`📁 备份文件数量 (${backupFiles.length}) 未超过限制 (15)，无需清理`);
    return;
  }
  
  // 按修改时间排序，保留最新的15个
  const fileStats = backupFiles.map(file => ({
    name: file,
    path: path.join(backupDir, file),
    mtime: fs.statSync(path.join(backupDir, file)).mtime
  })).sort((a, b) => b.mtime - a.mtime);
  
  const filesToDelete = fileStats.slice(15);
  
  if (filesToDelete.length > 0) {
    console.log(`🗑️  删除 ${filesToDelete.length} 个过期备份文件...`);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`   - 已删除: ${file.name}`);
    });
  }
  
  console.log(`✅ 备份清理完成，保留 ${Math.min(backupFiles.length, 15)} 个最新备份`);
}

// 主执行函数
function main() {
  try {
    cleanOrphanedGames();
    cleanOldBackups();
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { cleanOrphanedGames, cleanOldBackups }; 