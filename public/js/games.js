/**
 * 游戏管理系统
 */
class GameManager {
  constructor() {
    this.games = [];
    this.categories = [];
    this.currentCategory = 'all';
    this.currentRegion = 'global';
    this.filteredGames = [];
    this.cache = new Map();
  }

  /**
   * 初始化游戏管理器
   */
  async init() {
    try {
      await this.loadGames();
      try {
        await this.loadCategories();
      } catch (error) {
        console.warn('Failed to load categories, continuing with games only:', error);
      }
      // 自动绑定分类按钮事件
      this.setupCategoryFilter();
      // 页面加载后自动渲染所有游戏卡片
      this.filterByCategory('all');
      this.renderPopularGames();
      this.renderFeaturedGames();
    } catch (error) {
      console.error('Failed to initialize GameManager:', error);
    }
  }

  /**
   * 加载游戏数据
   */
  async loadGames() {
    try {
      const response = await fetch('/data/games.json');
      if (!response.ok) throw new Error('Failed to load games data');
      
      const data = await response.json();
      this.games = data.games;
      this.cache.set('games', this.games);
    } catch (error) {
      console.warn('Using fallback games data due to fetch error:', error);
      // 使用备用数据
      this.games = [
        {
          id: 1,
          title: { en: "Super Fighter", zh: "超级战士" },
          description: { en: "Epic fighting game with amazing graphics and smooth controls.", zh: "史诗级格斗游戏，拥有惊人的图形和流畅的控制。" },
          category: ["action"],
          image: "https://picsum.photos/seed/action1/400/300",
          url: "https://example.com/play-super-fighter",
          rating: 4.7,
          plays: "1.2M",
          developer: "Game Studio",
          published: "2023-06-15",
          regions: ["global"]
        },
        {
          id: 2,
          title: { en: "Brain Teaser", zh: "脑筋急转弯" },
          description: { en: "Challenge your mind with this addictive puzzle game.", zh: "用这个令人上瘾的益智游戏挑战你的思维。" },
          category: ["puzzle"],
          image: "https://picsum.photos/seed/puzzle1/400/300",
          url: "https://example.com/play-brain-teaser",
          rating: 4.8,
          plays: "890K",
          developer: "Puzzle Labs",
          published: "2023-05-20",
          regions: ["global"]
        },
        {
          id: 3,
          title: { en: "Empire Builder", zh: "帝国建设者" },
          description: { en: "Build your empire and conquer the world in this strategic game.", zh: "在这个策略游戏中建立你的帝国并征服世界。" },
          category: ["strategy"],
          image: "https://picsum.photos/seed/strategy1/400/300",
          url: "https://example.com/play-empire-builder",
          rating: 4.6,
          plays: "650K",
          developer: "Strategy Games",
          published: "2023-04-10",
          regions: ["global"]
        },
        {
          id: 4,
          title: { en: "Mystery Quest", zh: "神秘探险" },
          description: { en: "Embark on an epic adventure filled with mysteries and treasures.", zh: "踏上充满谜题和宝藏的史诗冒险之旅。" },
          category: ["adventure"],
          image: "https://picsum.photos/seed/adventure1/400/300",
          url: "https://example.com/play-mystery-quest",
          rating: 4.9,
          plays: "1.5M",
          developer: "Adventure Studio",
          published: "2023-03-18",
          regions: ["global"]
        },
        {
          id: 5,
          title: { en: "Retro Blaster", zh: "复古爆破手" },
          description: { en: "Classic arcade shooting game with modern graphics.", zh: "经典街机射击游戏，配以现代画面。" },
          category: ["arcade"],
          image: "https://picsum.photos/seed/arcade1/400/300",
          url: "https://example.com/play-retro-blaster",
          rating: 4.5,
          plays: "700K",
          developer: "Arcade Inc.",
          published: "2023-02-25",
          regions: ["global"]
        },
        {
          id: 6,
          title: { en: "Magic Cards", zh: "魔法卡牌" },
          description: { en: "Collect and battle with magical cards in this exciting card game.", zh: "收集并对战魔法卡牌，体验刺激卡牌游戏。" },
          category: ["card"],
          image: "https://picsum.photos/seed/card1/400/300",
          url: "https://example.com/play-magic-cards",
          rating: 4.4,
          plays: "500K",
          developer: "Card Masters",
          published: "2023-01-30",
          regions: ["global"]
        },
        {
          id: 7,
          title: { en: "Soccer Pro", zh: "足球高手" },
          description: { en: "Experience the thrill of professional soccer in this realistic sports game.", zh: "在这款真实的体育游戏中体验职业足球的激情。" },
          category: ["sports"],
          image: "https://picsum.photos/seed/sports1/400/300",
          url: "https://example.com/play-soccer-pro",
          rating: 4.3,
          plays: "1.1M",
          developer: "Sports Studio",
          published: "2023-01-10",
          regions: ["global"]
        },
        {
          id: 8,
          title: { en: "Math Adventure", zh: "数学冒险" },
          description: { en: "Learn math while having fun in this educational adventure game.", zh: "在这款教育冒险游戏中边玩边学数学。" },
          category: ["educational"],
          image: "https://picsum.photos/seed/educational1/400/300",
          url: "https://example.com/play-math-adventure",
          rating: 4.2,
          plays: "300K",
          developer: "Edu Games",
          published: "2022-12-20",
          regions: ["global"]
        },
        {
          id: 9,
          title: { en: "Cyber Runner", zh: "赛博跑者" },
          description: { en: "Brand new cyberpunk running game with stunning visuals.", zh: "全新赛博朋克风格跑酷游戏，画面炫酷。" },
          category: ["new"],
          image: "https://picsum.photos/seed/new1/400/300",
          url: "https://example.com/play-cyber-runner",
          rating: 4.8,
          plays: "900K",
          developer: "Future Games",
          published: "2024-06-01",
          regions: ["global"]
        },
        {
          id: 10,
          title: { en: "Dragon Quest", zh: "龙之探险" },
          description: { en: "The most popular RPG game with millions of players worldwide.", zh: "全球数百万玩家最受欢迎的RPG游戏。" },
          category: ["popular"],
          image: "https://picsum.photos/seed/popular1/400/300",
          url: "https://example.com/play-dragon-quest",
          rating: 4.9,
          plays: "2.3M",
          developer: "RPG Studio",
          published: "2023-07-15",
          regions: ["global"]
        }
      ];
      this.cache.set('games', this.games);
    }
  }

