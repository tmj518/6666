const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '../public/images/games');
const outputAltFile = path.join(imagesDir, 'images-alt.json');

// 关键词和分类可根据文件名自动提取
function parseMeta(filename) {
  // 例：puzzle-2048-game.webp
  const base = filename.split('.')[0];
  const parts = base.split('-');
  // 分类在首位，游戏名中间，game结尾
  const category = parts[0] || 'game';
  const name = parts.slice(1, -1).join(' ');
  const keyword = parts.slice(1).join(' ');
  return {
    category,
    name: name || category,
    keyword: keyword || category
  };
}

function isOptimizedFile(file) {
  // 判断是否已是目标 webp/jpg 文件名
  return /^(.*)-[a-z0-9]+\.(webp|jpg)$/i.test(file);
}

// 新增：命令行参数解析，支持 --file ce12 --category new
const argv = process.argv.slice(2);
let cliFile = null;
let cliCategory = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--file' && argv[i + 1]) cliFile = argv[i + 1];
  if (argv[i] === '--category' && argv[i + 1]) cliCategory = argv[i + 1].toLowerCase();
}

const userCategory = cliCategory || (process.env.GAME_CATEGORY ? process.env.GAME_CATEGORY.toLowerCase() : null);

// 新增：辅助函数，查找同名HTML文件并推断分类
function getCategoryAndNameFromHtmlOrFilename(base) {
  const gamesDir = path.join(__dirname, '../public/games');
  const htmlFiles = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));
  
  // 优先同名HTML文件
  for (const html of htmlFiles) {
    const htmlBase = path.basename(html, '.html').toLowerCase();
    if (base.toLowerCase() === htmlBase) {
      // 解析分类（如 popular_ce66 -> popular）
      const parts = htmlBase.split('_');
      if (userCategory) {
        // 强制使用外部指定分类
        return { category: userCategory, name: htmlBase.replace(/^.*_/, '') };
      }
      if (parts.length > 1) {
        const category = parts[0];
        const name = parts.slice(1).join('-');
        return { category, name };
      } else {
        return { category: 'other', name: htmlBase };
      }
    }
  }
  
  // 否则用文件名前缀
  const parts = base.split('-');
  if (userCategory) {
    return { category: userCategory, name: base };
  }
  if (parts.length > 1) {
    const category = parts[0];
    const name = parts.slice(1).join('-');
    return { category, name };
  } else {
    return { category: 'other', name: base };
  }
}

// 1. 建立英文名-分类映射表
function buildHtmlNameCategoryMap() {
  const gamesDir = path.join(__dirname, '../public/games');
  const htmlFiles = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));
  const map = {};
  for (const html of htmlFiles) {
    let base = path.basename(html, '.html').toLowerCase();
    base = base.replace(/_/g, '-');
    let category = 'other', name = base;
    const match = base.match(/^([a-z0-9]+)[-_](.+)$/i);
    if (match) {
      category = match[1];
      name = match[2];
    }
    map[name] = category;
  }
  return map;
}

(async () => {
  console.log('🖼️ 开始图片自动化处理...');
  // 1. 读取英文名-分类映射表
  const nameCategoryMap = buildHtmlNameCategoryMap();
  // 2. 处理原始图片（jpg/jpeg/png/webp）
  let files = (await fs.readdir(imagesDir)).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (cliFile) {
    files = files.filter(f => path.basename(f, path.extname(f)).toLowerCase() === cliFile.toLowerCase());
    if (files.length === 0) {
      console.log(`❌ 未找到指定图片文件: ${cliFile}`);
      return;
    }
    console.log(`🎯 仅处理指定图片: ${files.join(', ')}`);
  }
  const altMap = {};
  const processed = new Set();
  for (const file of files) {
    // 只处理未规范命名或缺少另一格式的图片
    let base = path.basename(file, path.extname(file)).toLowerCase().replace(/_/g, '-');
    let ext = path.extname(file).toLowerCase();
    let name = base;
    let category = 'other';
    // 优先用映射表
    if (nameCategoryMap[name]) {
      category = nameCategoryMap[name];
    } else {
      // 尝试用文件名推断
      const match = base.match(/^([a-z0-9]+)[-_](.+)$/i);
      if (match) {
        category = match[1];
        name = match[2];
      }
    }
    // 只生成规范命名
    if (category === 'other') {
      console.log(`⚠️ 跳过未识别分类图片: ${file}`);
      continue;
    }
    const safeName = `${category}-${name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const webpPath = path.join(imagesDir, `${safeName}.webp`);
    const jpgPath = path.join(imagesDir, `${safeName}.jpg`);
    // 只处理未成对存在的
    if (processed.has(safeName)) continue;
    processed.add(safeName);
    let srcPath = path.join(imagesDir, file);
    // 优先用 jpg 生成 webp，再用 webp 生成 jpg
    try {
      // 生成 webp
      if (!await fs.pathExists(webpPath) && /\.(jpg|jpeg|png)$/i.test(ext)) {
        await sharp(srcPath)
          .resize({ width: 800, height: 600, fit: 'inside' })
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`✅ [webp生成] ${file} → ${safeName}.webp`);
      } else if (await fs.pathExists(webpPath)) {
        console.log(`✅ [webp已存在] ${safeName}.webp`);
      }
      // 生成 jpg
      if (!await fs.pathExists(jpgPath) && /\.(webp|png)$/i.test(ext)) {
        await sharp(srcPath)
          .resize({ width: 800, height: 600, fit: 'inside' })
          .jpeg({ quality: 80 })
          .toFile(jpgPath);
        console.log(`✅ [jpg生成] ${file} → ${safeName}.jpg`);
      } else if (await fs.pathExists(jpgPath)) {
        console.log(`✅ [jpg已存在] ${safeName}.jpg`);
      }
      // alt 文本
      const altText = `${category} ${name} html5 game, ${name} online play, free ${category} game`;
      altMap[`${safeName}.webp`] = altText;
      altMap[`${safeName}.jpg`] = altText;
    } catch (err) {
      console.error(`❌ [图片优化失败] ${file}：`, err.message);
    }
  }
  // 清理多余的 other- 前缀图片
  const allFiles = await fs.readdir(imagesDir);
  for (const file of allFiles) {
    if (/^other-.*\.(webp|jpg)$/i.test(file)) {
      await fs.remove(path.join(imagesDir, file));
      console.log(`🗑️ [清理] 已删除多余的 ${file}`);
    }
    // alt 补全
    if (/\.(webp|jpg)$/i.test(file) && !altMap[file]) {
      const base = path.basename(file, path.extname(file));
      let category = 'other', name = base;
      if (nameCategoryMap[base]) {
        category = nameCategoryMap[base];
      } else {
        const match = base.match(/^([a-z0-9]+)[-_](.+)$/i);
        if (match) {
          category = match[1];
          name = match[2];
        }
      }
      altMap[file] = `${category} ${name} html5 game, ${name} online play, free ${category} game`;
    }
  }
  // 保存 alt 文本
  await fs.writeJson(outputAltFile, altMap, { spaces: 2 });
  console.log(`📝 [alt生成] 已输出 alt 文本到 images-alt.json`);
  console.log('🎉 图片自动化处理完成！');
})(); 