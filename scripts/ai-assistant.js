const { AutoExecutor } = require('./auto-command');
const readline = require('readline');

class AIAssistant {
  constructor() {
    this.executor = new AutoExecutor();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // 显示欢迎信息
  showWelcome() {
    console.log('\n🎮 PlayHTML5 AI 助手');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 智能命令系统已启动！');
    console.log('💡 你可以直接输入自然语言命令，我会自动执行所有操作');
    console.log('');
    console.log('📝 示例命令:');
    console.log('  > 把 ce12 放到 new 分类');
    console.log('  > 把 puzzle2048 归类到 puzzle 分类');
    console.log('  > 上传 action1 到 action 分类');
    console.log('');
    console.log('🎯 支持的操作:');
    console.log('  ✅ 图片自动优化与重命名');
    console.log('  ✅ 分类自动归类');
    console.log('  ✅ games.json 自动同步');
    console.log('  ✅ SEO 标签自动补全');
    console.log('  ✅ 推荐区自动插入');
    console.log('  ✅ 导航栏自动修复');
    console.log('  ✅ 前端页面自动展示');
    console.log('  ✅ 备份自动清理');
    console.log('');
    console.log('📂 支持的分类: new, popular, puzzle, action, arcade, strategy, adventure, card, sports, educational');
    console.log('');
    console.log('💬 输入 "quit" 或 "exit" 退出');
    console.log('💬 输入 "help" 查看帮助');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 显示帮助信息
  showHelp() {
    console.log('\n📖 帮助信息');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 命令格式:');
    console.log('  > 把 [游戏名] 放到 [分类] 分类');
    console.log('  > 把 [游戏名] 归类到 [分类] 分类');
    console.log('  > 上传 [游戏名] 到 [分类] 分类');
    console.log('  > 添加 [游戏名] 到 [分类] 分类');
    console.log('');
    console.log('📂 支持的分类:');
    console.log('  - new (新游戏)');
    console.log('  - popular (热门游戏)');
    console.log('  - puzzle (益智游戏)');
    console.log('  - action (动作游戏)');
    console.log('  - arcade (街机游戏)');
    console.log('  - strategy (策略游戏)');
    console.log('  - adventure (冒险游戏)');
    console.log('  - card (卡牌游戏)');
    console.log('  - sports (体育游戏)');
    console.log('  - educational (教育游戏)');
    console.log('');
    console.log('🔄 自动化流程:');
    console.log('  1. 图片自动优化与重命名');
    console.log('  2. 分类自动归类');
    console.log('  3. games.json 自动同步');
    console.log('  4. SEO 标签自动补全');
    console.log('  5. 推荐区自动插入');
    console.log('  6. 导航栏自动修复');
    console.log('  7. 前端页面自动展示');
    console.log('  8. 备份自动清理');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // 处理用户输入
  async processInput(input) {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      return;
    }

    // 特殊命令处理
    if (['quit', 'exit', '退出'].includes(trimmedInput.toLowerCase())) {
      console.log('\n👋 再见！AI 助手已退出');
      this.rl.close();
      process.exit(0);
      return;
    }

    if (['help', '帮助', '?', 'h'].includes(trimmedInput.toLowerCase())) {
      this.showHelp();
      return;
    }

    // 执行游戏操作命令
    console.log(`\n🤖 正在处理命令: "${trimmedInput}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const startTime = Date.now();
    const success = await this.executor.executeCommand(trimmedInput);
    const endTime = Date.now();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (success) {
      console.log(`✅ 命令执行成功！耗时: ${endTime - startTime}ms`);
    } else {
      console.log(`❌ 命令执行失败！耗时: ${endTime - startTime}ms`);
    }
    
    console.log('\n💬 请输入下一个命令，或输入 "help" 查看帮助，输入 "quit" 退出\n');
  }

  // 启动AI助手
  async start() {
    this.showWelcome();
    
    this.rl.on('line', async (input) => {
      await this.processInput(input);
    });

    this.rl.on('close', () => {
      console.log('\n👋 AI 助手已退出');
      process.exit(0);
    });

    // 处理 Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\n👋 检测到 Ctrl+C，AI 助手正在退出...');
      this.rl.close();
    });
  }
}

// 启动AI助手
async function main() {
  const assistant = new AIAssistant();
  await assistant.start();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIAssistant; 