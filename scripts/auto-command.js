const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 命令解析器
class CommandParser {
  constructor() {
    this.commands = {
      '把': this.parseMoveCommand.bind(this),
      '放到': this.parseMoveCommand.bind(this),
      '归类': this.parseMoveCommand.bind(this),
      '分类': this.parseMoveCommand.bind(this),
      '上传': this.parseUploadCommand.bind(this),
      '添加': this.parseUploadCommand.bind(this)
    };
  }

  // 解析移动/归类命令
  parseMoveCommand(text) {
    // 匹配模式：把 [游戏名] 放到 [分类] 分类
    const patterns = [
      /把\s+(\w+)\s+放到\s+(\w+)\s*分类?/i,
      /把\s+(\w+)\s+归类到\s+(\w+)\s*分类?/i,
      /(\w+)\s+放到\s+(\w+)\s*分类?/i,
      /(\w+)\s+归类到\s+(\w+)\s*分类?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'move',
          gameName: match[1].toLowerCase(),
          category: match[2].toLowerCase(),
          originalText: text
        };
      }
    }
    return null;
  }

  // 解析上传命令
  parseUploadCommand(text) {
    // 匹配模式：上传 [游戏名] 到 [分类] 分类
    const patterns = [
      /上传\s+(\w+)\s+到\s+(\w+)\s*分类?/i,
      /添加\s+(\w+)\s+到\s+(\w+)\s*分类?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'upload',
          gameName: match[1].toLowerCase(),
          category: match[2].toLowerCase(),
          originalText: text
        };
      }
    }
    return null;
  }

  // 解析命令
  parse(text) {
    for (const [keyword, parser] of Object.entries(this.commands)) {
      if (text.includes(keyword)) {
        const result = parser(text);
        if (result) return result;
      }
    }
    return null;
  }
}

// 自动化执行器
class AutoExecutor {
  constructor() {
    this.parser = new CommandParser();
    this.gamesDir = path.join(__dirname, '../public/games');
    this.imagesDir = path.join(__dirname, '../public/images/games');
    this.dataFile = path.join(__dirname, '../public/data/games.json');
  }

  // 执行命令
  async executeCommand(text) {
    console.log(`🎯 解析命令: "${text}"`);
    
    const command = this.parser.parse(text);
    if (!command) {
      console.log('❌ 无法解析命令，请使用以下格式：');
      console.log('  - 把 ce12 放到 new 分类');
      console.log('  - 把 puzzle2048 归类到 puzzle 分类');
      console.log('  - 上传 action1 到 action 分类');
      return false;
    }

    console.log(`✅ 命令解析成功: ${command.type} - ${command.gameName} -> ${command.category}`);

    try {
      switch (command.type) {
        case 'move':
        case 'upload':
          await this.executeGameOperation(command);
          break;
        default:
          console.log('❌ 不支持的命令类型');
          return false;
      }
      return true;
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      return false;
    }
  }

  // 执行游戏操作
  async executeGameOperation(command) {
    const { gameName, category } = command;
    
    console.log('\n🚀 开始自动化流程...');
    
    // 1. 检查游戏文件是否存在
    const gameFile = await this.findGameFile(gameName);
    if (!gameFile) {
      console.log(`❌ 未找到游戏文件: ${gameName}`);
      return;
    }

    // 2. 检查图片文件
    const imageFile = await this.findImageFile(gameName);
    if (!imageFile) {
      console.log(`⚠️ 未找到图片文件: ${gameName}`);
    }

    // 3. 自动重命名文件（新增）
    await this.renameFiles(gameName, category, gameFile, imageFile);

    // 4. 执行全链路自动化
    const steps = [
      { name: '图片优化', cmd: `npx cross-env GAME_CATEGORY=${category} node scripts/image-optimize.js --file ${category}-${gameName} --category ${category}` },
      { name: '自动生成 games.json', cmd: `node scripts/auto-generate-games.js --file ${category}-${gameName} --category ${category}` },
      { name: '批量修复导航栏', cmd: 'node scripts/fix-navbar.js' },
      { name: '批量修复推荐区', cmd: 'node scripts/fix-recommend-area.js' },
      { name: '批量补全SEO标签', cmd: 'node scripts/seo-batch-fix.js' },
      { name: '生成SEO文件', cmd: 'node scripts/generate-seo-files.js' }
    ];

    for (const step of steps) {
      console.log(`\n📋 执行: ${step.name}`);
      try {
        const { stdout, stderr } = await execAsync(step.cmd);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        console.log(`✅ ${step.name} 完成`);
      } catch (error) {
        console.log(`⚠️ ${step.name} 执行中遇到问题:`, error.message);
        // 继续执行下一步
      }
    }

    console.log('\n🎉 自动化流程完成！');
    console.log(`📁 游戏文件: ${category}-${gameName}.html`);
    if (imageFile) console.log(`🖼️ 图片文件: ${category}-${gameName}.webp/.jpg`);
    console.log(`🏷️ 分类: ${category}`);
    console.log(`🌐 前端页面已自动更新，请访问对应分类查看`);
  }

