const fs = require('fs');
const path = require('path');
const { cleanBackups } = require('./clean-backups');

// 增强的SEO配置
const seoConfig = {
  siteName: 'PlayHTML5',
  siteUrl: 'https://www.ukhtml5games.com',
  description: 'Play the best free HTML5 games online! Action, Adventure, Puzzle, Sports, Strategy games. No download required. Play instantly on any device.',
  keywords: 'HTML5 games, free games, online games, browser games, action games, adventure games, puzzle games, sports games, strategy games, mobile games, PlayHTML5, ukhtml5games',
  ogImage: 'https://www.ukhtml5games.com/images/games/logo.webp',
  twitterHandle: '@playhtml5',
  facebookPage: 'https://www.facebook.com/playhtml5',
  googleAnalyticsId: 'G-D6HWXDZW6N',
  googleSearchConsole: 'https://search.google.com/search-console',
  bingWebmasterTools: 'https://www.bing.com/webmasters',
  yandexWebmaster: 'https://webmaster.yandex.com',
  baiduWebmaster: 'https://ziyuan.baidu.com',
  languages: ['en', 'zh'],
  defaultLanguage: 'en'
};

// 读取游戏数据和图片alt信息
function loadGameData() {
  try {
    const gamesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/games.json'), 'utf-8'));
    const imagesAltData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/images/games/images-alt.json'), 'utf-8'));
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/categories.json'), 'utf-8'));
    
    // 创建游戏信息映射
    const gameMap = new Map();
    gamesData.games.forEach(game => {
      const fileName = path.basename(game.url, '.html');
      gameMap.set(fileName, game);
    });
    
    return { gameMap, imagesAltData, categoriesData };
  } catch (error) {
    console.error('❌ 读取游戏数据失败:', error.message);
    return { gameMap: new Map(), imagesAltData: {}, categoriesData: {} };
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

// 生成优化的meta标签
function generateOptimizedMetaTags(gameInfo, filePath) {
  const fileName = path.basename(filePath, '.html');
  const isHomePage = fileName === 'index';
  
  if (isHomePage) {
    return {
      title: `${seoConfig.siteName} - Free HTML5 Games | Best Online Games Platform 2024`,
      description: seoConfig.description,
      keywords: seoConfig.keywords,
      ogTitle: `${seoConfig.siteName} - Free HTML5 Games | Best Online Games Platform 2024`,
      ogDescription: seoConfig.description,
      ogImage: seoConfig.ogImage,
      twitterTitle: `${seoConfig.siteName} - Free HTML5 Games | Best Online Games Platform 2024`,
      twitterDescription: seoConfig.description,
      twitterImage: seoConfig.ogImage
    };
  }
  
  if (gameInfo) {
    const gameTitle = gameInfo.title?.en || gameInfo.title?.zh || 'HTML5 Game';
    const gameDescription = gameInfo.description?.en || gameInfo.description?.zh || 'Play this free HTML5 game online!';
    const gameImage = gameInfo.image ? `${seoConfig.siteUrl}${gameInfo.image}` : seoConfig.ogImage;
    const gameKeywords = `${gameTitle}, free HTML5 game, online game, ${gameInfo.category?.join(', ') || 'game'}, PlayHTML5`;
    
    return {
      title: `${gameTitle} - Free HTML5 Game | ${seoConfig.siteName}`,
      description: `${gameDescription} Play this free HTML5 game online without download. No registration required.`,
      keywords: gameKeywords,
      ogTitle: `${gameTitle} - Free HTML5 Game | ${seoConfig.siteName}`,
      ogDescription: gameDescription,
      ogImage: gameImage,
      twitterTitle: `${gameTitle} - Free HTML5 Game | ${seoConfig.siteName}`,
      twitterDescription: gameDescription,
      twitterImage: gameImage
    };
  }
  
  return {
    title: `HTML5 Game - ${seoConfig.siteName}`,
    description: 'Play free HTML5 games online!',
    keywords: 'HTML5 game, free game, online game, PlayHTML5',
    ogTitle: `HTML5 Game - ${seoConfig.siteName}`,
    ogDescription: 'Play free HTML5 games online!',
    ogImage: seoConfig.ogImage,
    twitterTitle: `HTML5 Game - ${seoConfig.siteName}`,
    twitterDescription: 'Play free HTML5 games online!',
    twitterImage: seoConfig.ogImage
  };
}

// 生成完整的SEO头部
function generateSEOHead(metaTags, filePath) {
  const relPath = filePath.replace(/^.*[\\\/]public[\\\/]/, '').replace(/\\/g, '/');
  const url = relPath === 'index.html' ? seoConfig.siteUrl + '/' : seoConfig.siteUrl + '/' + relPath;
  
  return `    <!-- 基础SEO标签 -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    
    <!-- 页面标题和描述 -->
    <title>${metaTags.title}</title>
    <meta name="description" content="${metaTags.description}">
    <meta name="keywords" content="${metaTags.keywords}">
    <meta name="author" content="${seoConfig.siteName} Team">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}">
    
    <!-- 多语言支持 -->
    <link rel="alternate" hreflang="en" href="${seoConfig.siteUrl}/">
    <link rel="alternate" hreflang="zh" href="${seoConfig.siteUrl}/zh/">
    <link rel="alternate" hreflang="x-default" href="${seoConfig.siteUrl}/">
    
    <!-- Open Graph标签 -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${metaTags.ogTitle}">
    <meta property="og:description" content="${metaTags.ogDescription}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="${seoConfig.siteName}">
    <meta property="og:image" content="${metaTags.ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${metaTags.ogTitle}">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card标签 -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${metaTags.twitterTitle}">
    <meta name="twitter:description" content="${metaTags.twitterDescription}">
    <meta name="twitter:image" content="${metaTags.twitterImage}">
    <meta name="twitter:image:alt" content="${metaTags.ogTitle}">
    <meta name="twitter:site" content="${seoConfig.twitterHandle}">
    
    <!-- 其他重要meta标签 -->
    <meta name="theme-color" content="#165DFF">
    <meta name="msapplication-TileColor" content="#165DFF">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${seoConfig.siteName}">
    
    <!-- DNS预解析 -->
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="https://cdn.tailwindcss.com" as="style">
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" as="style">
    
    <!-- 搜索引擎验证 -->
    <meta name="google-site-verification" content="your-google-verification-code">
    <meta name="msvalidate.01" content="your-bing-verification-code">
    <meta name="yandex-verification" content="your-yandex-verification-code">
    <meta name="baidu-site-verification" content="your-baidu-verification-code">`;
}

// 生成结构化数据
function generateStructuredData(gameInfo, filePath) {
  const fileName = path.basename(filePath, '.html');
  const isHomePage = fileName === 'index';
  const relPath = filePath.replace(/^.*[\\\/]public[\\\/]/, '').replace(/\\/g, '/');
  const url = relPath === 'index.html' ? seoConfig.siteUrl + '/' : seoConfig.siteUrl + '/' + relPath;
  
  if (isHomePage) {
    return {
      website: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": seoConfig.siteName,
        "alternateName": "UK HTML5 Games",
        "description": seoConfig.description,
        "url": seoConfig.siteUrl,
        "inLanguage": "en",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${seoConfig.siteUrl}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": seoConfig.siteName,
          "url": seoConfig.siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": seoConfig.ogImage
          }
        },
        "sameAs": [
          seoConfig.facebookPage,
          `https://twitter.com/${seoConfig.twitterHandle.replace('@', '')}`
        ]
      },
      breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": seoConfig.siteUrl
          }
        ]
      }
    };
  }
  
  if (gameInfo) {
    const gameTitle = gameInfo.title?.en || gameInfo.title?.zh || 'HTML5 Game';
    const gameDescription = gameInfo.description?.en || gameInfo.description?.zh || 'Play this free HTML5 game online!';
    const gameImage = gameInfo.image ? `${seoConfig.siteUrl}${gameInfo.image}` : seoConfig.ogImage;
    
    return {
      game: {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": gameTitle,
        "description": gameDescription,
        "image": gameImage,
        "url": url,
        "genre": gameInfo.category?.join(', ') || 'HTML5 Game',
        "gamePlatform": "HTML5",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser",
        "author": {
          "@type": "Organization",
          "name": gameInfo.developer || seoConfig.siteName
        },
        "publisher": {
          "@type": "Organization",
          "name": seoConfig.siteName
        },
        "datePublished": gameInfo.published || "2024-01-01",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": gameInfo.rating || 4.5,
          "ratingCount": gameInfo.plays || "100+"
        }
      },
      breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": seoConfig.siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": gameTitle,
            "item": url
          }
        ]
      }
    };
  }
  
  return {
    webpage: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "HTML5 Game",
      "description": "Play free HTML5 games online!",
      "url": url
    }
  };
}

