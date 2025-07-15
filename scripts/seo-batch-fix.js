const fs = require('fs');
const path = require('path');
const { cleanBackups } = require('./clean-backups');

// 配置默认SEO信息
const defaultSEO = {
  siteName: 'PlayHTML5',
  siteUrl: 'https://www.ukhtml5games.com',
  description: 'Free HTML5 Games Platform',
  keywords: 'HTML5 games, free games, online games, PlayHTML5',
  ogImage: 'https://www.ukhtml5games.com/images/og-image.jpg',
};

// 读取游戏数据和图片alt信息
function loadGameData() {
  try {
    const gamesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/games.json'), 'utf-8'));
    const imagesAltData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/images/games/images-alt.json'), 'utf-8'));
    
    // 创建游戏信息映射
    const gameMap = new Map();
    gamesData.games.forEach(game => {
      const fileName = path.basename(game.url, '.html');
      gameMap.set(fileName, game);
    });
    
    return { gameMap, imagesAltData };
  } catch (error) {
    console.error('❌ 读取游戏数据失败:', error.message);
    return { gameMap: new Map(), imagesAltData: {} };
  }
}

// 递归获取所有html文件
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 获取图片的alt和title信息
function getImageAltTitle(imagePath, gameInfo, imagesAltData) {
  const imageName = path.basename(imagePath);
  const altFromImagesAlt = imagesAltData[imageName] || imagesAltData[imageName.replace('.jpg', '.webp')] || imagesAltData[imageName.replace('.webp', '.jpg')];
  
  if (altFromImagesAlt) {
    return {
      alt: altFromImagesAlt,
      title: altFromImagesAlt
    };
  }
  
  if (gameInfo) {
    const title = gameInfo.title.en || gameInfo.title.zh || 'HTML5 Game';
    return {
      alt: `${title} - Free HTML5 Game`,
      title: title
    };
  }
  
  return {
    alt: 'HTML5 Game',
    title: 'HTML5 Game'
  };
}

// 替换img标签为picture标签
function replaceImgWithPicture(html, gameInfo, imagesAltData) {
  // 匹配img标签的正则表达式
  const imgRegex = /<img([^>]+)>/gi;
  let match;
  let newHtml = html;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const attributes = match[1];
    
    // 提取src属性
    const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    
    const src = srcMatch[1];
    const imagePath = src.startsWith('/') ? src : `/${src}`;
    
    // 获取alt和title
    const { alt, title } = getImageAltTitle(imagePath, gameInfo, imagesAltData);
    
    // 生成webp路径
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // 构建picture标签
    const pictureTag = `<picture>
      <source srcset="${webpPath}" type="image/webp">
      <img src="${src}" alt="${alt}" title="${title}" loading="lazy">
    </picture>`;
    
    // 替换原img标签
    newHtml = newHtml.replace(fullMatch, pictureTag);
  }
  
  return newHtml;
}

// 修复OG标签和结构化数据
function fixOGAndStructuredData(html, filePath, gameInfo) {
  let newHtml = html;
  let changed = false;
  
  // 获取相对路径
  const relPath = filePath.replace(/^.*[\\\/]public[\\\/]/, '').replace(/\\/g, '/');
  const url = relPath === 'index.html' ? defaultSEO.siteUrl + '/' : defaultSEO.siteUrl + '/' + relPath;
  
  // 修复og:url - 移除错误的绝对路径
  newHtml = newHtml.replace(
    /<meta[^>]+property=["']og:url["'][^>]+content=["'][^"']*[\\\/]C:[\\\/][^"']*["'][^>]*>/gi,
    `<meta property="og:url" content="${url}">`
  );
  
  // 修复canonical链接 - 移除错误的绝对路径
  newHtml = newHtml.replace(
    /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']*[\\\/]C:[\\\/][^"']*["'][^>]*>/gi,
    `<link rel="canonical" href="${url}">`
  );
  
  // 修复og:image - 使用游戏特定图片
  if (gameInfo && gameInfo.image) {
    const gameImageUrl = defaultSEO.siteUrl + gameInfo.image;
    newHtml = newHtml.replace(
      /<meta[^>]+property=["']og:image["'][^>]+content=["'][^"']*["'][^>]*>/gi,
      `<meta property="og:image" content="${gameImageUrl}">`
    );
    changed = true;
  }
  
  // 修复og:title - 使用游戏标题
  if (gameInfo && gameInfo.title) {
    const gameTitle = gameInfo.title.en || gameInfo.title.zh || 'HTML5 Game';
    newHtml = newHtml.replace(
      /<meta[^>]+property=["']og:title["'][^>]+content=["'][^"']*["'][^>]*>/gi,
      `<meta property="og:title" content="${gameTitle} - ${defaultSEO.siteName}">`
    );
    changed = true;
  }
  
  // 修复og:description - 使用游戏描述
  if (gameInfo && gameInfo.description) {
    const gameDesc = gameInfo.description.en || gameInfo.description.zh || defaultSEO.description;
    newHtml = newHtml.replace(
      /<meta[^>]+property=["']og:description["'][^>]+content=["'][^"']*["'][^>]*>/gi,
      `<meta property="og:description" content="${gameDesc}">`
    );
    changed = true;
  }
  
  // 修复结构化数据 - 使用游戏特定数据
  if (gameInfo) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": gameInfo.title.en || gameInfo.title.zh || 'HTML5 Game',
      "description": gameInfo.description.en || gameInfo.description.zh || defaultSEO.description,
      "image": defaultSEO.siteUrl + gameInfo.image,
      "url": url,
      "genre": gameInfo.category ? gameInfo.category.join(', ') : 'HTML5 Game',
      "gamePlatform": "HTML5",
      "applicationCategory": "Game",
      "operatingSystem": "Web Browser",
      "author": {
        "@type": "Organization",
        "name": gameInfo.developer || "PlayHTML5"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PlayHTML5"
      },
      "datePublished": gameInfo.published || "2025-01-01",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": gameInfo.rating || 4.5,
        "ratingCount": gameInfo.plays || "100+"
      }
    };
    
    newHtml = newHtml.replace(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      `<script type="application/ld+json">\n    ${JSON.stringify(structuredData, null, 2)}\n    </script>`
    );
    changed = true;
  }
  
  return { html: newHtml, changed };
}

