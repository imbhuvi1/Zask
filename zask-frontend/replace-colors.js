const fs = require('fs');
const path = require('path');

const files = [
  'app/features/home/home.component.html',
  'app/features/workspace/dashboard/dashboard.component.ts',
  'app/features/notifications/notifications.component.html',
  'app/features/board/public-boards/public-boards.component.html',
  'app/core/components/main-layout/main-layout.component.ts'
];

const basePath = path.join(__dirname, 'src');

for (const file of files) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace indigo with orange
    content = content.replace(/indigo/g, 'orange');
    
    // Replace purple with red
    content = content.replace(/purple/g, 'red');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
