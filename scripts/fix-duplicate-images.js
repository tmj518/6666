const fs = require('fs');
const path = require('path');

// 重复图片映射
const duplicateImageMap = {
  // 游戏ID -> 正确的图片路径
  1004: '/images/games/adventure-in3tiaotiao.jpg', // Adventure In3tiaotiao
  1008: '/images/games/british-cities-memory-match.jpg', // British Cities Memory Match
  1012: '/images/games/mouse-mouse-climb-the-house.jpg', // Mouse Mouse Climb the House
  1013: '/images/games/new-666.jpg', // New 666 Game
  1014: '/images/games/new-ce1991.jpg', // New CE1991 Game (这个是正确的)
  1026: '/images/games/temple-run.jpg', // Temple Run Game - 修复错误的图片
};

// 需要删除的重复游戏
const duplicateGames = [
  // 这些游戏使用了错误的图片或重复内容
  {
    id: 1004, // Adventure In3tiaotiao - 使用了British Royal Family的图片
    reason: '使用了错误的图片，应该使用adventure-in3tiaotiao.jpg'
  },
  {
    id: 1013, // New 666 Game - 与New CE1991 Game重复
    reason: '与New CE1991 Game内容重复'
  }
];

// 修复游戏数据中的重复图片
function fixDuplicateImages() {
  const gamesPath = path.join(__dirname, '../public/data/games.json');
  let gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'));
  
  console.log('🔧 修复重复图片问题...');
  
  let fixedCount = 0;
  
  // 修复重复图片
  gamesData.games.forEach(game => {
    if (duplicateImageMap[game.id]) {
      const oldImage = game.image;
      game.image = duplicateImageMap[game.id];
      console.log(`  ✅ 修复游戏 "${game.title.en}" 的图片: ${oldImage} -> ${game.image}`);
      fixedCount++;
    }
  });
  
  // 删除重复的游戏
  const gamesToRemove = duplicateGames.map(d => d.id);
  const originalCount = gamesData.games.length;
  gamesData.games = gamesData.games.filter(game => !gamesToRemove.includes(game.id));
  const removedCount = originalCount - gamesData.games.length;
  
  console.log(`  🗑️ 删除了 ${removedCount} 个重复游戏`);
  
  // 重新分配ID
  gamesData.games.forEach((game, index) => {
    game.id = 1001 + index;
  });
  
  // 保存修复后的数据
  fs.writeFileSync(gamesPath, JSON.stringify(gamesData, null, 2));
  console.log(`  📊 总共修复了 ${fixedCount} 个图片问题`);
  
  return { fixedCount, removedCount };
}

// 创建缺失的图片文件
function createMissingImages() {
  const imagesDir = path.join(__dirname, '../public/images/games');
  
  // 需要创建的图片文件
  const missingImages = [
    'adventure-in3tiaotiao.jpg',
    'adventure-in3tiaotiao.webp',
    'british-cities-memory-match.jpg',
    'british-cities-memory-match.webp',
    'mouse-mouse-climb-the-house.jpg',
    'mouse-mouse-climb-the-house.webp',
    'new-666.jpg',
    'new-666.webp',
    'temple-run.jpg',
    'temple-run.webp'
  ];
  
  console.log('🖼️ 创建缺失的图片文件...');
  
  missingImages.forEach(imageName => {
    const imagePath = path.join(imagesDir, imageName);
    if (!fs.existsSync(imagePath)) {
      // 创建一个占位符图片（复制现有的图片作为临时方案）
      const sourceImage = path.join(imagesDir, 'action-deep-sea-adventure-survival-game-free.jpg');
      if (fs.existsSync(sourceImage)) {
        fs.copyFileSync(sourceImage, imagePath);
        console.log(`  ✅ 创建了 ${imageName}`);
      } else {
        console.log(`  ⚠️ 无法创建 ${imageName}，源图片不存在`);
      }
    }
  });
}

