const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Alfie Lynard/OneDrive/Desktop/archive/Vaxicare/apps/frontend/src/pages';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\/Badge"/g, '/badge"');
    fs.writeFileSync(filePath, content);
  }
});
