const fs = require('fs-extra');
const path = require('path');

/**
 * 游戏上传管理工具
 */
class GameUploader {
  constructor() {
    this.gamesDir = path.join(__dirname, '../public/games');
    this.imagesDir = path.join(__dirname, '../public/images/games');
    this.dataFile = path.join(__dirname, '../src/data/games.json');
    this.backupDir = path.join(__dirname, '../backups');
  }

  /**
   * 初始化目录结构
   */
  async init() {
    console.log('🚀 初始化游戏上传系统...');
    
    try {
      // 创建必要的目录
      await fs.ensureDir(this.gamesDir);
      await fs.ensureDir(this.imagesDir);
      await fs.ensureDir(this.backupDir);
      
      console.log('✅ 目录结构创建完成');
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 上传游戏文件
   */
  async uploadGame(gameData) {
    try {
      console.log(`📁 开始上传游戏: ${gameData.title}`);
      
      // 1. 备份当前数据
      await this.backupData();
      
      // 2. 复制游戏文件
      await this.copyGameFiles(gameData);
      
      // 3. 复制游戏图片
      await this.copyGameImages(gameData);
      
      // 4. 更新游戏数据
      await this.updateGameData(gameData);
      
      console.log(`✅ 游戏上传成功: ${gameData.title}`);
      return true;
      
    } catch (error) {
      console.error(`❌ 游戏上传失败: ${gameData.title}`, error);
      return false;
    }
  }

  /**
   * 复制游戏文件
   */
  async copyGameFiles(gameData) {
    const gameFileName = this.sanitizeFileName(gameData.title);
    const gameFilePath = path.join(this.gamesDir, `${gameFileName}.html`);
    
    // 如果提供了游戏文件路径，复制文件
    if (gameData.gameFilePath && await fs.pathExists(gameData.gameFilePath)) {
      await fs.copy(gameData.gameFilePath, gameFilePath);
      console.log(`📄 游戏文件已复制: ${gameFilePath}`);
    } else {
      // 创建简单的游戏页面模板
      await this.createGameTemplate(gameFilePath, gameData);
      console.log(`📄 游戏模板已创建: ${gameFilePath}`);
    }
    
    // 更新游戏数据中的URL
    gameData.url = `/games/${gameFileName}.html`;
  }

  /**
   * 复制游戏图片
   */
  async copyGameImages(gameData) {
    const imageFileName = this.sanitizeFileName(gameData.title);
    
    // 如果提供了图片文件路径，复制文件
    if (gameData.imageFilePath && await fs.pathExists(gameData.imageFilePath)) {
      const ext = path.extname(gameData.imageFilePath);
      const imagePath = path.join(this.imagesDir, `${imageFileName}${ext}`);
      await fs.copy(gameData.imageFilePath, imagePath);
      
      // 更新游戏数据中的图片URL
      gameData.image = `/images/games/${imageFileName}${ext}`;
      console.log(`🖼️ 游戏图片已复制: ${imagePath}`);
    } else {
      // 使用默认图片
      gameData.image = `https://picsum.photos/seed/${imageFileName}/400/300`;
      console.log(`🖼️ 使用默认图片: ${gameData.image}`);
    }
  }

  /**
   * 创建游戏页面模板
   */
  async createGameTemplate(filePath, gameData) {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameData.title} - PlayHTML5</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .game-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .game-title {
            font-size: 2em;
            color: #333;
            margin-bottom: 10px;
        }
        .game-description {
            color: #666;
            margin-bottom: 20px;
        }
        .game-frame {
            width: 100%;
            height: 600px;
            border: none;
            border-radius: 10px;
            background: #000;
        }
        .back-button {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .back-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <h1 class="game-title">${gameData.title}</h1>
            <p class="game-description">${gameData.description}</p>
        </div>
        
        <iframe 
            class="game-frame" 
            src="${gameData.externalUrl || 'about:blank'}"
            allowfullscreen>
        </iframe>
        
        <div style="text-align: center;">
            <a href="/" class="back-button">← 返回游戏列表</a>
        </div>
    </div>
</body>
</html>`;
    
    await fs.writeFile(filePath, template);
  }

  /**
   * 更新游戏数据
   */
  async updateGameData(gameData) {
    try {
      // 读取现有数据
      let data = { games: [] };
      if (await fs.pathExists(this.dataFile)) {
        const content = await fs.readFile(this.dataFile, 'utf-8');
        data = JSON.parse(content);
      }
      
      // 创建新游戏对象
      const newGame = {
        id: this.generateGameId(data.games),
        title: {
          en: gameData.title,
          zh: gameData.title,
          ja: gameData.title,
          ko: gameData.title
        },
        description: {
          en: gameData.description,
          zh: gameData.description,
          ja: gameData.description,
          ko: gameData.description
        },
        image: gameData.image,
        category: [gameData.category],
        rating: parseFloat(gameData.rating) || 4.0,
        developer: gameData.developer || 'Unknown',
        published: new Date().toISOString().split('T')[0],
        plays: '0+',
        regions: ['global'],
        url: gameData.url
      };
      
      // 添加到游戏列表开头
      data.games.unshift(newGame);
      
      // 写入文件
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      console.log(`📝 游戏数据已更新: ${gameData.title}`);
      
    } catch (error) {
      console.error('❌ 更新游戏数据失败:', error);
      throw error;
    }
  }

  /**
   * 生成游戏ID
   */
  generateGameId(games) {
    if (games.length === 0) return 1;
    return Math.max(...games.map(g => g.id)) + 1;
  }

  /**
   * 清理文件名
   */
  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 备份数据
   */
  async backupData() {
    if (await fs.pathExists(this.dataFile)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `games-${timestamp}.json`);
      await fs.copy(this.dataFile, backupPath);
      console.log(`💾 数据已备份: ${backupPath}`);
    }
  }

  /**
   * 批量上传游戏
   */
  async batchUpload(gamesData) {
    console.log(`🔄 开始批量上传 ${gamesData.length} 个游戏...`);
    
    const results = [];
    for (const gameData of gamesData) {
      const success = await this.uploadGame(gameData);
      results.push({ game: gameData.title, success });
    }
    
    console.log('📊 批量上传结果:');
    results.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.game}`);
    });
    
