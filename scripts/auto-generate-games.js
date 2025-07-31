const fs = require('fs-extra');
const path = require('path');
const { cleanBackups } = require('./clean-backups');

// 支持的分类（与前端按钮一致，全部小写）
const CATEGORY_LIST = [
  "all", "new", "popular", "puzzle", "action", "arcade", "strategy",
  "adventure", "card", "sports", "educational", "casual"
];

const gamesDir = path.join(__dirname, '../public/games');
const imagesDir = path.join(__dirname, '../public/images/games');
const dataFile = path.join(__dirname, '../public/data/games.json');
const backupDir = path.join(__dirname, '../backups');

function parseCategoriesFromFilename(filename) {
  const base = filename.split('.')[0];
  const parts = base.split('_');
  const categories = [];
  for (const part of parts) {
    if (CATEGORY_LIST.includes(part.toLowerCase())) {
      categories.push(part.toLowerCase());
    } else {
      break;
    }
  }
  return categories.length ? categories : ["other"];
}

function toTitleCase(str) {
  return str.replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
}

async function readExistingGames() {
  try {
    if (await fs.pathExists(dataFile)) {
      const content = await fs.readFile(dataFile, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : (data.games || []);
    }
  } catch (error) {
    console.log('[读取现有数据] 文件不存在或格式错误，将创建新数据');
  }
  return [];
}

async function backupData() {
  try {
    await fs.ensureDir(backupDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `games-backup-${timestamp}.json`);
    if (await fs.pathExists(dataFile)) {
      await fs.copy(dataFile, backupPath);
      console.log(`[备份] 数据已备份到: ${backupPath}`);
    }
  } catch (error) {
    console.error('[备份] 备份失败:', error.message);
  }
}

function removeDuplicates(games) {
  const seen = new Set();
  const uniqueGames = [];
  let duplicateCount = 0;
  
  // 检查重复的URL
  for (const game of games) {
    const key = game.url || game.title?.en || game.title;
    if (seen.has(key)) {
      duplicateCount++;
      console.log(`[去重] 发现重复游戏: ${game.title?.en || game.title}`);
      continue;
    }
    seen.add(key);
    uniqueGames.push(game);
  }
  
  // 检查重复的图片
  const imageMap = new Map();
  const gamesWithUniqueImages = [];
  let imageDuplicateCount = 0;
  
  for (const game of uniqueGames) {
    const image = game.image;
    if (imageMap.has(image)) {
      imageDuplicateCount++;
      console.log(`[去重] 发现重复图片: ${game.title?.en || game.title} 使用 ${image}`);
      
      // 为重复图片的游戏生成新的图片路径
      const baseName = game.title?.en?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'game';
      const category = game.category?.[0] || 'other';
      game.image = `/images/games/${category}-${baseName}.jpg`;
      console.log(`[修复] 更新图片路径: ${game.image}`);
    }
    imageMap.set(image, game);
    gamesWithUniqueImages.push(game);
  }
  
  if (duplicateCount > 0) {
    console.log(`[去重] 移除 ${duplicateCount} 个重复游戏`);
  }
  if (imageDuplicateCount > 0) {
    console.log(`[去重] 修复 ${imageDuplicateCount} 个重复图片`);
  }
  
  return gamesWithUniqueImages;
}

function sortGames(games) {
  return games.sort((a, b) => {
    const dateA = new Date(a.published || '1970-01-01');
    const dateB = new Date(b.published || '1970-01-01');
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    const ratingA = parseFloat(a.rating) || 0;
    const ratingB = parseFloat(b.rating) || 0;
    if (ratingA > ratingB) return -1;
    if (ratingA < ratingB) return 1;
    const playsA = parseInt(a.plays) || 0;
    const playsB = parseInt(b.plays) || 0;
    if (playsA > playsB) return -1;
    if (playsA < playsB) return 1;
    return 0;
  });
}

function generateNewId(existingGames) {
  if (existingGames.length === 0) return 1;
  return Math.max(...existingGames.map(g => g.id || 0)) + 1;
}

// 智能SEO描述生成
function smartDescription({ base, categories, image, filename }) {
  // 英文关键词
  const EN_KEYWORDS = {
    duck: 'duck, relaxing, nature',
    memory: 'memory, brain training, cognitive',
    puzzle: 'puzzle, logic, brain',
    card: 'card, solitaire, classic',
    sports: 'sports, action, challenge',
    adventure: 'adventure, explore, quest',
    new: 'new, trending, hot',
    popular: 'popular, trending, best',
    action: 'action, fast, exciting',
    educational: 'educational, learning, kids',
    strategy: 'strategy, thinking, plan',
    arcade: 'arcade, retro, fun',
    casual: 'casual, easy, relax',
  };
  // 中文关键词
  const ZH_KEYWORDS = {
    duck: '鸭子, 休闲, 自然',
    memory: '记忆, 大脑训练, 益智',
    puzzle: '益智, 逻辑, 动脑',
    card: '纸牌, 接龙, 经典',
    sports: '体育, 动作, 挑战',
    adventure: '冒险, 探索, 闯关',
    new: '新游, 热门, 推荐',
    popular: '热门, 流行, 精选',
    action: '动作, 刺激, 快节奏',
    educational: '教育, 学习, 儿童',
    strategy: '策略, 思考, 规划',
    arcade: '街机, 复古, 趣味',
    casual: '休闲, 简单, 放松',
  };
  // 关键词提取
  const lower = base.toLowerCase();
  let enTags = [], zhTags = [];
  for (const cat of categories) {
    if (EN_KEYWORDS[cat]) enTags.push(EN_KEYWORDS[cat]);
    if (ZH_KEYWORDS[cat]) zhTags.push(ZH_KEYWORDS[cat]);
  }
  if (/duck|ya|鸭/.test(lower)) {
    enTags.push(EN_KEYWORDS.duck);
    zhTags.push(ZH_KEYWORDS.duck);
  }
  if (/memory|mem/.test(lower)) {
    enTags.push(EN_KEYWORDS.memory);
    zhTags.push(ZH_KEYWORDS.memory);
  }
  if (/puzzle|2048|match/.test(lower)) {
    enTags.push(EN_KEYWORDS.puzzle);
    zhTags.push(ZH_KEYWORDS.puzzle);
  }
  // 英文描述
  let enDesc = `Play ${toTitleCase(base)} online. `;
  if (enTags.length) enDesc += `This ${categories[0]} game features: ${[...new Set(enTags)].join(', ')}. `;
  enDesc += 'Free HTML5 game, mobile-friendly, no download.';
  // 中文描述
  let zhDesc = `在线畅玩${toTitleCase(base)}。`;
  if (zhTags.length) zhDesc += `本${categories[0]}游戏包含：${[...new Set(zhTags)].join('，')}。`;
  zhDesc += ' 免费HTML5小游戏，手机电脑均可畅玩，无需下载。';
  return { en: enDesc, zh: zhDesc };
}

// 新增：命令行参数解析，支持 --file ce12 --category new
const argv = process.argv.slice(2);
let cliFile = null;
let cliCategory = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--file' && argv[i + 1]) cliFile = argv[i + 1];
  if (argv[i] === '--category' && argv[i + 1]) cliCategory = argv[i + 1].toLowerCase();
}

