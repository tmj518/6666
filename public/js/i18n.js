/**
 * 国际化管理系统
 */
class I18n {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.fallbackLang = 'en';
    this.loadedLanguages = new Set();
  }

  /**
   * 初始化国际化系统
   */
  async init() {
    // 检测用户语言
    this.detectLanguage();
    
    // 加载默认语言
    await this.loadLanguage(this.currentLang);
    
    // 更新页面内容
    this.updatePageContent();
    
    // 设置语言切换事件
    this.setupLanguageSwitcher();
  }

  /**
   * 检测用户语言
   */
  detectLanguage() {
    // 从URL参数获取语言
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (langParam && this.isValidLanguage(langParam)) {
      this.currentLang = langParam;
      return;
    }

    // 从localStorage获取语言
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && this.isValidLanguage(savedLang)) {
      this.currentLang = savedLang;
      return;
    }

    // 从浏览器语言检测
    const browserLang = navigator.language.split('-')[0];
    if (this.isValidLanguage(browserLang)) {
      this.currentLang = browserLang;
      return;
    }

    // 默认使用英文
    this.currentLang = this.fallbackLang;
  }

  /**
   * 验证语言代码是否有效
   */
  isValidLanguage(lang) {
    return ['en', 'zh', 'ja', 'ko'].includes(lang);
  }

  /**
   * 加载语言文件
   */
  async loadLanguage(lang) {
    if (this.loadedLanguages.has(lang)) {
      return;
    }

    try {
      const response = await fetch(`./src/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language: ${lang}`);
      }
      
      this.translations[lang] = await response.json();
      this.loadedLanguages.add(lang);
    } catch (error) {
      console.warn(`Using fallback language data for ${lang} due to fetch error:`, error);
      
      // 使用备用翻译数据
      this.translations[lang] = {
        common: {
          loading: lang === 'zh' ? '加载中...' : 'Loading...',
          play: lang === 'zh' ? '开始游戏' : 'Play',
          playNow: lang === 'zh' ? '立即游戏' : 'Play Now',
          addGame: lang === 'zh' ? '添加游戏' : 'Add Game',
          cancel: lang === 'zh' ? '取消' : 'Cancel',
          submit: lang === 'zh' ? '提交' : 'Submit',
          close: lang === 'zh' ? '关闭' : 'Close',
          search: lang === 'zh' ? '搜索' : 'Search',
          browse: lang === 'zh' ? '浏览' : 'Browse',
          featured: lang === 'zh' ? '精选' : 'Featured',
          popular: lang === 'zh' ? '热门' : 'Popular',
          new: lang === 'zh' ? '新游戏' : 'New',
          allGames: lang === 'zh' ? '所有游戏' : 'All Games'
        },
        categories: {
          action: lang === 'zh' ? '动作' : 'Action',
          puzzle: lang === 'zh' ? '益智' : 'Puzzle',
          strategy: lang === 'zh' ? '策略' : 'Strategy',
          adventure: lang === 'zh' ? '冒险' : 'Adventure',
          arcade: lang === 'zh' ? '街机' : 'Arcade',
          card: lang === 'zh' ? '卡牌' : 'Card',
          sports: lang === 'zh' ? '体育' : 'Sports',
          educational: lang === 'zh' ? '教育' : 'Educational'
        },
        navigation: {
          home: lang === 'zh' ? '首页' : 'Home',
          categories: lang === 'zh' ? '分类' : 'Categories',
          featuredGames: lang === 'zh' ? '精选游戏' : 'Featured Games',
          popular: lang === 'zh' ? '热门' : 'Popular',
          about: lang === 'zh' ? '关于' : 'About'
        }
      };
      this.loadedLanguages.add(lang);
    }
  }

  /**
   * 切换语言
   */
  async switchLanguage(lang) {
    if (!this.isValidLanguage(lang) || lang === this.currentLang) {
      return;
    }

    // 加载新语言
    await this.loadLanguage(lang);
    
    // 更新当前语言
    this.currentLang = lang;
    
    // 保存到localStorage
    localStorage.setItem('preferred-language', lang);
    
    // 更新URL参数
    this.updateURL(lang);
    
    // 更新页面内容
    this.updatePageContent();
    
    // 触发语言切换事件
    this.triggerLanguageChangeEvent();
  }

  /**
   * 获取翻译文本
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    
    // 遍历嵌套键
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果当前语言没有找到，尝试fallback语言
        value = this.getFallbackValue(keys);
        break;
      }
    }

    // 如果仍然没有找到，返回键名
    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // 替换参数
    return this.replaceParams(value, params);
  }

  /**
   * 获取fallback语言的翻译
   */
  getFallbackValue(keys) {
    if (this.currentLang === this.fallbackLang) {
      return null;
    }

    let value = this.translations[this.fallbackLang];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    return value;
  }

  /**
   * 替换翻译文本中的参数
   */
  replaceParams(text, params) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * 更新页面内容
   */
  updatePageContent() {
    // 更新所有带有data-i18n属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const params = this.parseParams(element.getAttribute('data-i18n-params'));
      
      if (element.tagName === 'INPUT' && element.type === 'placeholder') {
        element.placeholder = this.t(key, params);
      } else {
        element.textContent = this.t(key, params);
      }
    });

    // 更新页面标题
    this.updatePageTitle();
    
    // 更新meta描述
    this.updateMetaDescription();
  }

  /**
   * 解析参数字符串
   */
  parseParams(paramsStr) {
    if (!paramsStr) return {};
    
    try {
      return JSON.parse(paramsStr);
    } catch (error) {
      console.warn('Invalid i18n params:', paramsStr);
      return {};
    }
  }

  /**
   * 更新页面标题
   */
  updatePageTitle() {
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
  }

  /**
   * 更新meta描述
   */
  updateMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    const descKey = metaDesc?.getAttribute('data-i18n');
    if (descKey) {
      metaDesc.setAttribute('content', this.t(descKey));
    }
  }

  /**
   * 更新URL参数
   */
  updateURL(lang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  }

  /**
   * 设置语言切换器
   */
  setupLanguageSwitcher() {
    const languageSwitcher = document.getElementById('languageSwitcher');
    if (!languageSwitcher) return;

    // 创建语言选项
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' }
    ];

    languageSwitcher.innerHTML = languages.map(lang => `
      <button 
        class="language-option ${lang.code === this.currentLang ? 'active' : ''}"
        data-lang="${lang.code}"
        onclick="i18n.switchLanguage('${lang.code}')"
      >
        <span class="flag">${lang.flag}</span>
        <span class="name">${lang.name}</span>
      </button>
    `).join('');
  }

  /**
   * 触发语言切换事件
   */
  triggerLanguageChangeEvent() {
    const event = new CustomEvent('languageChanged', {
      detail: { language: this.currentLang }
    });
    document.dispatchEvent(event);
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages() {
    return ['en', 'zh', 'ja', 'ko'];
  }
}

// 创建全局实例
const i18n = new I18n();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

// 导出供其他模块使用
window.i18n = i18n; 