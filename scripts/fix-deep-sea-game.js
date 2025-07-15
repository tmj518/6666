const fs = require('fs-extra');
const path = require('path');

const dataFile = path.join(__dirname, '../public/data/games.json');
const imagesDir = path.join(__dirname, '../public/images/games');

async function addDeepSeaGame() {
  try {
    // 读取现有数据
    const data = await fs.readJson(dataFile);
    const existingGames = data.games || [];
    
    console.log(`[读取] 现有游戏数量: ${existingGames.length}`);
    
    // 检查游戏是否已存在
    const gameUrl = '/games/Deep-Sea-Adventure-Survival-Game-Free.html';
    const existingIndex = existingGames.findIndex(g => g.url === gameUrl);
    
    if (existingIndex !== -1) {
      console.log(`[更新] 游戏已存在，更新分类为 new`);
      existingGames[existingIndex].category = ['new'];
      existingGames[existingIndex].published = new Date().toISOString().slice(0, 10);
    } else {
      // 生成新ID
      const newId = Math.max(...existingGames.map(g => g.id || 0)) + 1;
      
      // 创建游戏数据
      const gameData = {
        id: newId,
        title: {
          en: "Deep Sea Adventure Survival Game Free",
          zh: "深海冒险生存游戏免费版",
          ja: "Deep Sea Adventure Survival Game Free",
          ko: "Deep Sea Adventure Survival Game Free"
        },
        description: {
          en: "Play Deep Sea Adventure Survival Game Free online. This new game features: new, trending, fun. Free HTML5 game, mobile-friendly, no download.",
          zh: "在线畅玩深海冒险生存游戏免费版。本new游戏包含：new，热门，趣味。免费HTML5小游戏，手机电脑均可畅玩，无需下载。",
          ja: "Play Deep Sea Adventure Survival Game Free online. This new game features: new, trending, fun. Free HTML5 game, mobile-friendly, no download.",
          ko: "Play Deep Sea Adventure Survival Game Free online. This new game features: new, trending, fun. Free HTML5 game, mobile-friendly, no download."
        },
        image: "/images/games/new-deep-sea-adventure-survival-game-free.jpg",
        category: ["new"],
        rating: 4.8,
        developer: "AutoSync",
        published: new Date().toISOString().slice(0, 10),
        plays: "0+",
        regions: ["global"],
        url: gameUrl
      };
      
      existingGames.push(gameData);
      console.log(`[添加] 新游戏: Deep Sea Adventure Survival Game Free`);
    }
    
    // 保存更新后的数据
    await fs.writeJson(dataFile, { games: existingGames }, { spaces: 2 });
    
    console.log(`\n[完成] 操作完成:`);
    console.log(`  - 游戏: Deep Sea Adventure Survival Game Free`);
    console.log(`  - 分类: new`);
    console.log(`  - 总游戏数量: ${existingGames.length} 个`);
    console.log(`  - 数据文件: ${dataFile}`);
    
  } catch (error) {
    console.error('[错误] 操作失败:', error.message);
  }
}

// 运行脚本
addDeepSeaGame(); 