(async () => {
  await backupData();
  const existingGames = await readExistingGames();
  console.log(`[读取] 现有游戏数量: ${existingGames.length}`);
  let htmlFiles = (await fs.readdir(gamesDir)).filter(f => f.endsWith('.html'));
  let imageFiles = await fs.readdir(imagesDir);

  // 只处理指定文件
  if (cliFile) {
    htmlFiles = htmlFiles.filter(f => path.basename(f, '.html').toLowerCase() === cliFile.toLowerCase() || path.basename(f, '.html').toLowerCase() === `${cliCategory || ''}_${cliFile}`.toLowerCase());
    imageFiles = imageFiles.filter(f => path.basename(f, path.extname(f)).toLowerCase() === `${cliCategory || ''}-${cliFile}`.toLowerCase() || path.basename(f, path.extname(f)).toLowerCase() === cliFile.toLowerCase());
    if (htmlFiles.length === 0) {
      console.log(`❌ 未找到指定 HTML 文件: ${cliFile}`);
      return;
    }
    if (imageFiles.length === 0) {
      console.log(`❌ 未找到指定图片文件: ${cliFile}`);
      return;
    }
    console.log(`🎯 仅处理指定游戏: ${htmlFiles.join(', ')}，图片: ${imageFiles.join(', ')}`);
  }

  const existingUrls = new Set(existingGames.map(g => g.url));
  const newGames = [];
  let insertCount = 0;
  let updateCount = 0;
  for (const html of htmlFiles) {
    const base = path.basename(html, '.html');
    // 分类自动推断（优先从命令行参数，其次HTML文件名）
    let category = 'other';
    let gameName = base;
    if (cliCategory) {
      category = cliCategory;
      gameName = cliFile || base;
    } else {
      // 支持多种命名格式：new-free, new_free, newFree
      const parts = base.split(/[-_]/);
      if (parts.length > 1) {
        const firstPart = parts[0].toLowerCase();
        if (CATEGORY_LIST.includes(firstPart)) {
          category = firstPart;
          gameName = parts.slice(1).join('-');
        } else {
          category = 'other';
          gameName = base;
        }
      } else {
        // 检查是否以分类开头：newFree -> new
        for (const cat of CATEGORY_LIST) {
          if (base.toLowerCase().startsWith(cat.toLowerCase())) {
            category = cat;
            gameName = base.substring(cat.length).replace(/^[-_]/, '');
            break;
          }
        }
        if (category === 'other') {
          category = 'other';
          gameName = base;
        }
      }
      if (!CATEGORY_LIST.includes(category)) {
        category = 'other';
      }
    }
    const categories = [category];
    // 规范化图片名（优先webp，无则jpg）
    const safeBase = `${category}-${gameName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // 多种图片查找策略
    let image = '';
    const possibleImageNames = [
      `${safeBase}.webp`,
      `${safeBase}.jpg`, 
      `${safeBase}.png`,
      `${gameName}.webp`,
      `${gameName}.jpg`,
      `${gameName}.png`,
      `${base}.webp`,
      `${base}.jpg`,
      `${base}.png`,
      // 支持双重前缀：new-new-free.jpg
      `${category}-${category}-${gameName}.webp`,
      `${category}-${category}-${gameName}.jpg`,
      `${category}-${category}-${gameName}.png`
    ];
    
    for (const imgName of possibleImageNames) {
      if (imageFiles.includes(imgName)) {
        image = imgName;
        break;
      }
    }
    
    if (!image) {
      console.log(`⚠️ [跳过] 未找到规范图片: ${html} 期望: ${possibleImageNames.slice(0, 3).join('/')} 或 ${gameName}.webp/.jpg/.png`);
      continue;
    }
    // 根据分类自动添加前缀到标题
    const categoryPrefix = {
      'new': 'New ',
      'popular': 'Popular ',
      'action': 'Action ',
      'adventure': 'Adventure ',
      'arcade': 'Arcade ',
      'strategy': 'Strategy ',
      'puzzle': 'Puzzle ',
      'card': 'Card ',
      'sports': 'Sports ',
      'educational': 'Educational ',
      'casual': 'Casual '
    };
    
    const prefix = categoryPrefix[category] || '';
    const displayGameName = toTitleCase(gameName);
    const englishTitle = `${prefix}${displayGameName} Game`;
    // 智能SEO描述生成
    const smartDesc = smartDescription({ base, categories, image, filename: html });
    const gameUrl = `/games/${html}`;
    const gameData = {
      title: {
        en: englishTitle,
        zh: englishTitle,
        ja: englishTitle,
        ko: englishTitle
      },
      description: {
        en: smartDesc.en,
        zh: smartDesc.zh,
        ja: smartDesc.en,
        ko: smartDesc.en
      },
      image: `/images/games/${image}`,
      category: categories,
      rating: 4.8,
      developer: "AutoSync",
      published: new Date().toISOString().slice(0, 10),
      plays: "0+",
      regions: ["global"],
      url: gameUrl
    };
    if (existingUrls.has(gameUrl)) {
      const existingIndex = existingGames.findIndex(g => g.url === gameUrl);
      if (existingIndex !== -1) {
        gameData.id = existingGames[existingIndex].id;
        gameData.plays = existingGames[existingIndex].plays;
        if (existingGames[existingIndex].category && existingGames[existingIndex].category[0] !== 'other') {
          gameData.category = existingGames[existingIndex].category;
        }
        if (existingGames[existingIndex].description && existingGames[existingIndex].description.en && !/other game/i.test(existingGames[existingIndex].description.en)) {
          gameData.description = existingGames[existingIndex].description;
        }
        if (existingGames[existingIndex].image && existingGames[existingIndex].image !== '') {
          gameData.image = existingGames[existingIndex].image;
        }
        existingGames[existingIndex] = gameData;
        updateCount++;
        console.log(`[更新] 游戏: ${englishTitle}`);
      }
    } else {
      gameData.id = generateNewId(existingGames.concat(newGames));
      newGames.push(gameData);
      insertCount++;
      console.log(`[插入] 新游戏: ${englishTitle}`);
    }
  }
  const allGames = [...existingGames, ...newGames];
  const uniqueGames = removeDuplicates(allGames);
  const sortedGames = sortGames(uniqueGames);
  await fs.ensureDir(path.dirname(dataFile));
  await fs.writeJson(dataFile, { games: sortedGames }, { spaces: 2 });
  console.log(`[增量插入] 操作完成:`);
  console.log(`  - 插入新游戏: ${insertCount} 个`);
  console.log(`  - 更新现有游戏: ${updateCount} 个`);
  console.log(`  - 总游戏数量: ${sortedGames.length} 个`);
  console.log(`  - 数据文件: ${dataFile}`);
  // 自动清理过期备份
  console.log('\n🧹 开始自动清理过期备份...');
  cleanBackups();
})(); 