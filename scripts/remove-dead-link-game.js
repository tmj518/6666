const fs = require('fs');
const path = require('path');

// 删除有死链接的游戏
function removeDeadLinkGame() {
  console.log('🧹 开始删除有死链接的游戏...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const gamesDir = path.join(__dirname, '../public/games');
  const imagesDir = path.join(__dirname, '../public/images/games');
  const gamesDataPath = path.join(__dirname, '../public/data/games.json');
  
  // 要删除的游戏信息
  const gameToRemove = {
    slug: 'mouse-mouse-climb-the-house',
    htmlFile: 'mouse-mouse-climb-the-house.html',
    imageFiles: [
      'mouse-mouse-climb-the-house-game-unique.jpg',
      'mouse-mouse-climb-the-house-game-unique.webp'
    ]
  };
  
  console.log(`🎯 目标游戏: ${gameToRemove.slug}`);
  
  // 1. 删除HTML文件
  const htmlFilePath = path.join(gamesDir, gameToRemove.htmlFile);
  if (fs.existsSync(htmlFilePath)) {
    fs.unlinkSync(htmlFilePath);
    console.log(`✅ 已删除HTML文件: ${gameToRemove.htmlFile}`);
  } else {
    console.log(`⚠️  HTML文件不存在: ${gameToRemove.htmlFile}`);
  }
  
  // 2. 删除图片文件
  gameToRemove.imageFiles.forEach(imageFile => {
    const imagePath = path.join(imagesDir, imageFile);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`✅ 已删除图片文件: ${imageFile}`);
    } else {
      console.log(`⚠️  图片文件不存在: ${imageFile}`);
    }
  });
  
  // 3. 从games.json中删除游戏数据
  if (fs.existsSync(gamesDataPath)) {
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    const games = gamesData.games;
    
    const initialCount = games.length;
    const filteredGames = games.filter(game => {
      return !game.url.includes(gameToRemove.slug);
    });
    
    if (filteredGames.length < initialCount) {
      gamesData.games = filteredGames;
      fs.writeFileSync(gamesDataPath, JSON.stringify(gamesData, null, 2));
      console.log(`✅ 已从games.json中删除游戏数据`);
      console.log(`📊 游戏数量: ${initialCount} → ${filteredGames.length}`);
    } else {
      console.log(`⚠️  在games.json中未找到该游戏数据`);
    }
  }
  
  // 4. 更新分类统计
  const categoriesPath = path.join(__dirname, '../public/data/categories.json');
  if (fs.existsSync(categoriesPath)) {
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // 重新计算分类统计
    const gamesData = JSON.parse(fs.readFileSync(gamesDataPath, 'utf8'));
    const games = gamesData.games;
    
    const categoryCounts = {};
    games.forEach(game => {
      const category = game.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    categoriesData.categories.forEach(category => {
      category.count = categoryCounts[category.id] || 0;
    });
    
    fs.writeFileSync(categoriesPath, JSON.stringify(categoriesData, null, 2));
    console.log(`✅ 已更新分类统计`);
  }
  
  console.log('\n🎉 死链接游戏删除完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 运行脚本
removeDeadLinkGame(); 