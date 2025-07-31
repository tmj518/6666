const fs = require('fs');
const path = require('path');

// 检查图片和数据对应关系
function checkImagesAndData() {
  console.log('🔍 开始检查图片和数据对应关系...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const imagesDir = path.join(__dirname, '../public/images/games');
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  // 读取游戏数据
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  // 获取所有图片文件
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json')); // 排除配置文件
  
  // 统计图片数量
  const jpgFiles = imageFiles.filter(file => file.endsWith('.jpg'));
  const webpFiles = imageFiles.filter(file => file.endsWith('.webp'));
  const pngFiles = imageFiles.filter(file => file.endsWith('.png'));
  
  console.log(`📊 图片统计:`);
  console.log(`  📁 总图片文件: ${imageFiles.length} 个`);
  console.log(`  🖼️ JPG文件: ${jpgFiles.length} 个`);
  console.log(`  🖼️ WebP文件: ${webpFiles.length} 个`);
  console.log(`  🖼️ PNG文件: ${pngFiles.length} 个`);
  
  // 检查游戏数据中的图片路径
  const dataImages = games.map(game => game.image);
  const uniqueDataImages = [...new Set(dataImages)];
  
  console.log(`\n📋 游戏数据统计:`);
  console.log(`  🎮 总游戏数量: ${games.length} 个`);
  console.log(`  🖼️ 数据中的图片路径: ${dataImages.length} 个`);
  console.log(`  🖼️ 唯一图片路径: ${uniqueDataImages.length} 个`);
  
  // 检查数据中的图片文件是否存在
  console.log(`\n🔍 检查数据中的图片文件存在性:`);
  let missingImages = [];
  let existingImages = [];
  
  uniqueDataImages.forEach(imagePath => {
    const imageName = path.basename(imagePath);
    const imageExists = imageFiles.some(file => file === imageName);
    
    if (imageExists) {
      existingImages.push(imagePath);
      console.log(`  ✅ ${imagePath}`);
    } else {
      missingImages.push(imagePath);
      console.log(`  ❌ ${imagePath} (文件不存在)`);
    }
  });
  
  // 检查是否有图片文件没有被使用
  console.log(`\n🔍 检查未使用的图片文件:`);
  const usedImageNames = uniqueDataImages.map(img => path.basename(img));
  const unusedImages = imageFiles.filter(file => !usedImageNames.includes(file));
  
  if (unusedImages.length > 0) {
    console.log(`  ⚠️ 发现 ${unusedImages.length} 个未使用的图片文件:`);
    unusedImages.forEach(file => {
      console.log(`    📁 ${file}`);
    });
  } else {
    console.log(`  ✅ 所有图片文件都被使用`);
  }
  
  // 检查重复的图片路径
  console.log(`\n🔍 检查重复的图片路径:`);
  const imageCounts = {};
  dataImages.forEach(img => {
    imageCounts[img] = (imageCounts[img] || 0) + 1;
  });
  
  const duplicates = Object.entries(imageCounts).filter(([img, count]) => count > 1);
  
  if (duplicates.length > 0) {
    console.log(`  ⚠️ 发现 ${duplicates.length} 个重复使用的图片:`);
    duplicates.forEach(([img, count]) => {
      console.log(`    🔄 ${img} (被 ${count} 个游戏使用)`);
    });
  } else {
    console.log(`  ✅ 没有重复使用的图片`);
  }
  
  // 总结
  console.log(`\n📈 总结:`);
  console.log(`  🎮 游戏数量: ${games.length}`);
  console.log(`  🖼️ 实际图片文件: ${imageFiles.length}`);
  console.log(`  🖼️ 数据中的图片路径: ${uniqueDataImages.length}`);
  console.log(`  ✅ 存在的图片: ${existingImages.length}`);
  console.log(`  ❌ 缺失的图片: ${missingImages.length}`);
  console.log(`  📁 未使用的图片: ${unusedImages.length}`);
  console.log(`  🔄 重复使用的图片: ${duplicates.length}`);
  
  if (missingImages.length === 0 && duplicates.length === 0) {
    console.log(`\n🎉 完美！所有图片都正确对应，没有重复！`);
  } else {
    console.log(`\n⚠️ 需要修复的问题:`);
    if (missingImages.length > 0) {
      console.log(`  - 创建缺失的图片文件`);
    }
    if (duplicates.length > 0) {
      console.log(`  - 修复重复使用的图片`);
    }
  }
}

// 运行检查
checkImagesAndData(); 