// 检查并补全SEO标签
function fixSEO(filePath, gameMap, imagesAltData) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  // 备份原文件
  const backupPath = filePath + '.bak';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, html);
  }
  
  // 获取游戏信息
  const fileName = path.basename(filePath, '.html');
  const gameInfo = gameMap.get(fileName);
  
  console.log(`\n🔧 处理文件: ${fileName}`);
  
  // 1. 替换img标签为picture标签
  const htmlWithPicture = replaceImgWithPicture(html, gameInfo, imagesAltData);
  if (htmlWithPicture !== html) {
    html = htmlWithPicture;
    changed = true;
    console.log(`  ✔ 替换img为picture标签`);
  }
  
  // 2. 修复OG标签和结构化数据
  const { html: fixedHtml, changed: ogChanged } = fixOGAndStructuredData(html, filePath, gameInfo);
  if (ogChanged) {
    html = fixedHtml;
    changed = true;
    console.log(`  ✔ 修复OG标签和结构化数据`);
  }
  
  // 3. 基础SEO标签检查（保持原有逻辑）
  if (!/<title>.*<\/title>/i.test(html)) {
    const title = gameInfo ? (gameInfo.title.en || gameInfo.title.zh || 'HTML5 Game') : 'HTML5 Game';
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <title>${title} - ${defaultSEO.siteName}</title>`);
    changed = true;
    console.log(`  ✔ 补全title标签`);
  }
  
  if (!/<meta[^>]+name=["']description["']/i.test(html)) {
    const description = gameInfo ? (gameInfo.description.en || gameInfo.description.zh || defaultSEO.description) : defaultSEO.description;
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta name="description" content="${description}">`);
    changed = true;
    console.log(`  ✔ 补全description标签`);
  }
  
  if (!/<meta[^>]+name=["']keywords["']/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, match => match + `\n    <meta name="keywords" content="${defaultSEO.keywords}">`);
    changed = true;
    console.log(`  ✔ 补全keywords标签`);
  }
  
  // 保存修改
  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`  ✅ 文件已更新: ${filePath}`);
  } else {
    console.log(`  - 无需修改: ${filePath}`);
  }
  
  return changed;
}

// 主程序
function main() {
  console.log('🚀 开始SEO批量修复...');
  
  // 加载游戏数据
  console.log('📊 加载游戏数据...');
  const { gameMap, imagesAltData } = loadGameData();
  console.log(`  ✔ 加载了 ${gameMap.size} 个游戏信息`);
  console.log(`  ✔ 加载了 ${Object.keys(imagesAltData).length} 个图片alt信息`);
  
  // 获取所有HTML文件
  const publicDir = path.join(__dirname, '../public');
  const htmlFiles = getAllHtmlFiles(publicDir);
  console.log(`📁 找到 ${htmlFiles.length} 个HTML文件`);
  
  // 处理每个文件
  let processedCount = 0;
  let changedCount = 0;
  
  htmlFiles.forEach(filePath => {
    try {
      const changed = fixSEO(filePath, gameMap, imagesAltData);
      processedCount++;
      if (changed) changedCount++;
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n📈 处理完成！`);
  console.log(`  📊 总文件数: ${processedCount}`);
  console.log(`  ✏️ 修改文件数: ${changedCount}`);
  console.log(`  ✅ 成功率: ${((processedCount / htmlFiles.length) * 100).toFixed(1)}%`);
  
  // 自动清理过期备份
  console.log('\n🧹 开始自动清理过期备份...');
  cleanBackups();
}

main(); 