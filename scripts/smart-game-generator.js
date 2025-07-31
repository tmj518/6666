const fs = require('fs');
const path = require('path');

// 游戏源配置和iframe支持情况
const GAME_SOURCES_CONFIG = {
    'crazygames.com': {
        supportsIframe: false,
        displayType: 'redirect',
        baseUrl: 'https://www.crazygames.com/game/',
        fallbackMessage: '游戏无法在此页面直接嵌入，点击按钮在新窗口打开游戏'
    },
    'poki.com': {
        supportsIframe: true,
        displayType: 'iframe',
        baseUrl: 'https://poki.com/en/g/',
        fallbackMessage: '游戏加载中...'
    },
    'html5games.com': {
        supportsIframe: true,
        displayType: 'iframe',
        baseUrl: 'https://html5games.com/Game/',
        fallbackMessage: '游戏加载中...'
    },
    'itch.io': {
        supportsIframe: true,
        displayType: 'iframe',
        baseUrl: 'https://itch.io/embed-upload/',
        fallbackMessage: '游戏加载中...'
    },
    'gameforge.com': {
        supportsIframe: false,
        displayType: 'redirect',
        baseUrl: 'https://gameforge.com/en-US/little-games/',
        fallbackMessage: '游戏无法在此页面直接嵌入，点击按钮在新窗口打开游戏'
    }
};

/**
 * 智能游戏页面生成器
 */
class SmartGameGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, '../templates/game-template.html');
        this.outputPath = path.join(__dirname, '../public/games/');
    }

    /**
     * 分析游戏URL并确定最佳显示方式
     */
    analyzeGameUrl(gameUrl) {
        const url = new URL(gameUrl);
        const domain = url.hostname;
        
        // 查找匹配的游戏源配置
        const sourceConfig = Object.entries(GAME_SOURCES_CONFIG).find(([key]) => 
            domain.includes(key)
        );

        if (sourceConfig) {
            return {
                sourceName: sourceConfig[0],
                config: sourceConfig[1],
                displayType: sourceConfig[1].displayType,
                supportsIframe: sourceConfig[1].supportsIframe
            };
        }

        // 默认配置（未知域名）
        return {
            sourceName: 'unknown',
            config: {
                supportsIframe: false,
                displayType: 'redirect',
                fallbackMessage: '游戏源未知，点击按钮在新窗口打开游戏'
            },
            displayType: 'redirect',
            supportsIframe: false
        };
    }

    /**
     * 生成游戏页面HTML
     */
    generateGamePage(gameData) {
        const {
            gameName,
            gameUrl,
            keywords,
            description,
            genre,
            controls,
            gameInfo
        } = gameData;

        const analysis = this.analyzeGameUrl(gameUrl);
        const gameSlug = this.generateSlug(gameName);
        
        // 生成页面内容
        const pageContent = this.generatePageContent(gameData, analysis);
        
        // 保存页面文件
        const outputFile = path.join(this.outputPath, `${gameSlug}.html`);
        
        // 确保输出目录存在
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
        
        fs.writeFileSync(outputFile, pageContent);
        
        return {
            filePath: outputFile,
            gameSlug,
            analysis,
            displayType: analysis.displayType
        };
    }

    /**
     * 生成页面内容
     */
    generatePageContent(gameData, analysis) {
        const {
            gameName,
            gameUrl,
            keywords,
            description,
            genre,
            controls,
            gameInfo
        } = gameData;

        const gameDisplay = this.generateGameDisplay(gameUrl, analysis);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${gameName} - ${keywords.join(', ')} | Play Free Online</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords.join(', ')}">
    <meta name="author" content="PlayHTML5">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${gameName} - ${keywords.join(', ')}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.ukhtml5games.com/games/${this.generateSlug(gameName)}.html">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.ukhtml5games.com/games/${this.generateSlug(gameName)}.html">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Tailwind Config -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'apple-blue': '#007AFF',
                        'apple-gray': '#8E8E93',
                        'apple-light-gray': '#F2F2F7',
                        'apple-dark': '#1D1D1F'
                    },
                    fontFamily: {
                        'sf': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
                    }
                }
            }
        }
    </script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "${gameName}",
        "description": "${description}",
        "genre": ${JSON.stringify(genre)},
        "gamePlatform": "Web Browser",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser",
        "url": "https://www.ukhtml5games.com/games/${this.generateSlug(gameName)}.html",
        "publisher": {
            "@type": "Organization",
            "name": "PlayHTML5"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    }
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .game-container {
            aspect-ratio: 16/9;
            max-height: 70vh;
        }
        
        @media (max-width: 768px) {
            .game-container {
                aspect-ratio: 4/3;
                max-height: 50vh;
            }
        }
    </style>
