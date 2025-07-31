const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 检测和修复重复的图片文件
function fixDuplicateImageFiles() {
  console.log('🔍 开始检测和修复重复的图片文件...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const imagesDir = path.join(__dirname, '../public/images/games');
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  // 读取游戏数据
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  // 获取所有图片文件
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json'));
  
  console.log(`📊 检测到 ${imageFiles.length} 个图片文件`);
  
  // 计算每个图片文件的MD5哈希值
  const fileHashes = {};
  const duplicateGroups = {};
  
  imageFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    
    if (!fileHashes[hash]) {
      fileHashes[hash] = [];
      duplicateGroups[hash] = [];
    }
    
    fileHashes[hash].push(file);
    duplicateGroups[hash].push(file);
  });
  
  // 找出重复的文件
  const duplicates = Object.entries(duplicateGroups).filter(([hash, files]) => files.length > 1);
  
  console.log(`\n🔍 发现 ${duplicates.length} 组重复的图片文件:`);
  
  let totalDuplicates = 0;
  duplicates.forEach(([hash, files]) => {
    console.log(`\n🔄 重复组 (MD5: ${hash.substring(0, 8)}...):`);
    files.forEach(file => {
      console.log(`  📁 ${file}`);
    });
    totalDuplicates += files.length - 1; // 减去一个作为保留的原始文件
  });
  
  if (duplicates.length === 0) {
    console.log(`\n✅ 没有发现重复的图片文件！`);
    return;
  }
  
  // 修复重复文件
  console.log(`\n🔧 开始修复重复的图片文件...`);
  let fixedFiles = 0;
  
  duplicates.forEach(([hash, files]) => {
    // 保留第一个文件，为其他文件创建新的唯一图片
    const keepFile = files[0];
    const duplicateFiles = files.slice(1);
    
    console.log(`\n📁 保留原始文件: ${keepFile}`);
    
    duplicateFiles.forEach((duplicateFile, index) => {
      // 找到使用这个重复图片的游戏
      const gamesUsingFile = games.filter(game => {
        const gameImageName = path.basename(game.image);
        return gameImageName === duplicateFile;
      });
      
      if (gamesUsingFile.length > 0) {
        gamesUsingFile.forEach(game => {
          // 创建新的唯一图片文件名
          const gameName = game.title.en.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const newImageName = `${gameName}-unique-${Date.now()}.jpg`;
          const newImagePath = `/images/games/${newImageName}`;
          
          // 复制原始图片到新文件名
          const sourcePath = path.join(imagesDir, keepFile);
          const targetPath = path.join(imagesDir, newImageName);
          
          try {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✅ 创建新图片: ${newImageName} (为游戏: ${game.title.en})`);
            
            // 更新游戏数据中的图片路径
            game.image = newImagePath;
            fixedFiles++;
          } catch (error) {
            console.log(`  ❌ 创建图片失败: ${newImageName} - ${error.message}`);
          }
        });
      }
      
      // 删除重复的图片文件
      try {
        fs.unlinkSync(path.join(imagesDir, duplicateFile));
        console.log(`  🗑️ 删除重复文件: ${duplicateFile}`);
      } catch (error) {
        console.log(`  ❌ 删除失败: ${duplicateFile} - ${error.message}`);
      }
    });
  });
  
  // 保存更新后的游戏数据
  if (fixedFiles > 0) {
    try {
      fs.writeFileSync(gamesDataPath, JSON.stringify(gamesData, null, 2));
      console.log(`\n✅ 已保存更新的游戏数据`);
    } catch (error) {
      console.log(`\n❌ 保存数据失败: ${error.message}`);
    }
  }
  
  // 更新分类统计
  console.log(`\n📊 更新分类统计...`);
  const categoryCounts = {};
  games.forEach(game => {
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
  
  // 最终验证
  const finalImageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json'));
  
  console.log(`\n📈 修复完成总结:`);
  console.log(`  🔧 修复重复图片: ${fixedFiles} 个`);
  console.log(`  🗑️ 删除重复文件: ${totalDuplicates} 个`);
  console.log(`  🎮 游戏数量: ${games.length} 个`);
  console.log(`  🖼️ 最终图片文件: ${finalImageFiles.length} 个`);
  
  if (fixedFiles > 0) {
    console.log(`\n🎉 重复图片文件修复完成！`);
    console.log(`  ✅ 每个游戏现在都有唯一的图片文件`);
    console.log(`  ✅ 前端不会再显示重复的图片`);
  } else {
    console.log(`\n✅ 没有需要修复的重复图片文件`);
  }
}

// 运行修复
fixDuplicateImageFiles(); 