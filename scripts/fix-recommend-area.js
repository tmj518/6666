const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '../public/games');
const gamesDataPath = path.join(__dirname, '../public/data/games.json');
const imagesAltPath = path.join(__dirname, '../public/images/games/images-alt.json');
const logPath = path.join(__dirname, '../logs/recommend-area.log');
const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

// 读取 games.json
const gamesData = require('../public/data/games.json');
const games = gamesData.games;

// 过滤掉图片或HTML页面不存在的游戏
const filteredGames = games.filter(game => {
  const imagePath = path.join(__dirname, '../public', game.image);
  const htmlPath = path.join(__dirname, '../public', game.url);
  return fs.existsSync(imagePath) && fs.existsSync(htmlPath);
});

// 这里可以继续用 filteredGames 生成推荐区HTML
// 例如：generateRecommendAreaHTML(filteredGames, ...)

console.log(`有效推荐游戏数量: ${filteredGames.length}`);

// 日志函数
function writeLog(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logPath, line);
  console.log(msg);
}

// 读取游戏数据
function getGamesData() {
  try {
    const data = fs.readFileSync(gamesDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    writeLog('读取games.json失败: ' + error);
    return { games: [] };
  }
}

// 读取图片alt数据
function getImagesAltData() {
  try {
    return JSON.parse(fs.readFileSync(imagesAltPath, 'utf-8'));
  } catch {
    return {};
  }
}

// 补充 toTitleCase 函数
function toTitleCase(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// 获取图片alt/title
function getImageAltTitle(imagePath, game, imagesAltData) {
  const imageName = imagePath.split('/').pop();
  const alt = imagesAltData[imageName] || game?.title?.en || game?.title || 'HTML5 Game';
  return { alt, title: alt };
}

// 推荐区排序：高评分>新上架>原顺序
function sortGames(games) {
  return games.sort((a, b) => {
    if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
    if (b.published && a.published) return new Date(b.published) - new Date(a.published);
    return 0;
  });
}

// 生成推荐区HTML（<picture>+alt/title/webp/jpg）
function generateRecommendAreaHTML(games, title, imagesAltData) {
  const gameCards = games.map(game => {
    const imagePath = game.image || '/images/games/default.jpg';
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const { alt, title: imgTitle } = getImageAltTitle(imagePath, game, imagesAltData);
    let relativeUrl = '';
    if (game.url && typeof game.url === 'string') {
      if (game.url.startsWith('/games/')) {
        relativeUrl = game.url.replace('/games/', '');
      } else if (game.url.startsWith('/')) {
        relativeUrl = game.url.slice(1);
      } else {
        relativeUrl = game.url;
      }
    }
    if (!relativeUrl) relativeUrl = 'index.html';
    return `    <a href="${relativeUrl}" class="bg-white rounded-lg shadow p-2 w-40 hover:shadow-lg transition flex flex-col items-center">
      <picture>
        <source srcset="${webpPath}" type="image/webp">
        <img src="${imagePath}" alt="${alt}" title="${imgTitle}" class="rounded mb-1 w-28 h-20 object-cover mx-auto" loading="lazy">
      </picture>
      <h4 class="font-bold text-gray-800 text-sm mb-1 text-center">${game.title?.en || game.title || 'Game'}</h4>
      <p class="text-gray-600 text-xs text-center">${game.description?.en || game.description || 'A brand new HTML5 game!'}</p>
    </a>`;
  }).join('\n');

  return `\n<div class="mt-8 w-full max-w-2xl mx-auto">
  <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">${title}</h3>
  <div class="flex flex-wrap justify-center gap-2">
${gameCards}
  </div>
</div>\n`;
}

// 增量插入+智能去重推荐区（严格遵守 .rules 规范）
files.forEach(file => {
  const filePath = path.join(gamesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const imagesAltData = getImagesAltData();

  // 获取当前游戏URL和分类
  const currentGameUrl = `/games/${file}`;
  const gamesData = getGamesData();
  const currentGame = gamesData.games.find(g => g.url === currentGameUrl);
  const currentCategories = currentGame && currentGame.category ? currentGame.category.map(c => c.toLowerCase().replace(/[_\s]+/g, '-')) : [];

  // 推荐区候选（同类，去重，不包含本身，最多3个，不补其他分类）
  let sameCategoryGames = [];
  for (const cat of currentCategories) {
    gamesData.games.forEach(game => {
      // 分类兼容小写、下划线/中划线
      const gameCats = (game.category || []).map(c => c.toLowerCase().replace(/[_\s]+/g, '-'));
      const catMatch = gameCats.includes(cat);
      const notSelf = game.url !== currentGameUrl;
      const imgExists = fs.existsSync(path.join(__dirname, '../public', game.image));
      const htmlExists = fs.existsSync(path.join(__dirname, '../public', game.url));
      if (catMatch && notSelf && imgExists && htmlExists) {
        sameCategoryGames.push(game);
      } else {
        // 详细日志
        if (!catMatch) writeLog(`[排除] ${game.url} 分类不符: ${gameCats} vs ${cat}`);
        if (!notSelf) writeLog(`[排除] ${game.url} 是当前页面`);
        if (!imgExists) writeLog(`[排除] ${game.url} 图片不存在: ${game.image}`);
        if (!htmlExists) writeLog(`[排除] ${game.url} 页面不存在: ${game.url}`);
      }
    });
  }
  // 去重
  const seen = new Set();
  const uniqueGames = [];
  for (const g of sameCategoryGames) {
    if (!seen.has(g.url)) {
      seen.add(g.url);
      uniqueGames.push(g);
    }
    if (uniqueGames.length >= 3) break;
  }
  const sortedGames = sortGames(uniqueGames);
  if (sortedGames.length === 0) {
    writeLog(`无同类推荐区: ${file}（同类候选数: ${sameCategoryGames.length}）`);
    // 推荐区为空时插入高亮提示
    const recommendRegGlobal = /<div[^>]*>\s*<h3[^>]*>\s*More [^<]* Games[\s\S]*?<\/div>\s*<\/div>/gi;
    content = content.replace(recommendRegGlobal, '');
    const emptyTip = `\n<div class="mt-8 w-full max-w-2xl mx-auto"><div class="bg-red-100 text-red-700 p-4 rounded text-center font-bold">No valid recommendations found. Please check category, image, and page data!</div></div>\n`;
    if (content.includes('</body>')) {
      content = content.replace(/<\/body>/i, emptyTip + '\n</body>');
    } else {
      content += emptyTip;
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return;
  }

  // 生成推荐区HTML
  const newRecommendArea = generateRecommendAreaHTML(sortedGames, `More ${toTitleCase(currentCategories[0])} Games`, imagesAltData);

  // 清理所有错误信息和重复推荐区
  const errorPattern = /<div[^>]*>\s*<div[^>]*>\s*No valid recommendations found[\s\S]*?<\/div>\s*<\/div>/gi;
  const recommendRegGlobal = /<div[^>]*>\s*<h3[^>]*>\s*More [^<]* Games[\s\S]*?<\/div>\s*<\/div>/gi;
  
  // 清理错误信息
  const errorCount = (content.match(errorPattern) || []).length;
  content = content.replace(errorPattern, '');
  
  // 清理旧推荐区
  const oldCount = (content.match(recommendRegGlobal) || []).length;
  content = content.replace(recommendRegGlobal, '');

  // 增量插入：如无推荐区则插入，有则只补充缺失（本例直接覆盖，因唯一性已保证）
  if (content.includes('</body>')) {
    content = content.replace(/<\/body>/i, newRecommendArea + '\n</body>');
    writeLog(`推荐区已修复: ${file}（清理错误信息: ${errorCount}个，原有推荐区: ${oldCount}个，现有: 1个）`);
  } else {
    content += newRecommendArea;
    writeLog(`推荐区已修复(无</body>): ${file}（清理错误信息: ${errorCount}个）`);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}); 