  /**
   * 加载分类数据
   */
  async loadCategories() {
    try {
      const response = await fetch('/data/categories.json');
      if (!response.ok) throw new Error('Failed to load categories data');
      
      const data = await response.json();
      this.categories = data.categories;
      this.cache.set('categories', this.categories);
    } catch (error) {
      console.warn('Using fallback categories data due to fetch error:', error);
      // 使用备用分类数据
      this.categories = [
        { id: 'all', name: { en: 'All Games', zh: '所有游戏' }, color: 'primary' },
        { id: 'new', name: { en: 'New', zh: '新游戏' }, color: 'success' },
        { id: 'popular', name: { en: 'Popular', zh: '热门' }, color: 'warning' },
        { id: 'puzzle', name: { en: 'Puzzle', zh: '益智' }, color: 'success' },
        { id: 'action', name: { en: 'Action', zh: '动作' }, color: 'danger' },
        { id: 'arcade', name: { en: 'Arcade', zh: '街机' }, color: 'secondary' },
        { id: 'strategy', name: { en: 'Strategy', zh: '策略' }, color: 'primary' },
        { id: 'adventure', name: { en: 'Adventure', zh: '冒险' }, color: 'warning' },
        { id: 'card', name: { en: 'Card', zh: '卡牌' }, color: 'dark' },
        { id: 'sports', name: { en: 'Sports', zh: '体育' }, color: 'success' },
        { id: 'educational', name: { en: 'Educational', zh: '教育' }, color: 'primary' }
      ];
      this.cache.set('categories', this.categories);
    }
  }

