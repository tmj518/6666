const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 新增：命令行参数解析，支持 --file ce12 --category new
const argv = process.argv.slice(2);
let cliFile = null;
let cliCategory = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--file' && argv[i + 1]) cliFile = argv[i + 1];
  if (argv[i] === '--category' && argv[i + 1]) cliCategory = argv[i + 1].toLowerCase();
}

// 新增：自动化链路前置文件存在性校验和自动重命名
if (cliFile && cliCategory) {
  const htmlPath = path.join(__dirname, `../public/games/${cliFile}.html`);
  const imgPath = path.join(__dirname, `../public/images/games/${cliFile}.png`);
  const newHtmlName = `${cliCategory}-${cliFile}.html`;
  const newImgName = `${cliCategory}-${cliFile}.png`;
  const newHtmlPath = path.join(__dirname, `../public/games/${newHtmlName}`);
  const newImgPath = path.join(__dirname, `../public/images/games/${newImgName}`);
  let renamed = false;
  if (fs.existsSync(htmlPath) && !fs.existsSync(newHtmlPath)) {
    fs.renameSync(htmlPath, newHtmlPath);
    console.log(`✅ 已自动重命名 HTML: ${cliFile}.html → ${newHtmlName}`);
    renamed = true;
  }
  if (fs.existsSync(imgPath) && !fs.existsSync(newImgPath)) {
    fs.renameSync(imgPath, newImgPath);
    console.log(`✅ 已自动重命名图片: ${cliFile}.png → ${newImgName}`);
    renamed = true;
  }
  // 删除原始备份（如有）
  const htmlBak = path.join(__dirname, `../public/games/${cliFile}.html.bak`);
  const imgBak = path.join(__dirname, `../public/images/games/${cliFile}.png.bak`);
  if (fs.existsSync(htmlBak)) fs.unlinkSync(htmlBak);
  if (fs.existsSync(imgBak)) fs.unlinkSync(imgBak);
  // 校验新文件
  if (!fs.existsSync(newHtmlPath)) {
    console.error(`❌ 未找到 public/games/${newHtmlName}，请检查上传！`);
    process.exit(1);
  }
  if (!fs.existsSync(newImgPath)) {
    console.error(`❌ 未找到 public/images/games/${newImgName}，请检查上传！`);
    process.exit(1);
  }
  if (renamed) {
    console.log(`✅ 检查通过：已找到并重命名为 ${newHtmlName} 和 ${newImgName}`);
  }
}

const steps = [
  { name: '图片优化', cmd: cliFile && cliCategory ? `node scripts/image-optimize.js --file ${cliCategory}-${cliFile} --category ${cliCategory}` : 'node scripts/image-optimize.js' },
  { name: '自动生成 games.json', cmd: cliFile && cliCategory ? `node scripts/auto-generate-games.js --file ${cliCategory}-${cliFile} --category ${cliCategory}` : 'node scripts/auto-generate-games.js' },
  { name: '清理孤立游戏数据', cmd: 'node scripts/clean-orphaned-games.js' },
  { name: '批量修复推荐区', cmd: 'node scripts/fix-recommend-area.js' },
  { name: '批量修复导航栏', cmd: 'node scripts/fix-navbar.js' },
  { name: '批量补全SEO标签', cmd: 'node scripts/seo-batch-fix.js' },
  { name: '生成SEO文件', cmd: 'node scripts/generate-seo-files.js' }
];

console.log('🚀 [全链路自动化] 开始一键自动化流程...\n');

for (const step of steps) {
  try {
    console.log(`---【${step.name}】---`);
    require('child_process').execSync(step.cmd, { stdio: 'inherit' });
    console.log(`✅ ${step.name} 完成\n`);
  } catch (err) {
    console.error(`❌ ${step.name} 失败:`, err.message);
    // 不中断，继续执行后续步骤
  }
}

console.log('\n🎉 [全链路自动化] 全部流程已完成！如有报错请查看上方日志。'); 