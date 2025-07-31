const fs = require('fs');
const path = require('path');

// 清理备份文件和空目录
function cleanBackupFiles() {
  console.log('🧹 开始清理备份文件和空目录...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const gamesDir = path.join(__dirname, '../public/games');
  const imagesDir = path.join(__dirname, '../public/images/games');
  
  // 清理备份文件
  console.log(`🗑️ 清理备份文件...`);
  let deletedBackups = 0;
  
  function cleanBackupsInDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        cleanBackupsInDir(filePath);
      } else if (file.endsWith('.bak')) {
        try {
          fs.unlinkSync(filePath);
          console.log(`  ✅ 删除备份文件: ${file}`);
          deletedBackups++;
        } catch (error) {
          console.log(`  ❌ 删除失败: ${file} - ${error.message}`);
        }
      }
    });
  }
  
  cleanBackupsInDir(gamesDir);
  cleanBackupsInDir(imagesDir);
  
  // 清理空目录
  console.log(`\n🗑️ 清理空目录...`);
  let deletedDirs = 0;
  
  function cleanEmptyDirs(dir) {
    const files = fs.readdirSync(dir);
    
    if (files.length === 0) {
      try {
        fs.rmdirSync(dir);
        console.log(`  ✅ 删除空目录: ${path.relative(process.cwd(), dir)}`);
        deletedDirs++;
      } catch (error) {
        console.log(`  ❌ 删除目录失败: ${path.relative(process.cwd(), dir)} - ${error.message}`);
      }
    } else {
      // 递归检查子目录
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          cleanEmptyDirs(filePath);
        }
      });
    }
  }
  
  // 检查games目录下的子目录
  const gameSubdirs = fs.readdirSync(gamesDir)
    .filter(file => {
      const filePath = path.join(gamesDir, file);
      return fs.statSync(filePath).isDirectory();
    });
  
  gameSubdirs.forEach(subdir => {
    const subdirPath = path.join(gamesDir, subdir);
    cleanEmptyDirs(subdirPath);
  });
  
  // 最终统计
  const finalHtmlFiles = fs.readdirSync(gamesDir)
    .filter(file => file.endsWith('.html'));
  
  const finalImageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.png'))
    .filter(file => !file.includes('images-alt.json'));
  
  console.log(`\n📈 清理完成总结:`);
  console.log(`  🗑️ 删除备份文件: ${deletedBackups} 个`);
  console.log(`  🗑️ 删除空目录: ${deletedDirs} 个`);
  console.log(`  📄 最终HTML文件: ${finalHtmlFiles.length} 个`);
  console.log(`  🖼️ 最终图片文件: ${finalImageFiles.length} 个`);
  
  // 列出最终的HTML文件
  console.log(`\n📋 最终HTML文件列表:`);
  finalHtmlFiles.forEach(file => {
    console.log(`  📄 ${file}`);
  });
  
  console.log(`\n🎉 备份文件和空目录清理完成！`);
}

// 运行清理
cleanBackupFiles(); 