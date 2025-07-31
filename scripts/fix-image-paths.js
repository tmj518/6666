const fs = require('fs');
const path = require('path');

// 读取games.json
const gamesPath = path.join(__dirname, '../public/data/games.json');
const imagesDir = path.join(__dirname, '../public/images/games');

console.log('🔍 开始修复图片路径...');

// 读取games.json
const gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

// 获取所有实际存在的图片文件
const imageFiles = fs.readdirSync(imagesDir);
console.log(`📁 找到 ${imageFiles.length} 个图片文件`);

// 创建图片文件名映射（去掉扩展名）
const imageMap = {};
imageFiles.forEach(file => {
    const nameWithoutExt = path.parse(file).name;
    const ext = path.parse(file).ext.toLowerCase();
    
    if (!imageMap[nameWithoutExt]) {
        imageMap[nameWithoutExt] = [];
    }
    imageMap[nameWithoutExt].push({ file, ext });
});

// 修复每个游戏的图片路径
let fixedCount = 0;
let missingCount = 0;

gamesData.games.forEach(game => {
    const originalImage = game.image;
    
    // 如果是外链图片，跳过
    if (originalImage.startsWith('http')) {
        return;
    }
    
    // 从路径中提取文件名（去掉扩展名）
    const imagePath = originalImage.replace('/images/games/', '');
    const nameWithoutExt = path.parse(imagePath).name;
    
    // 查找对应的图片文件
    if (imageMap[nameWithoutExt]) {
        // 按优先级排序：webp > jpg > png
        const sortedFiles = imageMap[nameWithoutExt].sort((a, b) => {
            const priority = { '.webp': 3, '.jpg': 2, '.png': 1 };
            return (priority[b.ext] || 0) - (priority[a.ext] || 0);
        });
        
        const bestFile = sortedFiles[0];
        const newImagePath = `/images/games/${bestFile.file}`;
        
        if (originalImage !== newImagePath) {
            console.log(`✅ 修复: ${originalImage} → ${newImagePath}`);
            game.image = newImagePath;
            fixedCount++;
        }
    } else {
        // 尝试查找相似名称的图片
        const similarImages = Object.keys(imageMap).filter(key => 
            key.includes(nameWithoutExt) || nameWithoutExt.includes(key)
        );
        
        if (similarImages.length > 0) {
            const bestMatch = similarImages[0];
            const sortedFiles = imageMap[bestMatch].sort((a, b) => {
                const priority = { '.webp': 3, '.jpg': 2, '.png': 1 };
                return (priority[b.ext] || 0) - (priority[a.ext] || 0);
            });
            
            const bestFile = sortedFiles[0];
            const newImagePath = `/images/games/${bestFile.file}`;
            
            console.log(`🔧 相似匹配: ${originalImage} → ${newImagePath} (匹配: ${bestMatch})`);
            game.image = newImagePath;
            fixedCount++;
        } else {
            console.log(`❌ 缺失图片: ${originalImage}`);
            missingCount++;
            
            // 使用占位图
            game.image = 'https://picsum.photos/seed/placeholder/400/300';
        }
    }
});

// 保存修复后的games.json
fs.writeFileSync(gamesPath, JSON.stringify(gamesData, null, 2), 'utf8');

console.log('\n🎉 图片路径修复完成！');
console.log(`✅ 修复了 ${fixedCount} 个图片路径`);
console.log(`❌ 缺失 ${missingCount} 个图片文件`);
console.log(`📁 修复后的文件: ${gamesPath}`);

if (missingCount > 0) {
    console.log('\n💡 建议:');
    console.log('1. 运行图片优化脚本生成缺失的图片');
    console.log('2. 或手动添加对应的图片文件到 public/images/games/ 目录');
} 