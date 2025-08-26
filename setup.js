#!/usr/bin/env node
/**
 * Olori Animate Setup Script
 * Initializes the project and checks all dependencies
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkNodeVersion() {
  log('🔍 Checking Node.js version...', colors.blue);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`❌ Node.js ${nodeVersion} is not supported. Please install Node.js 18 or higher.`, colors.red);
    process.exit(1);
  }
  
  log(`✅ Node.js ${nodeVersion} is supported`, colors.green);
}

function checkPython() {
  log('🔍 Checking Python installation...', colors.blue);
  
  try {
    const pythonVersion = execSync('python3 --version', { encoding: 'utf8' });
    log(`✅ ${pythonVersion.trim()}`, colors.green);
  } catch (error) {
    try {
      const pythonVersion = execSync('python --version', { encoding: 'utf8' });
      log(`⚠️ ${pythonVersion.trim()} (recommended to use python3)`, colors.yellow);
    } catch (error) {
      log('❌ Python not found. Please install Python 3.8 or higher.', colors.red);
      process.exit(1);
    }
  }
}

function createDirectories() {
  log('📁 Creating directories...', colors.blue);
  
  const directories = [
    'logs',
    'uploads',
    'ai_engine/logs',
    'ai_engine/models',
    'assets/icons'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`✅ Created ${dir}`, colors.green);
    }
  });
}

function copyEnvFiles() {
  log('⚙️ Setting up environment files...', colors.blue);
  
  const envFiles = [
    { src: '.env.example', dest: '.env' },
    { src: 'backend/.env.example', dest: 'backend/.env' }
  ];
  
  envFiles.forEach(({ src, dest }) => {
    const srcPath = path.join(__dirname, src);
    const destPath = path.join(__dirname, dest);
    
    if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      log(`✅ Created ${dest}`, colors.green);
    }
  });
}

function checkGitignore() {
  log('📝 Checking .gitignore...', colors.blue);
  
  const gitignorePath = path.join(__dirname, '.gitignore');
  const gitignoreContent = `
# Dependencies
node_modules/
*/node_modules/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*

# Build outputs
dist/
build/
*/build/
*/dist/

# AI Engine
ai_engine/logs/
ai_engine/models/
ai_engine/__pycache__/
ai_engine/cache/
*.pyc
*.pyo
*.pyd
__pycache__/

# Uploads and exports
uploads/
exports/*.mp4
exports/*.mov
exports/*.gif

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Electron
out/
`;
  
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent.trim());
    log('✅ Created .gitignore', colors.green);
  }
}

async function main() {
  log('🚀 Olori Animate Setup', colors.bright + colors.blue);
  log('========================', colors.blue);
  
  try {
    checkNodeVersion();
    checkPython();
    createDirectories();
    copyEnvFiles();
    checkGitignore();
    
    log('\n🎉 Setup completed successfully!', colors.bright + colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Install Python dependencies: cd ai_engine && pip install -r requirements.txt');
    log('2. Start development: npm run dev');
    log('3. Or start services individually:');
    log('   - Frontend: npm run dev:frontend');
    log('   - Backend: npm run dev:backend');
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}