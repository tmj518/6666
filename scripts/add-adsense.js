const fs = require('fs');
const path = require('path');

// AdSense代码
const adsenseCode = `    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6886160126549046"
         crossorigin="anonymous"></script>`;

// 递归获取所有html文件
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// 添加AdSense代码到HTML文件
function addAdSenseToFile(filePath) {
  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    
    // 检查是否已经包含AdSense代码
    if (html.includes('pagead2.googlesyndication.com')) {
      console.log(`  ⚠️  ${path.basename(filePath)} 已包含AdSense代码`);
      return false;
    }
    
    // 备份原文件
    const backupPath = filePath + '.bak';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, html);
    }
    
    // 在Google Analytics代码之前插入AdSense代码
    const analyticsPattern = /<!-- 谷歌统计代码开始（Google Analytics） -->/;
    if (analyticsPattern.test(html)) {
      html = html.replace(analyticsPattern, adsenseCode + '\n    <!-- 谷歌统计代码开始（Google Analytics） -->');
    } else {
      // 如果没有找到Google Analytics代码，在</head>之前插入
      html = html.replace('</head>', adsenseCode + '\n    </head>');
    }
    
    // 保存修改
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`  ✅ 已添加AdSense代码: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`  ❌ 处理文件失败 ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🚀 开始添加Google AdSense代码...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 获取所有HTML文件
  const publicDir = path.join(__dirname, '../public');
  const htmlFiles = getAllHtmlFiles(publicDir);
  console.log(`📁 找到 ${htmlFiles.length} 个HTML文件`);
  
  // 处理每个文件
  let processedCount = 0;
  let addedCount = 0;
  
  htmlFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    console.log(`\n🔧 处理文件: ${fileName}`);
    
    const added = addAdSenseToFile(filePath);
    processedCount++;
    if (added) addedCount++;
  });
  
  console.log(`\n📈 添加完成！`);
  console.log(`  📊 总文件数: ${processedCount}`);
  console.log(`  ✏️ 添加AdSense文件数: ${addedCount}`);
  console.log(`  ✅ 成功率: ${((processedCount / htmlFiles.length) * 100).toFixed(1)}%`);
  
  console.log('\n💡 AdSense代码已添加到以下位置:');
  console.log('   • 首页 (index.html)');
  console.log('   • 所有游戏页面');
  console.log('   • 其他HTML页面');
  
  console.log('\n🎉 完成！现在您的网站已经准备好显示Google AdSense广告了。');
  console.log('📝 注意: 请确保您的AdSense账户已获得批准，并且网站符合AdSense政策。');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  addAdSenseToFile,
  getAllHtmlFiles
}; 