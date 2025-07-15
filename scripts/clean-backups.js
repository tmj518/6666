const fs = require('fs');
const path = require('path');

// 备份清理配置
const BACKUP_CONFIG = {
  maxBackups: {
    'games-json': 15,    // 游戏数据最重要
    'html-pages': 20,    // 页面文件较多
    'seo-files': 15,     // SEO文件中等
    'images': 10,        // 图片占用空间大
    'default': 15        // 其他类型默认
  },
  minRetentionDays: 7,   // 至少保留7天内的5个备份
  maxTotalSize: 500 * 1024 * 1024  // 500MB总大小限制
};

const BACKUP_DIR = path.resolve(__dirname, '../backups');

// 获取文件大小的可读格式
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件类型
function getFileType(filename) {
  if (filename.includes('games.json')) return 'games-json';
  if (filename.includes('.html')) return 'html-pages';
  if (filename.includes('seo') || filename.includes('sitemap') || filename.includes('robots')) return 'seo-files';
  if (filename.includes('.jpg') || filename.includes('.webp') || filename.includes('.png')) return 'images';
  return 'default';
}

// 清理指定类型的备份
function cleanBackupType(type, maxCount) {
  const typeDir = path.join(BACKUP_DIR, type);
  
  if (!fs.existsSync(typeDir)) {
    console.log(`📁 备份类型目录不存在: ${type}`);
    return { deleted: 0, kept: 0, size: 0 };
  }

  const files = fs.readdirSync(typeDir)
    .map(name => {
      const filePath = path.join(typeDir, name);
      const stats = fs.statSync(filePath);
      return {
        name,
        path: filePath,
        time: stats.mtime.getTime(),
        size: stats.size,
        type: getFileType(name)
      };
    })
    .filter(file => file.type === type || type === 'default')
    .sort((a, b) => b.time - a.time); // 新的在前

  if (files.length <= maxCount) {
    console.log(`✅ ${type}: 备份数量 (${files.length}) <= 限制 (${maxCount}), 无需清理`);
    return { 
      deleted: 0, 
      kept: files.length, 
      size: files.reduce((sum, f) => sum + f.size, 0) 
    };
  }

  const toDelete = files.slice(maxCount);
  const toKeep = files.slice(0, maxCount);

  // 删除旧备份
  toDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      console.log(`🗑️  删除旧备份: ${type}/${file.name} (${formatFileSize(file.size)})`);
    } catch (error) {
      console.error(`❌ 删除失败: ${file.name}`, error.message);
    }
  });

  const totalSize = toKeep.reduce((sum, f) => sum + f.size, 0);
  console.log(`✅ ${type}: 清理完成 - 删除 ${toDelete.length} 个, 保留 ${toKeep.length} 个, 总大小: ${formatFileSize(totalSize)}`);

  return { 
    deleted: toDelete.length, 
    kept: toKeep.length, 
    size: totalSize 
  };
}

// 主清理函数
function cleanBackups() {
  console.log('🧹 开始智能备份清理...');
  console.log(`📂 备份目录: ${BACKUP_DIR}`);

  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ 备份目录不存在，跳过清理');
    return;
  }

  const startTime = Date.now();
  let totalDeleted = 0;
  let totalKept = 0;
  let totalSize = 0;

  // 按类型清理
  Object.entries(BACKUP_CONFIG.maxBackups).forEach(([type, maxCount]) => {
    console.log(`\n🔍 清理类型: ${type} (保留 ${maxCount} 个)`);
    const result = cleanBackupType(type, maxCount);
    totalDeleted += result.deleted;
    totalKept += result.kept;
    totalSize += result.size;
  });

  // 清理根目录下的其他文件
  console.log(`\n🔍 清理根目录其他文件`);
  const rootFiles = fs.readdirSync(BACKUP_DIR)
    .map(name => {
      const filePath = path.join(BACKUP_DIR, name);
      const stats = fs.statSync(filePath);
      return {
        name,
        path: filePath,
        time: stats.mtime.getTime(),
        size: stats.size,
        isDirectory: stats.isDirectory()
      };
    })
    .filter(file => file.isDirectory && !Object.keys(BACKUP_CONFIG.maxBackups).includes(file.name))
    .sort((a, b) => b.time - a.time);

  if (rootFiles.length > 0) {
    console.log(`📁 发现未分类目录: ${rootFiles.map(f => f.name).join(', ')}`);
    // 对未分类目录使用默认配置
    rootFiles.forEach(dir => {
      const result = cleanBackupType(dir.name, BACKUP_CONFIG.maxBackups.default);
      totalDeleted += result.deleted;
      totalKept += result.kept;
      totalSize += result.size;
    });
  }

  const duration = Date.now() - startTime;
  console.log(`\n🎉 备份清理完成!`);
  console.log(`📊 统计: 删除 ${totalDeleted} 个文件, 保留 ${totalKept} 个文件`);
  console.log(`💾 总大小: ${formatFileSize(totalSize)}`);
  console.log(`⏱️  耗时: ${duration}ms`);

  // 检查总大小限制
  if (totalSize > BACKUP_CONFIG.maxTotalSize) {
    console.log(`⚠️  警告: 总备份大小 (${formatFileSize(totalSize)}) 超过限制 (${formatFileSize(BACKUP_CONFIG.maxTotalSize)})`);
    console.log(`💡 建议: 减少保留数量或清理更多旧备份`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanBackups();
}

module.exports = { cleanBackups, BACKUP_CONFIG }; 