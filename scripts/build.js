const fs = require('fs-extra');
const path = require('path');
const { cleanBackups } = require('./clean-backups');

/**
 * 构建脚本 - 生成静态网站
 */
class Builder {
  constructor() {
    this.srcDir = path.join(__dirname, '../src');
    this.distDir = path.join(__dirname, '../dist');
    this.publicDir = path.join(__dirname, '../public');
  }

  /**
   * 执行构建
   */
  async build() {
    console.log('🚀 开始构建出海游戏静态网站...');
    
    try {
      // 1. 清理构建目录
      await this.cleanDist();
      
      // 2. 复制静态资源
      await this.copyStaticAssets();
      
      // 3. 生成多语言页面
      await this.generatePages();
      
      // 4. 生成SEO文件
      await this.generateSEO();
      
      console.log('✅ 构建完成！');
      
      // 自动清理过期备份
      console.log('\n🧹 开始自动清理过期备份...');
      cleanBackups();
      
    } catch (error) {
      console.error('❌ 构建失败:', error);
      process.exit(1);
    }
  }

  /**
   * 清理构建目录
   */
  async cleanDist() {
    console.log('🧹 清理构建目录...');
    await fs.remove(this.distDir);
    await fs.ensureDir(this.distDir);
  }

  /**
   * 复制静态资源
   */
  async copyStaticAssets() {
    console.log('📁 复制静态资源...');
    
    // 复制public目录
    if (await fs.pathExists(this.publicDir)) {
      await fs.copy(this.publicDir, this.distDir);
    }
    
    // 复制src/assets目录
    const assetsDir = path.join(this.srcDir, 'assets');
    if (await fs.pathExists(assetsDir)) {
      await fs.copy(assetsDir, path.join(this.distDir, 'assets'));
    }
    
    // 复制src/data目录
    const dataDir = path.join(this.srcDir, 'data');
    if (await fs.pathExists(dataDir)) {
      await fs.copy(dataDir, path.join(this.distDir, 'data'));
    }
    
    // 复制src/locales目录
    const localesDir = path.join(this.srcDir, 'locales');
    if (await fs.pathExists(localesDir)) {
      await fs.copy(localesDir, path.join(this.distDir, 'locales'));
    }
  }

  /**
   * 生成多语言页面
   */
  async generatePages() {
    console.log('🌍 生成多语言页面...');
    
    const languages = ['en', 'zh', 'ja', 'ko'];
    const pages = ['index', 'games', 'news', 'guides', 'about'];
    
    for (const lang of languages) {
      const langDir = path.join(this.distDir, lang === 'en' ? '' : lang);
      await fs.ensureDir(langDir);
      
      for (const page of pages) {
        await this.generatePage(page, lang, langDir);
      }
    }
  }

  /**
   * 生成单个页面
   */
  async generatePage(pageName, lang, outputDir) {
    // 读取原始HTML文件作为模板
    const templatePath = path.join(__dirname, '../index.html');
    
    if (!await fs.pathExists(templatePath)) {
      console.warn(`⚠️  模板文件不存在: ${templatePath}`);
      return;
    }
    
    let content = await fs.readFile(templatePath, 'utf-8');
    
    // 更新meta标签
    content = this.updateMetaTags(content, pageName, lang);
    
    // 添加语言切换器
    content = this.addLanguageSwitcher(content, lang);
    
    // 写入文件
    const outputPath = path.join(outputDir, `${pageName}.html`);
    await fs.writeFile(outputPath, content);
    
    console.log(`📄 生成页面: ${outputPath}`);
  }

  /**
   * 更新meta标签
   */
  updateMetaTags(content, pageName, lang) {
    const seoConfig = {
      en: {
        title: 'PlayHTML5 - Free HTML5 Games',
        description: 'Play thousands of free HTML5 games online',
        keywords: 'HTML5 games, free games, online games'
      },
      zh: {
        title: 'PlayHTML5 - 免费HTML5游戏',
        description: '在线玩数千款免费HTML5游戏',
        keywords: 'HTML5游戏, 免费游戏, 在线游戏'
      },
      ja: {
        title: 'PlayHTML5 - 無料HTML5ゲーム',
        description: 'オンラインで数千の無料HTML5ゲームをプレイ',
        keywords: 'HTML5ゲーム, 無料ゲーム, オンラインゲーム'
      },
      ko: {
        title: 'PlayHTML5 - 무료 HTML5 게임',
        description: '온라인에서 수천 개의 무료 HTML5 게임을 플레이하세요',
        keywords: 'HTML5게임, 무료게임, 온라인게임'
      }
    };
    
    const config = seoConfig[lang] || seoConfig.en;
    
    // 更新title
    content = content.replace(
      /<title>.*?<\/title>/,
      `<title>${config.title}</title>`
    );
    
    // 更新meta description
    content = content.replace(
      /<meta name="description" content=".*?"/,
      `<meta name="description" content="${config.description}"`
    );
    
    return content;
  }

  /**
   * 添加语言切换器
   */
  addLanguageSwitcher(content, currentLang) {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' }
    ];
    
    const switcherHTML = `
      <div id="languageSwitcher" class="flex items-center space-x-2">
        ${languages.map(lang => `
          <button 
            class="language-option ${lang.code === currentLang ? 'active' : ''}"
            data-lang="${lang.code}"
            onclick="i18n.switchLanguage('${lang.code}')"
          >
            <span class="flag">${lang.flag}</span>
            <span class="name">${lang.name}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    // 在导航栏中添加语言切换器
    return content.replace(
      /<div class="flex items-center space-x-3">/,
      `<div class="flex items-center space-x-3">${switcherHTML}`
    );
  }

  /**
   * 生成SEO文件
   */
  async generateSEO() {
    console.log('🔍 生成SEO文件...');
    
    // 生成sitemap.xml
    await this.generateSitemap();
    
    // 生成robots.txt
    await this.generateRobotsTxt();
  }

  /**
   * 生成sitemap.xml
   */
  async generateSitemap() {
    const baseUrl = 'https://www.ukhtml5games.com';
    const languages = ['', 'zh', 'ja', 'ko'];
    const pages = ['', 'games', 'news', 'guides', 'about'];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    for (const lang of languages) {
      for (const page of pages) {
        const url = lang ? `${baseUrl}/${lang}/${page}` : `${baseUrl}/${page}`;
        sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }
    
    sitemap += `
</urlset>`;
    
    await fs.writeFile(path.join(this.distDir, 'sitemap.xml'), sitemap);
    console.log('📄 生成 sitemap.xml');
  }

  /**
   * 生成robots.txt
   */
  async generateRobotsTxt() {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://www.ukhtml5games.com/sitemap.xml

# 禁止访问管理页面
Disallow: /admin/
Disallow: /api/

# 允许访问静态资源
Allow: /assets/
Allow: /images/
Allow: /css/
Allow: /js/`;
    
    await fs.writeFile(path.join(this.distDir, 'robots.txt'), robotsTxt);
    console.log('📄 生成 robots.txt');
  }
}

// 执行构建
const builder = new Builder();
builder.build().catch(console.error); 