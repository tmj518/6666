const SmartGameGenerator = require('./smart-game-generator');

// 创建生成器实例
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
    },
    {
        gameName: 'Subway Surfers',
        gameUrl: 'https://poki.com/en/g/subway-surfers',
        keywords: ['Running', 'Endless Runner', 'Mobile Game', 'Adventure', 'Collect Coins'],
        description: 'Run, jump, and dodge through the subway in this endless runner adventure game.',
        genre: ['Running', 'Adventure', 'Arcade'],
        controls: [
            { title: 'Movement', description: 'Use arrow keys or swipe to move left, right, up, down' },
            { title: 'Jump', description: 'Press UP or swipe up to jump over obstacles' },
            { title: 'Roll', description: 'Press DOWN or swipe down to roll under barriers' }
        ],
        gameInfo: {
            title: 'Subway Surfers',
            genre: ['Running', 'Adventure', 'Arcade'],
            type: 'Endless Runner, 1 Player',
            platform: 'Web Browser (HTML5)',
            controls: 'Keyboard (Arrow Keys) or Touch',
            price: 'Free to Play'
        }
    },
    {
        gameName: 'Temple Run',
        gameUrl: 'https://html5games.com/Game/Temple-Run',
        keywords: ['Running', 'Adventure', 'Temple', 'Obstacles', 'Collect Gems'],
        description: 'Run through ancient temples, avoid obstacles, and collect precious gems in this thrilling adventure.',
        genre: ['Running', 'Adventure', 'Arcade'],
        controls: [
            { title: 'Turn Left', description: 'Press LEFT or swipe left to turn left' },
            { title: 'Turn Right', description: 'Press RIGHT or swipe right to turn right' },
            { title: 'Jump', description: 'Press UP or swipe up to jump over obstacles' },
            { title: 'Slide', description: 'Press DOWN or swipe down to slide under barriers' }
        ],
        gameInfo: {
            title: 'Temple Run',
            genre: ['Running', 'Adventure', 'Arcade'],
            type: 'Endless Runner, 1 Player',
            platform: 'Web Browser (HTML5)',
            controls: 'Keyboard (Arrow Keys) or Touch',
            price: 'Free to Play'
        }
    }
];

// 运行批量生成
async function runExample() {
    console.log('🎮 智能游戏页面生成器示例\n');
    
    try {
        const results = await generator.generateBatchGames(sampleGames);
        
        console.log('\n📋 生成结果摘要:');
        results.forEach(result => {
            if (result.error) {
                console.log(`❌ ${result.gameName}: ${result.error}`);
            } else {
                console.log(`✅ ${result.gameName}: ${result.displayType} 模式`);
            }
        });
        
        console.log('\n🎯 使用说明:');
        console.log('1. 修改 sampleGames 数组添加更多游戏');
        console.log('2. 运行脚本: node scripts/generate-game-example.js');
        console.log('3. 生成的页面保存在 public/games/ 目录');
        console.log('4. 查看 data/batch-generation-report.json 获取详细报告');
        
    } catch (error) {
        console.error('❌ 生成过程中出现错误:', error.message);
    }
}

// 运行示例
runExample(); 