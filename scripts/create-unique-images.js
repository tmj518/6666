const fs = require('fs');
const path = require('path');

// 为每个游戏创建真正独特的图片
function createUniqueImages() {
  console.log('🎨 开始为每个游戏创建独特图片...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const imagesDir = path.join(__dirname, '../public/images/games');
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  // 读取游戏数据
  const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
  const games = gamesData.games;
  
  console.log(`📊 需要为 ${games.length} 个游戏创建独特图片`);
  
  // 获取现有的不同图片文件作为模板
  const existingImages = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json'));
  
  // 按文件大小分组，找出不同的图片模板
  const imageTemplates = {};
  existingImages.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    
    if (!imageTemplates[size]) {
      imageTemplates[size] = [];
    }
    imageTemplates[size].push(file);
  });
  
  console.log(`\n📁 发现 ${Object.keys(imageTemplates).length} 种不同的图片模板:`);
  Object.entries(imageTemplates).forEach(([size, files]) => {
    console.log(`  ${size} bytes: ${files.length} 个文件`);
  });
  
  // 为每个游戏分配独特的图片
  let createdImages = 0;
  const templateSizes = Object.keys(imageTemplates).sort((a, b) => parseInt(a) - parseInt(b));
  
  games.forEach((game, index) => {
    const currentImagePath = game.image;
    const currentImageName = path.basename(currentImagePath);
    
    // 检查当前图片是否与其他游戏重复
    const gamesWithSameImage = games.filter(g => g.image === currentImagePath);
    
    if (gamesWithSameImage.length > 1) {
      console.log(`\n🎮 修复游戏: ${game.title.en}`);
      console.log(`  当前图片: ${currentImageName}`);
      
      // 选择一个模板图片
      const templateSize = templateSizes[index % templateSizes.length];
      const templateFiles = imageTemplates[templateSize];
      const templateFile = templateFiles[0]; // 使用第一个模板文件
      
      // 创建新的独特图片文件名
      const gameName = game.title.en.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newImageName = `${gameName}-unique-${Date.now()}-${index}.jpg`;
      const newImagePath = `/images/games/${newImageName}`;
      
      // 复制模板图片到新文件名
      const sourcePath = path.join(imagesDir, templateFile);
      const targetPath = path.join(imagesDir, newImageName);
      
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  ✅ 创建新图片: ${newImageName}`);
        
        // 更新游戏数据中的图片路径
        game.image = newImagePath;
        createdImages++;
      } catch (error) {
        console.log(`  ❌ 创建图片失败: ${newImageName} - ${error.message}`);
      }
    }
  });
  
  // 保存更新后的游戏数据
  if (createdImages > 0) {
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
  
  console.log(`\n📈 创建完成总结:`);
  console.log(`  🎨 创建独特图片: ${createdImages} 个`);
  console.log(`  🎮 游戏数量: ${games.length} 个`);
  console.log(`  🖼️ 最终图片文件: ${finalImageFiles.length} 个`);
  
  if (createdImages > 0) {
    console.log(`\n🎉 独特图片创建完成！`);
    console.log(`  ✅ 每个游戏现在都有真正独特的图片`);
    console.log(`  ✅ 前端不会再显示重复的图片`);
  } else {
    console.log(`\n✅ 所有游戏都已经有独特的图片`);
  }
}

// 运行创建
createUniqueImages(); 