  /**
   * 初始化游戏网格
   */
  initGameGrid() {
    const gameGrid = document.getElementById('gameGrid');
    if (!gameGrid) return;

    gameGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600" data-i18n="common.loading">Loading...</p>
      </div>
    `;
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    this.setupCategoryFilter();
    this.setupSearch();
    this.setupSorting();
    this.setupRegionFilter();
    // 地区筛选
    const regionButtons = document.querySelectorAll('.region-btn');
    regionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const region = button.getAttribute('data-region');
        this.filterByRegion(region);
        this.updateRegionButtons(region);
      });
    });
  }

  /**
   * 设置分类筛选
   */
  setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        this.filterByCategory(category);
        // this.filterStaticContent(category); // 已注释，避免干扰动态渲染
      });
    });
  }

  /**
   * 筛选静态HTML内容
   */
  filterStaticContent(category) {
    const gameCards = document.querySelectorAll('#gameGrid .game-card-hover');
    
    gameCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      
      if (category === 'all' || cardCategory === category) {
        card.style.display = 'block';
        card.classList.add('game-card-enter');
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * 设置搜索功能
   */
  setupSearch() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchGames(e.target.value);
      }, 300);
    });
  }

  /**
   * 设置排序功能
   */
  setupSorting() {
    const sortSelect = document.querySelector('select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      this.sortGames(e.target.value);
    });
  }

  /**
   * 设置地区筛选
   */
  setupRegionFilter() {
    const regionButtons = document.querySelectorAll('.region-btn');
    regionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const region = button.getAttribute('data-region');
        this.filterByRegion(region);
      });
    });
  }

  /**
   * 按分类筛选游戏
   */
  filterByCategory(category) {
    this.currentCategory = category;
    this.updateCategoryButtons(category);
    this.filterAndRender();
  }

  /**
   * 按地区筛选游戏
   */
  filterByRegion(region) {
    this.currentRegion = region;
    this.filterAndRender();
  }

  /**
   * 搜索游戏
   */
  searchGames(query) {
    if (!query.trim()) {
      this.filterAndRender();
      return;
    }

    const searchResults = this.games.filter(game => {
      const title = game.title[i18n.getCurrentLanguage()] || game.title.en;
      const description = game.description[i18n.getCurrentLanguage()] || game.description.en;
      
      return title.toLowerCase().includes(query.toLowerCase()) ||
             description.toLowerCase().includes(query.toLowerCase());
    });

    this.renderGames(searchResults);
  }

  /**
   * 排序游戏
   */
  sortGames(sortBy) {
    let sortedGames = [...this.filteredGames];

    switch (sortBy) {
      case 'newest':
        sortedGames.sort((a, b) => new Date(b.published) - new Date(a.published));
        break;
      case 'mostPlayed':
        sortedGames.sort((a, b) => this.parsePlays(b.plays) - this.parsePlays(a.plays));
        break;
      case 'topRated':
        sortedGames.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        sortedGames.sort((a, b) => {
          const aScore = this.calculateRecommendationScore(a);
          const bScore = this.calculateRecommendationScore(b);
          return bScore - aScore;
        });
        break;
    }

    this.renderGames(sortedGames);
  }

  /**
   * 计算推荐分数
   */
  calculateRecommendationScore(game) {
    const isNew = game.category.includes('new') ? 10 : 0;
    const ratingScore = game.rating * 2;
    const playsScore = this.parsePlays(game.plays) / 100000;
    return isNew + ratingScore + playsScore;
  }

  /**
   * 解析播放次数
   */
  parsePlays(playsStr) {
    const match = playsStr.match(/(\d+(?:\.\d+)?)([KMB]?)\+/);
    if (!match) return 0;
    
    const number = parseFloat(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'K': return number * 1000;
      case 'M': return number * 1000000;
      case 'B': return number * 1000000000;
      default: return number;
    }
  }

  /**
   * 筛选并渲染游戏
   */
  filterAndRender() {
    // 只按分类筛选，不再依赖 currentRegion
    if (this.currentCategory === 'all') {
      this.filteredGames = [...this.games];
    } else {
      this.filteredGames = this.games.filter(game => {
        return game.category && game.category.some(c => c === this.currentCategory);
      });
    }
    this.renderGames();
  }

  /**
   * 渲染游戏列表
   */
  renderGames(games = this.filteredGames) {
    const gameGrid = document.getElementById('gameGrid');
    if (!gameGrid) return;

    if (games.length === 0) {
      gameGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-5xl text-gray-300 mb-4">
            <i class="fa fa-gamepad"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2" data-i18n="games.noGames">No games found</h3>
          <p class="text-gray-500" data-i18n="games.noGamesDesc">Try selecting a different category or check back later.</p>
        </div>
      `;
      return;
    }

