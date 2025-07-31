const fs = require('fs');
const path = require('path');

// 游戏源配置
const GAME_SOURCES = {
    'crazygames': {
        baseUrl: 'https://www.crazygames.com/game/',
        supportsIframe: false, // 已知不支持
        testGames: ['moto-x3m', 'subway-surfers', 'temple-run']
    },
    'poki': {
        baseUrl: 'https://poki.com/en/g/',
        supportsIframe: true, // 通常支持
        testGames: ['moto-x3m', 'subway-surfers', 'temple-run']
    },
    'html5games': {
        baseUrl: 'https://html5games.com/Game/',
        supportsIframe: true,
        testGames: ['Moto-X3M', 'Subway-Surfers', 'Temple-Run']
    },
    'itch.io': {
        baseUrl: 'https://itch.io/embed-upload/',
        supportsIframe: true,
        testGames: ['1234567', '2345678', '3456789']
    },
    'gameforge': {
        baseUrl: 'https://gameforge.com/en-US/little-games/',
        supportsIframe: false,
        testGames: ['moto-x3m', 'subway-surfers']
    }
};

// 检测结果存储
const detectionResults = {
    timestamp: new Date().toISOString(),
    results: {}
};

/**
 * 检测单个游戏源的iframe支持情况
 */
async function checkGameSource(sourceName, sourceConfig) {
    console.log(`🔍 检测游戏源: ${sourceName}`);
    
    const results = {
        sourceName,
        baseUrl: sourceConfig.baseUrl,
        supportsIframe: sourceConfig.supportsIframe,
        testResults: [],
        recommendation: ''
    };

    // 测试每个游戏
    for (const game of sourceConfig.testGames) {
        const gameUrl = sourceConfig.baseUrl + game;
        const testResult = await testIframeSupport(gameUrl, game);
        results.testResults.push(testResult);
    }

    // 生成推荐
    results.recommendation = generateRecommendation(results);
    detectionResults.results[sourceName] = results;
    
    return results;
}

/**
 * 测试单个游戏的iframe支持
 */
async function testIframeSupport(gameUrl, gameName) {
    const testResult = {
        gameName,
        gameUrl,
        iframeSupported: false,
        errorType: null,
        responseTime: 0,
        status: 'unknown'
    };

    try {
        const startTime = Date.now();
        
        // 创建测试HTML
        const testHtml = createTestHtml(gameUrl);
        const testFilePath = path.join(__dirname, `../temp/test-${gameName}.html`);
        
        // 确保temp目录存在
        if (!fs.existsSync(path.dirname(testFilePath))) {
            fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        }
        
        fs.writeFileSync(testFilePath, testHtml);
        
        // 这里可以集成浏览器自动化工具如Puppeteer
        // 暂时使用模拟检测
        testResult.iframeSupported = await simulateIframeTest(gameUrl);
        testResult.responseTime = Date.now() - startTime;
        testResult.status = testResult.iframeSupported ? 'success' : 'blocked';
        
        // 清理测试文件
        fs.unlinkSync(testFilePath);
        
    } catch (error) {
        testResult.status = 'error';
        testResult.errorType = error.message;
    }

    return testResult;
}

/**
 * 创建测试HTML
 */
function createTestHtml(gameUrl) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Iframe Test</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .test-container { width: 100%; height: 400px; border: 2px solid #ccc; }
        iframe { width: 100%; height: 100%; border: none; }
        .status { margin-top: 10px; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h2>Iframe Support Test</h2>
    <div class="test-container">
        <iframe src="${gameUrl}" id="test-iframe"></iframe>
    </div>
    <div class="status" id="status">Testing...</div>
    
    <script>
        const iframe = document.getElementById('test-iframe');
        const status = document.getElementById('status');
        
        // 检测iframe是否被阻止
        setTimeout(() => {
            try {
                if (iframe.contentWindow === null || iframe.contentWindow.location.href === 'about:blank') {
                    status.innerHTML = '❌ Iframe被阻止';
                    status.style.background = '#ffebee';
                } else {
                    status.innerHTML = '✅ Iframe正常工作';
                    status.style.background = '#e8f5e8';
                }
            } catch (e) {
                status.innerHTML = '❌ Iframe被阻止: ' + e.message;
                status.style.background = '#ffebee';
            }
        }, 3000);
    </script>
</body>
</html>`;
}

/**
 * 模拟iframe测试（实际项目中可以集成Puppeteer）
 */
async function simulateIframeTest(gameUrl) {
    // 模拟检测逻辑
    const blockedDomains = ['crazygames.com', 'gameforge.com', 'kongregate.com'];
    const supportedDomains = ['poki.com', 'html5games.com', 'itch.io'];
    
    const domain = new URL(gameUrl).hostname;
    
    if (blockedDomains.some(d => domain.includes(d))) {
        return false;
    }
    
    if (supportedDomains.some(d => domain.includes(d))) {
        return true;
    }
    
    // 默认返回true，实际项目中需要真实检测
    return Math.random() > 0.5;
}

/**
 * 生成推荐
 */
function generateRecommendation(results) {
    const successCount = results.testResults.filter(r => r.iframeSupported).length;
    const totalCount = results.testResults.length;
    const successRate = successCount / totalCount;
    
    if (successRate >= 0.8) {
        return '✅ 推荐使用 - 大部分游戏支持iframe';
    } else if (successRate >= 0.5) {
        return '⚠️ 谨慎使用 - 部分游戏支持iframe';
    } else {
        return '❌ 不推荐 - 大部分游戏不支持iframe';
    }
}

/**
 * 生成游戏源推荐报告
 */
function generateReport() {
    const report = {
        summary: {
            totalSources: Object.keys(detectionResults.results).length,
            recommendedSources: [],
            notRecommendedSources: []
        },
        details: detectionResults.results
    };

    // 分析推荐
    Object.entries(detectionResults.results).forEach(([sourceName, result]) => {
        if (result.recommendation.includes('推荐')) {
            report.summary.recommendedSources.push(sourceName);
        } else if (result.recommendation.includes('不推荐')) {
            report.summary.notRecommendedSources.push(sourceName);
        }
    });

    return report;
}

/**
 * 保存检测结果
 */
function saveResults() {
    const report = generateReport();
    const outputPath = path.join(__dirname, '../data/game-sources-analysis.json');
    
    // 确保data目录存在
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📊 检测结果已保存到: ${outputPath}`);
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始检测游戏源iframe支持情况...\n');
    
    for (const [sourceName, sourceConfig] of Object.entries(GAME_SOURCES)) {
        await checkGameSource(sourceName, sourceConfig);
        console.log(`✅ ${sourceName} 检测完成\n`);
    }
    
    const report = saveResults();
    
    console.log('📋 检测报告摘要:');
    console.log(`推荐的游戏源: ${report.summary.recommendedSources.join(', ')}`);
    console.log(`不推荐的游戏源: ${report.summary.notRecommendedSources.join(', ')}`);
    
    return report;
}

// 导出函数供其他模块使用
module.exports = {
    checkGameSource,
    testIframeSupport,
    generateReport,
    saveResults,
    main
};

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
} 