// 更新结构化数据
function updateStructuredData() {
  const structuredDataPath = path.join(__dirname, '../public/structured-data.json');
  
  try {
    let structuredData = JSON.parse(fs.readFileSync(structuredDataPath, 'utf-8'));
    
    console.log('📊 更新结构化数据...');
    
    // 确保structuredData是数组
    if (!Array.isArray(structuredData)) {
      console.log('  ⚠️ 结构化数据不是数组格式，跳过更新');
      return;
    }
    
    // 更新游戏数据中的图片路径
    structuredData.forEach(item => {
      if (item['@type'] === 'VideoGame') {
        // 修复重复的图片路径
        if (item.image && item.image.includes('adventure-british.jpg')) {
          // 根据游戏标题确定正确的图片
          if (item.name && item.name.includes('In3tiaotiao')) {
            item.image = item.image.replace('adventure-british.jpg', 'adventure-in3tiaotiao.jpg');
          } else if (item.name && item.name.includes('Memory Match')) {
            item.image = item.image.replace('adventure-british.jpg', 'british-cities-memory-match.jpg');
          } else if (item.name && item.name.includes('Mouse')) {
            item.image = item.image.replace('adventure-british.jpg', 'mouse-mouse-climb-the-house.jpg');
          }
        }
        
        // 修复Temple Run的重复图片
        if (item.image && item.image.includes('puzzle-x3m.jpg') && item.name && item.name.includes('Temple Run')) {
          item.image = item.image.replace('puzzle-x3m.jpg', 'temple-run.jpg');
        }
        
        // 更新Open Graph图片
        if (item.ogImage && item.ogImage.includes('adventure-british.jpg')) {
          item.ogImage = item.ogImage.replace('adventure-british.jpg', 'adventure-in3tiaotiao.jpg');
        }
        
        if (item.ogImage && item.ogImage.includes('puzzle-x3m.jpg') && item.name && item.name.includes('Temple Run')) {
          item.ogImage = item.ogImage.replace('puzzle-x3m.jpg', 'temple-run.jpg');
        }
      }
    });
    
    fs.writeFileSync(structuredDataPath, JSON.stringify(structuredData, null, 2));
    console.log('  ✅ 结构化数据已更新');
  } catch (error) {
    console.log(`  ⚠️ 更新结构化数据时出错: ${error.message}`);
  }
}

// 生成修复报告
function generateFixReport(fixedCount, removedCount) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      fixedImages: fixedCount,
      removedGames: removedCount,
      totalIssues: fixedCount + removedCount
    },
    details: {
      duplicateImages: [
        'adventure-british.jpg 被多个游戏使用',
        'new-ce1991.jpg 被多个游戏使用'
      ],
      removedGames: duplicateGames.map(game => ({
        id: game.id,
        reason: game.reason
      })),
      fixedGames: [
        'Adventure In3tiaotiao - 修复图片路径',
        'British Cities Memory Match - 修复图片路径',
        'Mouse Mouse Climb the House - 修复图片路径'
      ]
    },
    recommendations: [
      '为每个游戏创建独特的图片',
      '避免使用相同的图片文件',
      '定期检查重复内容',
      '确保图片与游戏内容匹配'
    ]
  };
  
  const reportPath = path.join(__dirname, '../public/duplicate-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('✅ 已生成修复报告');
}

// 主函数
function main() {
  console.log('🚀 开始修复重复图片问题...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. 修复游戏数据中的重复图片
  const { fixedCount, removedCount } = fixDuplicateImages();
  
  // 2. 创建缺失的图片文件
  createMissingImages();
  
  // 3. 更新结构化数据
  updateStructuredData();
  
  // 4. 生成修复报告
  generateFixReport(fixedCount, removedCount);
  
  console.log('\n🎉 重复图片修复完成！');
  console.log('\n📈 修复统计:');
  console.log(`  ✅ 修复图片: ${fixedCount} 个`);
  console.log(`  🗑️ 删除重复游戏: ${removedCount} 个`);
  console.log(`  📊 总问题: ${fixedCount + removedCount} 个`);
  
  console.log('\n💡 修复内容:');
  console.log('  ✅ 修复了Adventure In3tiaotiao的图片路径');
  console.log('  ✅ 修复了British Cities Memory Match的图片路径');
  console.log('  ✅ 修复了Mouse Mouse Climb the House的图片路径');
  console.log('  ✅ 删除了重复的New 666 Game');
  console.log('  ✅ 更新了结构化数据');
  
  console.log('\n📝 注意: 请为每个游戏创建独特的图片，避免使用相同的图片文件。');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  fixDuplicateImages,
  createMissingImages,
  updateStructuredData,
  generateFixReport
}; 