</head>
<body class="bg-white text-apple-dark font-sf">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="https://www.ukhtml5games.com" class="text-apple-blue font-semibold text-xl">
                        PlayHTML5
                    </a>
                </div>
                <nav class="hidden md:flex space-x-8">
                    <a href="#game" class="text-apple-gray hover:text-apple-blue transition-colors">Play Game</a>
                    <a href="#about" class="text-apple-gray hover:text-apple-blue transition-colors">About</a>
                    <a href="#controls" class="text-apple-gray hover:text-apple-blue transition-colors">Controls</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-apple-blue to-blue-600 text-white py-16 md:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
                ${gameName}
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                ${description}
            </p>
            <a href="#game" class="bg-white text-apple-blue px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-block">
                Play Now - Free Online
            </a>
        </div>
    </section>

    <!-- Game Section -->
    <section id="game" class="py-16 bg-apple-light-gray">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Play ${gameName} Online</h2>
            <div class="max-w-4xl mx-auto">
                ${gameDisplay}
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-6">About ${gameName}</h2>
                    <p class="text-lg text-apple-gray leading-relaxed mb-6">
                        ${description}
                    </p>
                    <p class="text-lg text-apple-gray leading-relaxed">
                        Experience the thrill of ${genre.join(', ').toLowerCase()} gaming with ${gameName}. This exciting game offers challenging gameplay, stunning graphics, and hours of entertainment for players of all skill levels.
                    </p>
                </div>
                <div class="bg-apple-light-gray rounded-2xl p-8">
                    <h3 class="text-2xl font-bold mb-6">Game Features</h3>
                    <ul class="space-y-4">
                        ${this.generateFeatureList(genre)}
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Controls Section -->
    <section id="controls" class="py-16 bg-apple-light-gray">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">How to Play</h2>
            <div class="grid md:grid-cols-2 gap-12">
                <div>
                    <h3 class="text-2xl font-bold mb-6">Game Controls</h3>
                    <div class="space-y-4">
                        ${this.generateControlsList(controls)}
                    </div>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-6">Game Objectives</h3>
                    <div class="space-y-4">
                        ${this.generateObjectivesList(genre)}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Game Info Table -->
    <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Game Information</h2>
            <div class="bg-apple-light-gray rounded-2xl overflow-hidden">
                <table class="w-full">
                    <tbody class="divide-y divide-gray-200">
                        ${this.generateGameInfoTable(gameInfo)}
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-apple-dark text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <p class="text-apple-gray mb-4">
                    © 2024 PlayHTML5. All rights reserved. ${gameName} is a free online HTML5 game.
                </p>
                <p class="text-sm text-apple-gray">
                    This game is provided for entertainment purposes only. All game content and trademarks belong to their respective owners.
                </p>
            </div>
        </div>
    </footer>

    <!-- Smooth Scrolling -->
    <script>
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>`;
    }

    /**
     * 根据分析结果生成游戏显示区域
     */
    generateGameDisplay(gameUrl, analysis) {
        if (analysis.displayType === 'iframe') {
            return `<div class="game-container bg-white rounded-2xl shadow-2xl overflow-hidden">
                <iframe 
                    src="${gameUrl}" 
                    class="w-full h-full border-0"
                    allowfullscreen
                    title="${analysis.sourceName} Game">
                </iframe>
            </div>`;
        } else {
            // 重定向显示方式
            return `<div class="game-container bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden relative">
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                <div class="relative z-10 w-full h-full flex items-center justify-center">
                    <div class="text-center p-8 max-w-md">
                        <div class="text-8xl mb-6">🎮</div>
                        <h3 class="text-3xl font-bold text-gray-800 mb-4">${analysis.sourceName}</h3>
                        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                            ${analysis.config.fallbackMessage}
                        </p>
                        <div class="space-y-4">
                            <a href="${gameUrl}" 
                               target="_blank" 
                               class="block w-full bg-apple-blue text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                🎮 立即开始游戏
                            </a>
                            <div class="flex justify-center space-x-4 text-sm text-gray-500">
                                <span>🏁 单人游戏</span>
                                <span>🎯 免费游玩</span>
                                <span>⚡ 在线游戏</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 装饰性背景元素 -->
                <div class="absolute top-4 right-4 text-4xl opacity-20">🎮</div>
                <div class="absolute bottom-4 left-4 text-3xl opacity-20">🎯</div>
                <div class="absolute top-1/2 left-4 text-2xl opacity-20">⚡</div>
                <div class="absolute top-1/2 right-4 text-2xl opacity-20">🏁</div>
            </div>`;
        }
    }

    /**
     * 生成特性列表
     */
    generateFeatureList(genre) {
        const features = [
            'Free to play online',
            'No download required',
            'Cross-platform compatibility',
            'Regular updates and improvements'
        ];
        
        return features.map(feature => 
            `<li class="flex items-start">
                <span class="text-apple-blue mr-3 mt-1">✓</span>
                <span>${feature}</span>
            </li>`
        ).join('');
    }

    /**
     * 生成控制说明列表
     */
    generateControlsList(controls) {
        return controls.map(control => 
            `<div class="bg-white rounded-xl p-6 shadow-sm">
                <h4 class="font-semibold text-apple-blue mb-2">${control.title}</h4>
                <p class="text-apple-gray">${control.description}</p>
            </div>`
        ).join('');
    }

    /**
     * 生成游戏目标列表
     */
    generateObjectivesList(genre) {
        const objectives = [
            {
                title: 'Complete Levels',
                description: 'Progress through increasingly challenging levels and overcome obstacles'
            },
            {
                title: 'Achieve High Scores',
                description: 'Beat your personal best and compete for the highest scores'
            },
            {
                title: 'Unlock Achievements',
                description: 'Complete special challenges and unlock new content'
            }
        ];
        
        return objectives.map(objective => 
            `<div class="bg-white rounded-xl p-6 shadow-sm">
                <h4 class="font-semibold text-apple-blue mb-2">${objective.title}</h4>
                <p class="text-apple-gray">${objective.description}</p>
            </div>`
        ).join('');
    }

    /**
     * 生成游戏信息表格
     */
    generateGameInfoTable(gameInfo) {
        const infoItems = [
            { label: 'Game Title', value: gameInfo.title },
            { label: 'Genre', value: gameInfo.genre.join(', ') },
            { label: 'Game Type', value: gameInfo.type },
            { label: 'Platform', value: gameInfo.platform },
            { label: 'Controls', value: gameInfo.controls },
            { label: 'Price', value: gameInfo.price }
        ];
        
        return infoItems.map(item => 
            `<tr class="bg-white">
                <td class="px-6 py-4 font-semibold text-apple-dark">${item.label}</td>
                <td class="px-6 py-4 text-apple-gray">${item.value}</td>
            </tr>`
        ).join('');
    }

    /**
     * 生成URL友好的slug
     */
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    /**
     * 批量生成游戏页面
     */
    async generateBatchGames(gamesList) {
        const results = [];
        
        console.log('🚀 开始批量生成游戏页面...\n');
        
        for (const gameData of gamesList) {
            try {
                console.log(`📝 生成页面: ${gameData.gameName}`);
                const result = await this.generateGamePage(gameData);
                results.push(result);
                console.log(`✅ ${gameData.gameName} 生成完成 (${result.displayType})\n`);
            } catch (error) {
                console.error(`❌ ${gameData.gameName} 生成失败:`, error.message);
                results.push({
                    gameName: gameData.gameName,
                    error: error.message,
                    displayType: 'error'
                });
            }
        }
        
        // 生成汇总报告
        this.generateBatchReport(results);
        
        return results;
    }

    /**
     * 生成批量处理报告
     */
    generateBatchReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            totalGames: results.length,
            successful: results.filter(r => !r.error).length,
            failed: results.filter(r => r.error).length,
            displayTypes: {
                iframe: results.filter(r => r.displayType === 'iframe').length,
                redirect: results.filter(r => r.displayType === 'redirect').length,
                error: results.filter(r => r.displayType === 'error').length
            },
            results: results
        };
        
        const reportPath = path.join(__dirname, '../data/batch-generation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 批量生成报告:');
        console.log(`总游戏数: ${report.totalGames}`);
        console.log(`成功: ${report.successful}`);
        console.log(`失败: ${report.failed}`);
        console.log(`iframe显示: ${report.displayTypes.iframe}`);
        console.log(`重定向显示: ${report.displayTypes.redirect}`);
        console.log(`报告已保存到: ${reportPath}`);
    }
}

// 导出类
module.exports = SmartGameGenerator;

// 使用示例
if (require.main === module) {
    const generator = new SmartGameGenerator();
    
    // 示例游戏数据
    const sampleGames = [
        {
            gameName: 'Moto X3M',
            gameUrl: 'https://www.crazygames.com/game/moto-x3m',
            keywords: ['Driving', 'Stunt', 'Bike', 'Dirt Bike', 'Side Scrolling', '1 Player'],
            description: 'Master extreme dirt bike stunts in this thrilling side-scrolling motorcycle game.',
            genre: ['Racing', 'Stunt', 'Sports'],
            controls: [
                { title: 'Movement', description: 'Use arrow keys or WASD to control your motorcycle' },
                { title: 'Stunts', description: 'Press SPACE to perform flips and stunts in the air' },
                { title: 'Restart', description: 'Press R to restart the current level' }
            ],
            gameInfo: {
                title: 'Moto X3M',
                genre: ['Racing', 'Stunt', 'Sports'],
                type: 'Side Scrolling, 1 Player',
                platform: 'Web Browser (HTML5)',
                controls: 'Keyboard (Arrow Keys/WASD + Space)',
                price: 'Free to Play'
            }
        }
    ];
    
    generator.generateBatchGames(sampleGames);
} 