const SmartGameGenerator = require('./smart-game-generator');

// 创建生成器实例
const generator = new SmartGameGenerator();

// Mouse Mouse Climb the House 游戏数据
const mouseGameData = [
    {
        gameName: 'Mouse Mouse Climb the House',
        gameUrl: 'https://poki.com/zh/g/mouse-mouse-climb-the-house#utm_source=redirect-en-zh',
        keywords: ['Multiplayer obstacle game', 'Fast-paced game', 'Adventure game', 'Mouse game', 'Climbing game', 'House adventure'],
        description: 'Join the thrilling adventure as a brave mouse climbing through a mysterious house filled with obstacles and challenges in this fast-paced multiplayer obstacle game.',
        genre: ['Adventure', 'Obstacle', 'Multiplayer', 'Fast-paced'],
        controls: [
            { title: 'Movement', description: 'Use arrow keys or WASD to move your mouse character' },
            { title: 'Jump', description: 'Press SPACE or UP arrow to jump over obstacles' },
            { title: 'Climb', description: 'Press UP when near climbable surfaces to ascend' },
            { title: 'Multiplayer', description: 'Play with friends in real-time multiplayer mode' }
        ],
        gameInfo: {
            title: 'Mouse Mouse Climb the House',
            genre: ['Adventure', 'Obstacle', 'Multiplayer', 'Fast-paced'],
            type: 'Multiplayer Obstacle Adventure, Real-time',
            platform: 'Web Browser (HTML5)',
            controls: 'Keyboard (Arrow Keys/WASD + Space)',
            price: 'Free to Play'
        }
    }
];

// 运行生成
async function generateMouseGame() {
    console.log('🐭 开始生成 Mouse Mouse Climb the House 游戏页面...\n');
    
    try {
        const results = await generator.generateBatchGames(mouseGameData);
        
        console.log('\n📋 生成结果:');
        results.forEach(result => {
            if (result.error) {
                console.log(`❌ 生成失败: ${result.error}`);
            } else {
                console.log(`✅ 游戏页面生成成功!`);
                console.log(`📁 文件位置: ${result.filePath}`);
                console.log(`🎮 显示模式: ${result.displayType}`);
                console.log(`🔗 游戏链接: ${mouseGameData[0].gameUrl}`);
            }
        });
        
        console.log('\n🎯 页面特色:');
        console.log('• 完整的SEO优化 (title, meta, structured data)');
        console.log('• 响应式设计 (手机/平板/桌面)');
        console.log('• 苹果风格配色方案');
        console.log('• 智能iframe检测和显示');
        console.log('• 游戏操作说明和基本信息');
        
        console.log('\n🚀 页面已生成完成，可以立即访问!');
        
    } catch (error) {
        console.error('❌ 生成过程中出现错误:', error.message);
    }
}

// 运行生成
generateMouseGame(); 