// 优化图片标签
function optimizeImages(html, gameInfo, imagesAltData) {
  let newHtml = html;
  
  // 替换img标签为picture标签
  const imgRegex = /<img([^>]+)>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const attributes = match[1];
    
    // 提取src属性
    const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    
    const src = srcMatch[1];
    const imagePath = src.startsWith('/') ? src : `/${src}`;
    
    // 获取alt和title
    const imageName = path.basename(imagePath);
    const altFromImagesAlt = imagesAltData[imageName] || imagesAltData[imageName.replace('.jpg', '.webp')] || imagesAltData[imageName.replace('.webp', '.jpg')];
    
    let alt, title;
    if (altFromImagesAlt) {
      alt = altFromImagesAlt;
      title = altFromImagesAlt;
    } else if (gameInfo) {
      const gameTitle = gameInfo.title?.en || gameInfo.title?.zh || 'HTML5 Game';
      alt = `${gameTitle} - Free HTML5 Game`;
      title = gameTitle;
    } else {
      alt = 'HTML5 Game';
      title = 'HTML5 Game';
    }
    
    // 生成webp路径
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // 构建优化的picture标签
    const pictureTag = `<picture>
      <source srcset="${webpPath}" type="image/webp">
      <img src="${src}" alt="${alt}" title="${title}" loading="lazy" decoding="async">
    </picture>`;
    
    // 替换原img标签
    newHtml = newHtml.replace(fullMatch, pictureTag);
  }
  
  return newHtml;
}

