const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// 监听规则
const watchDirs = [
  'public/images/games',
  'public/games'
];
const syncRules = [
  { src: 'src/data', dest: 'public/data' },
  { src: 'src/assets/js', dest: 'public/js' }
];

// 交互式获取分类
async function getCategoryInteractive() {
  if (process.env.GAME_CATEGORY) return process.env.GAME_CATEGORY.toLowerCase();
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('请输入要归类的游戏分类（如 new、arcade、popular、puzzle...）：', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// 全链路自动化函数，支持交互式分类参数
async function runFullAuto() {
  const gameCategory = await getCategoryInteractive();
  const steps = [
    { name: '图片优化', cmd: gameCategory ? `npx cross-env GAME_CATEGORY=${gameCategory} node scripts/image-optimize.js` : 'npx cross-env node scripts/image-optimize.js' },
    { name: '自动生成 games.json', cmd: 'node scripts/auto-generate-games.js' },
    { name: '批量修复导航栏', cmd: 'node scripts/fix-navbar.js' },
    { name: '批量修复推荐区', cmd: 'node scripts/fix-recommend-area.js' },
    { name: '批量补全SEO标签', cmd: 'node scripts/seo-batch-fix.js' },
    { name: '生成SEO文件', cmd: 'node scripts/generate-seo-files.js' }
  ];
  let i = 0;
  function next() {
    if (i >= steps.length) {
      return;
    }
    const step = steps[i++];
    console.log(`---【${step.name}】---`);
    exec(step.cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ ${step.name} 失败:`, err.message);
        running = false;
        console.log('\n=================【全链路自动化异常终止】=================\n');
        return; // 失败时终止链路
      } else {
        process.stdout.write(stdout);
        console.log(`✅ ${step.name} 完成`);
      }
      next();
    });
  }
  next();
}

// 增加执行锁，防止并发
let running = false;
let timer = null;
function debounceFullAuto() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    if (running) {
      console.log('⚠️ 自动化链路正在执行中，跳过本次触发');
      return;
    }
    running = true;
    console.log('\n=================【全链路自动化开始】=================\n');
    await runFullAuto();
    console.log('\n=================【全链路自动化结束】=================\n');
    running = false;
  }, 1000);
}

// 启动 public 目录监听（全链路自动化）
console.log('👀 正在监听 public/images/games 和 public/games 目录变动...');
console.log('👀 正在监听 src/data 和 src/assets/js 目录变动（自动同步到 public）...');
watchDirs.forEach(dir => {
  const watcher = chokidar.watch(dir, { ignoreInitial: true });
  const handler = async (filePath) => {
    if (filePath.endsWith('images-alt.json')) return; // 跳过 alt 文件
    console.log(`📦 检测到变动: ${filePath}`);
    debounceFullAuto();
  };
  watcher.on('add', handler).on('change', handler);
});

// 启动 src 目录监听（只做同步，不触发全链路自动化）
syncRules.forEach(({ src, dest }) => {
  chokidar.watch(src, { ignoreInitial: true }).on('all', (event, filePath) => {
    const relPath = path.relative(src, filePath);
    const destPath = path.join(dest, relPath);
    if (event === 'add' || event === 'change') {
      fs.copy(filePath, destPath).then(() => {
        console.log(`[同步] ${filePath} → ${destPath}`);
      });
    }
    if (event === 'unlink') {
      fs.remove(destPath).then(() => {
        console.log(`[删除] ${destPath}`);
      });
    }
  });
}); 