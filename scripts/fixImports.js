const fs = require('fs');
const path = require('path');

const replacements = [
  { from: "require('../models/Activity.model')", to: "require('../models/sql')" },
  { from: "require('../models/Approval.model')", to: "require('../models/sql')" },
  { from: "require('../models/CalendarEvent.model')", to: "require('../models/sql')" },
  { from: "require('../models/Client.model')", to: "require('../models/sql')" },
  { from: "require('../models/Deliverable.model')", to: "require('../models/sql')" },
  { from: "require('../models/Message.model')", to: "require('../models/sql')" },
  { from: "require('../models/Notification.model')", to: "require('../models/sql')" },
  { from: "require('../models/Project.model')", to: "require('../models/sql')" },
  { from: "require('../models/Task.model')", to: "require('../models/sql')" },
  { from: "require('../models/TimeTracking.model')", to: "require('../models/sql')" },
  { from: "require('../models/User.model')", to: "require('../models/sql')" }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('sql')) {
      walkDir(filePath);
    } else if (file.endsWith('.js')) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Fixing imports...\n');
walkDir(path.join(__dirname, '..', 'routes'));
walkDir(path.join(__dirname, '..', 'controllers'));
walkDir(path.join(__dirname, '..', 'utils'));
console.log('\n✅ All imports fixed!');