    gameGrid.innerHTML = games.map(game => this.createGameCard(game)).join('');
    this.setupGameCardListeners();
  }

  /**
   * 创建游戏卡片HTML
   */
  createGameCard(game) {
    // 只用英文名和简介，保证SEO一致性
    const title = game.title.en;
    const description = game.description.en;
    const altText = `Play ${title} - ${description}`;
    const imgTitle = `${title} | HTML5 Game`;
    // 结构化数据（JSON-LD）
    const jsonLd = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "${title}",
        "description": "${description}",
        "image": "${game.image}",
        "url": "${game.url}",
        "genre": "${game.category[0] || ''}",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser",
        "author": {"@type": "Organization", "name": "${game.developer || 'Unknown'}"},
        "publisher": {"@type": "Organization", "name": "PlayHTML5"},
        "datePublished": "${game.published || ''}",
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": ${game.rating || 4.8}, "ratingCount": "${game.plays || '0+'}"}
      }
      </script>
    `;
    let badgeText = '';
    let badgeClass = '';
    if (game.category.includes('new')) {
      badgeText = (window.i18n && window.i18n.t) ? i18n.t('games.new') : 'New';
      badgeClass = 'bg-success text-white';
    } else if (game.category.includes('popular')) {
      badgeText = (window.i18n && window.i18n.t) ? i18n.t('games.popular') : 'Popular';
      badgeClass = 'bg-warning text-white';
    }
    return `
      <div class="game-card-hover bg-white rounded-xl overflow-hidden shadow-md cursor-pointer game-card-enter" data-game-id="${game.id}">
        <div class="relative h-48 bg-gray-200">
          <img src="${game.image}" alt="${altText}" title="${imgTitle}" class="w-full h-full object-cover cursor-pointer" loading="lazy" onclick="event.stopPropagation(); window.open('${game.url}','_blank')">
          ${badgeText ? `
            <div class="absolute top-3 left-3">
              <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
          ` : ''}
        </div>
        <div class="p-4">
          <h4 class="font-semibold text-lg mb-1">${title}</h4>
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${description}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <i class="fa fa-star text-yellow-400"></i>
              <span class="text-sm ml-1">${game.rating}</span>
            </div>
            <button class="text-primary hover:text-primary/80 text-sm font-medium flex items-center" onclick="event.stopPropagation(); window.open('${game.url}','_blank')">
              ${(window.i18n && window.i18n.t) ? i18n.t('games.playNow') : 'Play Now'} <i class="fa fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
        ${jsonLd}
      </div>
    `;
  }

  /**
   * 设置游戏卡片事件监听器
   */
  setupGameCardListeners() {
    const gameCards = document.querySelectorAll('.game-card-hover');
    gameCards.forEach(card => {
      card.addEventListener('click', () => {
        const gameId = parseInt(card.getAttribute('data-game-id'));
        this.showGameModal(gameId);
      });
    });
  }

  /**
   * 显示游戏详情模态框
   */
  showGameModal(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const currentLang = (window.i18n && window.i18n.getCurrentLanguage) ? i18n.getCurrentLanguage() : 'en';
    const title = game.title[currentLang] || game.title.en;
    const description = game.description[currentLang] || game.description.en;

    document.getElementById('modalGameTitle').textContent = title;
    document.getElementById('modalGameDescription').textContent = description;
    document.getElementById('modalGameImage').src = game.image;
    document.getElementById('modalGameImage').alt = title;

    const categoryBadge = document.getElementById('modalGameCategory');
    const categoryName = game.category[0];
    categoryBadge.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    // 绑定图片点击试玩
    const modalGameImage = document.getElementById('modalGameImage');
    if (modalGameImage) {
      modalGameImage.onclick = () => {
        if (game.url) window.open(game.url, '_blank');
      };
    }
    // 绑定Play Now按钮
    const modalPlayBtn = document.getElementById('modalPlayBtn');
    if (modalPlayBtn) {
      modalPlayBtn.onclick = () => {
        if (game.url) window.open(game.url, '_blank');
      };
    }

    // 渲染相关推荐
    this.renderRecommendations(game);

    const gameModal = document.getElementById('gameModal');
    gameModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  /**
   * 更新分类按钮状态
   */
  updateCategoryButtons(activeCategory) {
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
      // 移除所有状态类
      btn.classList.remove('category-active', 'bg-primary/10', 'text-primary');
      btn.classList.add('bg-gray-100', 'text-gray-800');
      
      // 为激活的按钮添加状态类
      if (btn.getAttribute('data-category') === activeCategory) {
        btn.classList.remove('bg-gray-100', 'text-gray-800');
        btn.classList.add('category-active', 'bg-primary/10', 'text-primary');
      }
    });
  }

  updateRegionButtons(activeRegion) {
    const regionButtons = document.querySelectorAll('.region-btn');
    regionButtons.forEach(btn => {
      btn.classList.remove('region-active');
      if (btn.getAttribute('data-region') === activeRegion) {
        btn.classList.add('region-active');
      }
    });
  }

  /**
   * 添加新游戏
   */
  addGame(gameData) {
    const newGame = {
      id: this.games.length + 1,
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
      image: gameData.imageUrl,
      category: [gameData.category],
      rating: parseFloat(gameData.rating),
      developer: gameData.developer,
      published: new Date().toISOString().split('T')[0],
      plays: '0+',
      regions: ['global'],
      url: gameData.gameUrl
    };

    this.games.unshift(newGame);
    this.filterAndRender();
    
    return newGame;
  }

  /**
   * 获取游戏统计信息
   */
  getStats() {
    return {
      totalGames: this.games.length,
      categories: this.categories.length,
      averageRating: this.games.reduce((sum, game) => sum + game.rating, 0) / this.games.length,
      totalPlays: this.games.reduce((sum, game) => sum + this.parsePlays(game.plays), 0)
    };
  }

  renderRecommendations(game) {
    const recommendationGrid = document.getElementById('recommendationGrid');
    if (!recommendationGrid) return;
    // 推荐同分类（排除自己），不足3个补同开发者
    let related = this.games.filter(g => g.id !== game.id && g.category.some(c => game.category.includes(c)));
    if (related.length < 3) {
      const more = this.games.filter(g => g.id !== game.id && g.developer === game.developer && !related.includes(g));
      related = related.concat(more);
    }
    related = related.slice(0, 3);
    recommendationGrid.innerHTML = related.map(g => {
      const currentLang = (window.i18n && window.i18n.getCurrentLanguage) ? i18n.getCurrentLanguage() : 'en';
      const t = g.title[currentLang] || g.title.en;
      return `<div class='cursor-pointer rounded-lg shadow-md bg-white p-3 flex flex-col items-center' onclick="window.gameManager.showGameModal(${g.id})">
        <img src='${g.image}' alt='${t}' class='w-full h-28 object-cover rounded mb-2'>
        <div class='font-semibold text-base mb-1'>${t}</div>
        <button class='btn btn-primary btn-sm' onclick="event.stopPropagation(); window.open('${g.url}','_blank')">Play Now</button>
      </div>`;
    }).join('');
  }

  // 动态渲染 Most Popular Games 区域
  renderPopularGames() {
    const popularSection = document.querySelector('#popular .game-grid');
    if (!popularSection) return;
    const popularGames = this.games.filter(game => game.category && game.category.includes('popular'));
    popularSection.innerHTML = popularGames.map(game => this.createGameCard(game)).join('');
    this.setupGameCardListeners();
  }

  // 动态渲染 Featured Games 区域
  renderFeaturedGames() {
    const featuredSection = document.querySelector('#featured .game-grid');
    if (!featuredSection) return;
    const featuredGames = this.games.filter(game => game.category && (game.category.includes('new') || game.category.includes('featured')));
    featuredSection.innerHTML = featuredGames.map(game => this.createGameCard(game)).join('');
    this.setupGameCardListeners();
  }
}

// 创建全局实例
const gameManager = new GameManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  gameManager.init();
});

// 导出供其他模块使用
window.gameManager = gameManager; 