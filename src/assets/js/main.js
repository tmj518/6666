/**
 * 主JavaScript文件 - 初始化所有功能
 */
class App {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
    this.initRetryCount = 0;
    this.maxInitRetry = 3;
  }

  /**
   * 初始化应用
   */
  async init() {
    if (this.isInitialized) return;

    console.log('🚀 初始化PlayHTML5应用...');

    try {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // 初始化各个模块
      await this.initModules();

      // 标记为已初始化
      this.isInitialized = true;

      console.log('✅ 应用初始化完成');

    } catch (error) {
      this.initRetryCount++;
      console.error(`❌ 应用初始化失败: ${error}`);
      if (this.initRetryCount < this.maxInitRetry) {
        console.warn(`⏳ 第${this.initRetryCount}次重试App初始化...`);
        setTimeout(() => this.init(), 1000 * this.initRetryCount);
      } else {
        alert('页面初始化失败，请刷新重试或联系站长！');
      }
    }
  }

  /**
   * 初始化各个模块
   */
  async initModules() {
    // 等待i18n模块加载
    await this.waitForModule('i18n', 10000);
    
    // 等待gameManager模块加载
    await this.waitForModule('gameManager', 10000);

    // 初始化导航
    this.initNavigation();

    // 初始化模态框
    this.initModals();

    // 初始化表单
    this.initForms();

    // 初始化搜索
    this.initSearch();

    // 初始化性能监控
    this.initPerformanceMonitoring();
  }

  /**
   * 等待模块加载
   */
  async waitForModule(moduleName, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (window[moduleName]) {
        return window[moduleName];
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Module ${moduleName} not loaded within ${timeout}ms, 请检查src/assets/js/${moduleName}.js是否正常加载并挂载到window！`);
  }

  /**
   * 初始化导航
   */
  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');

    // 桌面端导航
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 移除所有导航链接的活跃状态
        navLinks.forEach(l => l.classList.remove('nav-active'));
        
        // 添加当前导航链接的活跃状态
        link.classList.add('nav-active');
        
        // 获取目标ID
        const targetId = link.getAttribute('href');
        
        // 平滑滚动到目标位置
        document.querySelector(targetId)?.scrollIntoView({
          behavior: 'smooth'
        });
        
        // 关闭移动端菜单
        if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
          mobileMenu.classList.add('translate-x-full');
        }
      });
    });

    // 移动端导航
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 关闭移动端菜单
        if (mobileMenu) {
          mobileMenu.classList.add('translate-x-full');
        }
        
        // 获取目标ID
        const targetId = link.getAttribute('href');
        
        // 平滑滚动到目标位置
        document.querySelector(targetId)?.scrollIntoView({
          behavior: 'smooth'
        });
        
        // 更新导航活跃状态
        setTimeout(() => {
          this.updateActiveNav();
        }, 500);
      });
    });

    // 移动端菜单控制
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        if (mobileMenu) {
          mobileMenu.classList.remove('translate-x-full');
        }
      });
    }

    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener('click', () => {
        if (mobileMenu) {
          mobileMenu.classList.add('translate-x-full');
        }
      });
    }

    // 滚动时更新导航活跃状态
    window.addEventListener('scroll', () => {
      this.updateActiveNav();
    });
  }

  /**
   * 更新导航活跃状态
   */
  updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('nav-active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('nav-active');
      }
    });
  }

  /**
   * 初始化模态框
   */
  initModals() {
    const gameModal = document.getElementById('gameModal');
    const closeModal = document.getElementById('closeModal');
    const addGameModal = document.getElementById('addGameModal');
    const cancelAddGame = document.getElementById('cancelAddGame');

    // 关闭游戏详情模态框
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        if (gameModal) {
          gameModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }

    // 关闭添加游戏模态框
    if (cancelAddGame) {
      cancelAddGame.addEventListener('click', () => {
        if (addGameModal) {
          addGameModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }

    // 点击模态框背景关闭
    [gameModal, addGameModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
          }
        });
      }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [gameModal, addGameModal].forEach(modal => {
          if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
          }
        });
      }
    });
  }

  /**
   * 初始化表单
   */
  initForms() {
    console.log('🔧 初始化表单...');
    
    // 修复Add Game按钮弹窗逻辑
    const addGameBtn = document.getElementById('addGameBtn');
    const mobileAddGameBtn = document.getElementById('mobileAddGameBtn');
    const addGameModal = document.getElementById('addGameModal');
    const cancelAddGame = document.getElementById('cancelAddGame');

    console.log('🔍 查找元素:', {
      addGameBtn: !!addGameBtn,
      mobileAddGameBtn: !!mobileAddGameBtn,
      addGameModal: !!addGameModal,
      cancelAddGame: !!cancelAddGame
    });

    // 先移除所有旧的事件绑定，防止多次绑定
    if (addGameBtn) addGameBtn.onclick = null;
    if (mobileAddGameBtn) mobileAddGameBtn.onclick = null;
    if (cancelAddGame) cancelAddGame.onclick = null;

    if (addGameBtn && addGameModal) {
      addGameBtn.onclick = () => {
        addGameModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      };
    }
    if (mobileAddGameBtn && addGameModal) {
      mobileAddGameBtn.onclick = () => {
        addGameModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      };
    }
    if (cancelAddGame && addGameModal) {
      cancelAddGame.onclick = () => {
        addGameModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      };
    }

    // 关闭弹窗的通用逻辑（点击背景或ESC）
    if (addGameModal) {
      addGameModal.addEventListener('click', function(e) {
        if (e.target === addGameModal) {
          addGameModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && addGameModal && !addGameModal.classList.contains('hidden')) {
        addGameModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });

    // 图片上传预览和base64处理
    const gameImageFile = document.getElementById('gameImageFile');
    let uploadedImageBase64 = '';
    if (gameImageFile) {
      gameImageFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            uploadedImageBase64 = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 引入EmailJS
    (function(){
      if (typeof emailjs === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://cdn.emailjs.com/dist/email.min.js';
        script.onload = function() {
          emailjs.init('YOUR_EMAILJS_USER_ID'); // 替换为你的EmailJS User ID
        };
        document.head.appendChild(script);
      } else {
        emailjs.init('YOUR_EMAILJS_USER_ID'); // 替换为你的EmailJS User ID
      }
    })();

    // 表单提交事件处理（集成base64图片）
    const addGameForm = document.getElementById('addGameForm');
    if (addGameForm) {
      addGameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
          title: document.getElementById('gameTitle').value,
          category: document.getElementById('gameCategory').value,
          description: document.getElementById('gameDescription').value,
          imageUrl: uploadedImageBase64 || '',
          gameUrl: document.getElementById('gameUrl').value,
          developer: document.getElementById('gameDeveloper').value
        };
        // 发送邮件到站长
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
          ...formData,
          to_email: '1071833449@qq.com'
        }).then(function(response) {
          alert('提交成功，已通知站长审核！');
          addGameModal.classList.add('hidden');
          addGameForm.reset();
          document.body.style.overflow = 'auto';
        }, function(error) {
          alert('提交失败，请稍后重试');
        });
      });
    }
    
    console.log('✅ 表单初始化完成');
  }

  /**
   * 验证游戏数据
   */
  validateGameData(data) {
    const requiredFields = ['title', 'category', 'description', 'imageUrl', 'gameUrl', 'developer'];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        this.showNotification(`Please fill in the ${field} field.`, 'error');
        return false;
      }
    }

    if (data.rating < 1 || data.rating > 5) {
      this.showNotification('Rating must be between 1 and 5.', 'error');
      return false;
    }

    return true;
  }

  /**
   * 初始化搜索
   */
  initSearch() {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (!searchInput) return;

    // 搜索建议
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });

    // 搜索按钮点击
    const searchButton = searchInput.parentElement?.querySelector('button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
    }

    // 回车键搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(searchInput.value);
      }
    });
  }

  /**
   * 执行搜索
   */
  performSearch(query) {
    if (window.gameManager) {
      window.gameManager.searchGames(query);
    }
  }

  /**
   * 初始化性能监控
   */
  initPerformanceMonitoring() {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measurePerformance();
      }, 1000);
    });

    // 监控用户交互
    this.trackUserInteractions();
  }

  /**
   * 测量性能指标
   */
  measurePerformance() {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      const metrics = {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };

      console.log('📊 性能指标:', metrics);
      
      // 这里可以发送到分析服务
      this.sendAnalytics('performance', metrics);
    }
  }

  /**
   * 跟踪用户交互
   */
  trackUserInteractions() {
    // 跟踪游戏点击
    document.addEventListener('click', (e) => {
      const gameCard = e.target.closest('.game-card-hover');
      if (gameCard) {
        const gameId = gameCard.getAttribute('data-game-id');
        this.sendAnalytics('game_click', { gameId });
      }
    });

    // 跟踪分类点击
    document.addEventListener('click', (e) => {
      const categoryBtn = e.target.closest('.category-btn');
      if (categoryBtn) {
        const category = categoryBtn.getAttribute('data-category');
        this.sendAnalytics('category_click', { category });
      }
    });
  }

  /**
   * 发送分析数据
   */
  sendAnalytics(event, data) {
    // 这里可以集成Google Analytics、Mixpanel等
    console.log('📈 分析事件:', event, data);
  }

  /**
   * 显示通知
   */
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = type === 'error' ? 'notification error' : 'notification info';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = 9999;
    notification.style.padding = '12px 24px';
    notification.style.background = type === 'error' ? '#D4351C' : '#005EA5';
    notification.style.color = '#fff';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// 实例化并初始化App
const app = new App();
app.init();