    return results;
  }

  /**
   * 列出所有游戏
   */
  async listGames() {
    try {
      if (!await fs.pathExists(this.dataFile)) {
        console.log('📝 暂无游戏数据');
        return [];
      }
      
      const content = await fs.readFile(this.dataFile, 'utf-8');
      const data = JSON.parse(content);
      
      console.log(`📋 当前共有 ${data.games.length} 个游戏:`);
      data.games.forEach(game => {
        console.log(`  - ${game.title.en} (ID: ${game.id})`);
      });
      
      return data.games;
    } catch (error) {
      console.error('❌ 获取游戏列表失败:', error);
      return [];
    }
  }

  /**
   * 删除游戏
   */
  async deleteGame(gameId) {
    try {
      // 读取数据
      const content = await fs.readFile(this.dataFile, 'utf-8');
      const data = JSON.parse(content);
      
      // 查找游戏
      const gameIndex = data.games.findIndex(g => g.id === gameId);
      if (gameIndex === -1) {
        console.log(`❌ 未找到ID为 ${gameId} 的游戏`);
        return false;
      }
      
      const game = data.games[gameIndex];
      
      // 删除游戏文件
      if (game.url && game.url.startsWith('/games/')) {
        const gameFilePath = path.join(__dirname, '..', game.url);
        if (await fs.pathExists(gameFilePath)) {
          await fs.remove(gameFilePath);
          console.log(`🗑️ 游戏文件已删除: ${gameFilePath}`);
        }
      }
      
      // 删除游戏图片
      if (game.image && game.image.startsWith('/images/games/')) {
        const imagePath = path.join(__dirname, '..', game.image);
        if (await fs.pathExists(imagePath)) {
          await fs.remove(imagePath);
          console.log(`🗑️ 游戏图片已删除: ${imagePath}`);
        }
      }
      
      // 从数据中移除
      data.games.splice(gameIndex, 1);
      
      // 保存数据
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      console.log(`✅ 游戏已删除: ${game.title.en}`);
      
      return true;
    } catch (error) {
      console.error('❌ 删除游戏失败:', error);
      return false;
    }
  }
}

// 命令行接口
async function main() {
  const uploader = new GameUploader();
  await uploader.init();
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'upload':
      if (args.length === 0) {
        console.log('用法: node upload-game.js upload <游戏数据JSON文件>');
        return;
      }
      
      const gameDataPath = args[0];
      try {
        const gameData = JSON.parse(await fs.readFile(gameDataPath, 'utf-8'));
        await uploader.uploadGame(gameData);
      } catch (error) {
        console.error('❌ 上传失败:', error);
      }
      break;
      
    case 'batch':
      if (args.length === 0) {
        console.log('用法: node upload-game.js batch <游戏数据JSON文件>');
        return;
      }
      
      const batchDataPath = args[0];
      try {
        const gamesData = JSON.parse(await fs.readFile(batchDataPath, 'utf-8'));
        await uploader.batchUpload(gamesData);
      } catch (error) {
        console.error('❌ 批量上传失败:', error);
      }
      break;
      
    case 'list':
      await uploader.listGames();
      break;
      
    case 'delete':
      if (args.length === 0) {
        console.log('用法: node upload-game.js delete <游戏ID>');
        return;
      }
      
      const gameId = parseInt(args[0]);
      await uploader.deleteGame(gameId);
      break;
      
    default:
      console.log(`
🎮 游戏上传管理工具

用法:
  node upload-game.js upload <游戏数据JSON文件>     # 上传单个游戏
  node upload-game.js batch <游戏数据JSON文件>      # 批量上传游戏
  node upload-game.js list                        # 列出所有游戏
  node upload-game.js delete <游戏ID>              # 删除游戏

示例:
  node upload-game.js upload game-data.json
  node upload-game.js batch games-batch.json
  node upload-game.js list
  node upload-game.js delete 1
      `);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = GameUploader; 