// 添加性能优化标签
function addPerformanceOptimizations(html) {
  // 添加资源提示
  const resourceHints = `
    <!-- 关键资源预加载 -->
    <link rel="preload" href="/js/main.js" as="script">
    <link rel="preload" href="/js/games.js" as="script">
    <link rel="preload" href="/css/styles.css" as="style">
    
    <!-- 字体预加载 -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style">
    
    <!-- 关键图片预加载 -->
    <link rel="preload" href="/images/games/logo.webp" as="image">`;
  
  // 在head标签后添加
  return html.replace(/<head[^>]*>/i, match => match + resourceHints);
}

// 添加安全头
function addSecurityHeaders(html) {
  const securityMeta = `
    <!-- 安全头 -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">`;
  
  return html.replace(/<head[^>]*>/i, match => match + securityMeta);
}

// 优化HTML文件
function optimizeHTMLFile(filePath, gameMap, imagesAltData) {
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
  
  console.log(`\n🔧 优化文件: ${fileName}`);
  
  // 1. 生成优化的meta标签
  const metaTags = generateOptimizedMetaTags(gameInfo, filePath);
  
  // 2. 替换或添加完整的SEO头部
  const seoHead = generateSEOHead(metaTags, filePath);
  
  // 检查是否已有SEO头部
  if (!/<meta[^>]+name=["']description["']/i.test(html)) {
    // 在head标签后添加SEO头部
    html = html.replace(/<head[^>]*>/i, match => match + '\n' + seoHead);
    changed = true;
    console.log(`  ✔ 添加完整SEO头部`);
  } else {
    // 更新现有的meta标签
    html = html.replace(/<title>.*?<\/title>/i, `<title>${metaTags.title}</title>`);
    html = html.replace(/<meta[^>]+name=["']description["'][^>]+>/i, `<meta name="description" content="${metaTags.description}">`);
    html = html.replace(/<meta[^>]+name=["']keywords["'][^>]+>/i, `<meta name="keywords" content="${metaTags.keywords}">`);
    changed = true;
    console.log(`  ✔ 更新meta标签`);
  }
  
  // 3. 生成并添加结构化数据
  const structuredData = generateStructuredData(gameInfo, filePath);
  const structuredDataScripts = Object.values(structuredData).map(data => 
    `<script type="application/ld+json">\n    ${JSON.stringify(data, null, 2)}\n    </script>`
  ).join('\n    ');
  
  // 移除旧的结构化数据
  html = html.replace(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  
  // 添加新的结构化数据
  if (!html.includes('application/ld+json')) {
    html = html.replace(/<\/head>/i, `    ${structuredDataScripts}\n    </head>`);
    changed = true;
    console.log(`  ✔ 添加结构化数据`);
  }
  
  // 4. 优化图片
  const optimizedHtml = optimizeImages(html, gameInfo, imagesAltData);
  if (optimizedHtml !== html) {
    html = optimizedHtml;
    changed = true;
    console.log(`  ✔ 优化图片标签`);
  }
  
  // 5. 添加性能优化
  html = addPerformanceOptimizations(html);
  changed = true;
  console.log(`  ✔ 添加性能优化`);
  
  // 6. 添加安全头
  html = addSecurityHeaders(html);
  changed = true;
  console.log(`  ✔ 添加安全头`);
  
  // 保存修改
  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`  ✅ 文件已优化: ${filePath}`);
  } else {
    console.log(`  - 无需优化: ${filePath}`);
  }
  
  return changed;
}

// 生成SEO报告
function generateSEOReport(processedFiles, changedFiles) {
  const report = {
    generatedAt: new Date().toISOString(),
    siteInfo: {
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      description: seoConfig.description
    },
    optimizationStats: {
      totalFiles: processedFiles.length,
      optimizedFiles: changedFiles.length,
      optimizationRate: ((changedFiles.length / processedFiles.length) * 100).toFixed(1)
    },
    seoFeatures: [
      "✅ 完整的meta标签优化",
      "✅ Open Graph标签",
      "✅ Twitter Card标签",
      "✅ 结构化数据 (Schema.org)",
      "✅ 图片优化 (WebP支持)",
      "✅ 性能优化 (预加载)",
      "✅ 安全头",
      "✅ 多语言支持",
      "✅ 面包屑导航",
      "✅ 搜索引擎验证"
    ],
    recommendations: [
      "定期更新sitemap.xml",
      "监控Google Search Console",
      "优化页面加载速度",
      "添加更多内部链接",
      "创建高质量内容",
      "优化移动端体验",
      "实施AMP页面",
      "添加PWA功能"
    ]
  };
  
  fs.writeFileSync(path.join(__dirname, '../public/seo-optimization-report.json'), JSON.stringify(report, null, 2));
  console.log(`\n📊 SEO优化报告已生成: public/seo-optimization-report.json`);
}

// 主程序
function main() {
  console.log('🚀 开始SEO智能优化...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
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
  const changedFiles = [];
  
  htmlFiles.forEach(filePath => {
    try {
      const changed = optimizeHTMLFile(filePath, gameMap, imagesAltData);
      processedCount++;
      if (changed) {
        changedCount++;
        changedFiles.push(path.relative(publicDir, filePath));
      }
    } catch (error) {
      console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n📈 优化完成！`);
  console.log(`  📊 总文件数: ${processedCount}`);
  console.log(`  ✏️ 优化文件数: ${changedCount}`);
  console.log(`  ✅ 优化率: ${((changedCount / processedCount) * 100).toFixed(1)}%`);
  
  // 生成SEO报告
  generateSEOReport(htmlFiles, changedFiles);
  
  // 自动清理过期备份
  console.log('\n🧹 开始自动清理过期备份...');
  cleanBackups();
  
  console.log('\n🎉 SEO优化完成！建议：');
  console.log('  1. 提交sitemap到搜索引擎');
  console.log('  2. 监控Google Search Console');
  console.log('  3. 测试页面加载速度');
  console.log('  4. 检查移动端体验');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  optimizeHTMLFile,
  generateSEOHead,
  generateStructuredData,
  optimizeImages
}; 