  // 自动重命名文件（新增方法）
  async renameFiles(gameName, category, gameFile, imageFile) {
    console.log(`\n📝 开始文件重命名...`);
    
    try {
      // 重命名HTML文件
      const oldHtmlPath = path.join(this.gamesDir, gameFile);
      const newHtmlName = `${category}-${gameName}.html`;
      const newHtmlPath = path.join(this.gamesDir, newHtmlName);
      
      if (gameFile !== newHtmlName && !await fs.pathExists(newHtmlPath)) {
        await fs.move(oldHtmlPath, newHtmlPath);
        console.log(`✅ HTML文件重命名: ${gameFile} → ${newHtmlName}`);
      } else if (gameFile === newHtmlName) {
        console.log(`✅ HTML文件已符合命名规范: ${gameFile}`);
      } else {
        console.log(`⚠️ HTML文件已存在: ${newHtmlName}`);
      }

      // 重命名图片文件
      if (imageFile) {
        const oldImgPath = path.join(this.imagesDir, imageFile);
        const imgExt = path.extname(imageFile);
        const newImgName = `${category}-${gameName}${imgExt}`;
        const newImgPath = path.join(this.imagesDir, newImgName);
        
        if (imageFile !== newImgName && !await fs.pathExists(newImgPath)) {
          await fs.move(oldImgPath, newImgPath);
          console.log(`✅ 图片文件重命名: ${imageFile} → ${newImgName}`);
        } else if (imageFile === newImgName) {
          console.log(`✅ 图片文件已符合命名规范: ${imageFile}`);
        } else {
          console.log(`⚠️ 图片文件已存在: ${newImgName}`);
        }
      }
      
      console.log(`✅ 文件重命名完成`);
    } catch (error) {
      console.log(`⚠️ 文件重命名过程中遇到问题: ${error.message}`);
    }
  }

  // 查找游戏文件
  async findGameFile(gameName) {
    const files = await fs.readdir(this.gamesDir);
    const patterns = [
      `${gameName}.html`,
      `${gameName}_*.html`,
      `*${gameName}*.html`
    ];

    for (const pattern of patterns) {
      const matches = files.filter(f => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(f);
        }
        return f === pattern;
      });
      if (matches.length > 0) {
        return matches[0];
      }
    }
    return null;
  }

  // 查找图片文件
  async findImageFile(gameName) {
    const files = await fs.readdir(this.imagesDir);
    const patterns = [
      `${gameName}.jpg`,
      `${gameName}.webp`,
      `${gameName}.png`,
      `*${gameName}*.jpg`,
      `*${gameName}*.webp`,
      `*${gameName}*.png`
    ];

    for (const pattern of patterns) {
      const matches = files.filter(f => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(f);
        }
        return f === pattern;
      });
      if (matches.length > 0) {
        return matches[0];
      }
    }
    return null;
  }
}

// 命令行接口
async function main() {
  const executor = new AutoExecutor();
  
  // 从命令行参数获取命令
  const command = process.argv.slice(2).join(' ');
  
  if (!command) {
    console.log('🎮 PlayHTML5 智能命令系统');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 使用方法:');
    console.log('  node scripts/auto-command.js "把 ce12 放到 new 分类"');
    console.log('  node scripts/auto-command.js "把 puzzle2048 归类到 puzzle 分类"');
    console.log('  node scripts/auto-command.js "上传 action1 到 action 分类"');
    console.log('');
    console.log('🎯 支持的命令格式:');
    console.log('  - 把 [游戏名] 放到 [分类] 分类');
    console.log('  - 把 [游戏名] 归类到 [分类] 分类');
    console.log('  - 上传 [游戏名] 到 [分类] 分类');
    console.log('  - 添加 [游戏名] 到 [分类] 分类');
    console.log('');
    console.log('📂 支持的分类: new, popular, puzzle, action, arcade, strategy, adventure, card, sports, educational');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  const success = await executor.executeCommand(command);
  process.exit(success ? 0 : 1);
}

// 导出供其他模块使用
module.exports = { CommandParser, AutoExecutor };

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
} 