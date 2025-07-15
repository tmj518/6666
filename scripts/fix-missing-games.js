const fs = require('fs-extra');
const path = require('path');

const dataFile = path.join(__dirname, '../public/data/games.json');
const imagesDir = path.join(__dirname, '../public/images/games');

// 被跳过的游戏列表（文件名 -> 期望的图片名）
const missingGames = [
  {
    htmlFile: 'Popular-ce66 Game.html',
    imageFile: 'popular-ce66-game.jpg', // 实际存在的图片
    category: 'popular',
    title: 'Popular Ce66 Game'
  },
  {
    htmlFile: 'adventure-in3tiaotiao.html',
    imageFile: 'adventure-in3tiaotiao.jpg', // 实际存在的图片
    category: 'adventure',
    title: 'Adventure In3tiaotiao Game'
  },
  {
    htmlFile: 'arcade-t66.html',
    imageFile: 'arcade-t66-game.jpg', // 实际存在的图片
    category: 'arcade',
    title: 'Arcade T66 Game'
  },
  {
    htmlFile: 'in3tiaotiao.html',
    imageFile: 'adventure-in3tiaotiao.jpg', // 使用现有图片
    category: 'adventure',
    title: 'In3tiaotiao Game'
  },
  {
    htmlFile: 'new-666.html',
    imageFile: 'new-new-666.jpg', // 实际存在的图片
    category: 'new',
    title: 'New 666 Game'
  },
  {
    htmlFile: 'new-ce12.html',
    imageFile: 'new-new-ce12.jpg', // 实际存在的图片
    category: 'new',
    title: 'New Ce12 Game'
  },
  {
    htmlFile: 'popular-777.html',
    imageFile: 'popular-popular-777.jpg', // 实际存在的图片
    category: 'popular',
    title: 'Popular 777 Game'
  }
];

async function fixMissingGames() {
  try {
    // 读取现有数据
    const data = await fs.readJson(dataFile);
    const existingGames = data.games || [];
    
    console.log(`[读取] 现有游戏数量: ${existingGames.length}`);
    
    // 检查图片文件是否存在
    const imageFiles = await fs.readdir(imagesDir);
    console.log(`[检查] 图片目录中的文件数量: ${imageFiles.length}`);
    
    let addedCount = 0;
    
    for (const game of missingGames) {
      // 检查图片是否存在
      if (!imageFiles.includes(game.imageFile)) {
        console.log(`⚠️ [跳过] 图片不存在: ${game.imageFile}`);
        continue;
      }
      
      // 检查游戏是否已存在
      const gameUrl = `/games/${game.htmlFile}`;
      const existingIndex = existingGames.findIndex(g => g.url === gameUrl);
      
      if (existingIndex !== -1) {
        console.log(`[跳过] 游戏已存在: ${game.title}`);
        continue;
      }
      
      // 生成新ID
      const newId = Math.max(...existingGames.map(g => g.id || 0)) + 1;
      
      // 创建游戏数据
      const gameData = {
        id: newId,
        title: {
          en: game.title,
          zh: game.title,
          ja: game.title,
          ko: game.title
        },
        description: {
          en: `Play ${game.title} online. This ${game.category} game features: ${game.category}, trending, fun. Free HTML5 game, mobile-friendly, no download.`,
          zh: `在线畅玩${game.title}。本${game.category}游戏包含：${game.category}，热门，趣味。免费HTML5小游戏，手机电脑均可畅玩，无需下载。`,
          ja: `Play ${game.title} online. This ${game.category} game features: ${game.category}, trending, fun. Free HTML5 game, mobile-friendly, no download.`,
          ko: `Play ${game.title} online. This ${game.category} game features: ${game.category}, trending, fun. Free HTML5 game, mobile-friendly, no download.`
        },
        image: `/images/games/${game.imageFile}`,
        category: [game.category],
        rating: 4.8,
        developer: "AutoSync",
        published: new Date().toISOString().slice(0, 10),
        plays: "0+",
        regions: ["global"],
        url: gameUrl
      };
      
      existingGames.push(gameData);
      addedCount++;
      console.log(`[添加] 新游戏: ${game.title}`);
    }
    
    // 保存更新后的数据
    await fs.writeJson(dataFile, { games: existingGames }, { spaces: 2 });
    
    console.log(`\n[完成] 修复操作完成:`);
    console.log(`  - 添加新游戏: ${addedCount} 个`);
    console.log(`  - 总游戏数量: ${existingGames.length} 个`);
    console.log(`  - 数据文件: ${dataFile}`);
    
  } catch (error) {
    console.error('[错误] 修复失败:', error.message);
  }
}

// 运行修复脚本
fixMissingGames(); 