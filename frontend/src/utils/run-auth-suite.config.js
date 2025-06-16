#!/usr/bin/env node

/**
 * AUTH SUITE RUNNER - Centralized
 * Script per eseguire la suite completa di test Authentication
 * dalla directory centralizzata smile_adventure/tests/auth
 * 
 * Usage:
 *   node run-auth-suite.js --help           # Mostra help
 *   node run-auth-suite.js --all            # Esegue tutti i test
 *   node run-auth-suite.js --unit           # Solo unit tests
 *   node run-auth-suite.js --e2e            # Solo E2E tests
 *   node run-auth-suite.js --backend        # Solo backend API tests
 *   node run-auth-suite.js --coverage       # Con coverage report
 *   node run-auth-suite.js --watch          # Modalità watch
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colori per output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Percorsi configurazione - aggiornati per la nuova posizione in frontend/tests/auth/
const paths = {
  testsDir: path.resolve(__dirname),
  frontendRoot: path.resolve(__dirname, '../..'),  // frontend/
  projectRoot: path.resolve(__dirname, '../../..'), // smile_adventure/
  backendRoot: path.resolve(__dirname, '../../../backend')
};

// Banner della suite
const printBanner = () => {
  console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                  🔐 AUTHENTICATION TEST SUITE                ║
║                     (Centralized Version)                   ║
║                                                              ║
║  Smile Adventure - Suite completa test autenticazione       ║
║  Location: smile_adventure/frontend/tests/auth/              ║
║  Coverage: Registration, Login, Token Management, RBAC      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
};

// Configurazione test
const testConfig = {
  unit: {
    name: 'Unit Tests (Jest + RTL)',
    pattern: '*.test.js',
    command: 'npm test',
    workingDir: paths.frontendRoot,
    args: '--',
    watchArgs: '--watchAll',
    setupFiles: [path.join(paths.testsDir, 'setup.js')]
  },
  e2e: {
    name: 'E2E Tests (Cypress)',
    pattern: '*.cy.js',
    command: 'npx cypress run',
    workingDir: paths.frontendRoot,
    args: `--spec "${path.join(paths.testsDir, '*.cy.js')}"`,
    watchArgs: '--headed --watch'
  },
  backend: {
    name: 'Backend API Tests (Pytest)',
    pattern: '*.test.py',
    command: 'python -m pytest',
    workingDir: paths.testsDir,
    args: '-v --tb=short',
    watchArgs: '--watch-glob="*.py"',
    requirementsFile: path.join(paths.testsDir, 'requirements-backend.txt')
  }
};

// Utility functions
const utils = {
  // Controlla se un comando è disponibile
  hasCommand: (command) => {
    try {
      execSync(`${command} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  },

  // Esegue comando con output colorato
  execWithColor: (command, options = {}) => {
    console.log(`${colors.blue}> ${command}${colors.reset}`);
    try {
      const result = execSync(command, {
        stdio: 'inherit',
        cwd: options.cwd || process.cwd(),
        ...options
      });
      return { success: true, result };
    } catch (error) {
      console.error(`${colors.red}Error executing: ${command}${colors.reset}`);
      return { success: false, error };
    }
  },

  // Controlla file esistenti
  checkFiles: (pattern, dir = paths.testsDir) => {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.match(pattern))
        .map(file => path.join(dir, file));
      return files;
    } catch (error) {
      console.error(`${colors.red}Error reading directory ${dir}: ${error.message}${colors.reset}`);
      return [];
    }
  },

  // Installa dipendenze se necessario
  ensureDependencies: (configKey) => {
    const config = testConfig[configKey];
    
    if (configKey === 'backend' && config.requirementsFile) {
      if (fs.existsSync(config.requirementsFile)) {
        console.log(`${colors.yellow}Installing Python dependencies...${colors.reset}`);
        return utils.execWithColor(`pip install -r ${config.requirementsFile}`);
      }
    }
    
    return { success: true };
  }
};

// Test runners
const runners = {
  // Esegue unit tests
  runUnitTests: (options = {}) => {
    console.log(`\n${colors.green}🧪 Running Unit Tests...${colors.reset}`);
    
    const config = testConfig.unit;
    const files = utils.checkFiles(/.*\.test\.js$/);
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No unit test files found matching pattern${colors.reset}`);
      return { success: true, skipped: true };
    }
    
    console.log(`Found ${files.length} unit test files:`);
    files.forEach(file => console.log(`  - ${path.basename(file)}`));
      let command = `${config.command} ${config.args} "tests/auth/"`;
    
    if (options.coverage) {
      command += ' --coverage --coverageDirectory=coverage/auth';
    }
    
    if (options.watch) {
      command += ` ${config.watchArgs}`;
    }
    
    return utils.execWithColor(command, { cwd: config.workingDir });
  },

  // Esegue E2E tests
  runE2ETests: (options = {}) => {
    console.log(`\n${colors.green}🌐 Running E2E Tests...${colors.reset}`);
    
    if (!utils.hasCommand('cypress')) {
      console.log(`${colors.red}Cypress not found. Install with: npm install -g cypress${colors.reset}`);
      return { success: false };
    }
    
    const config = testConfig.e2e;
    const files = utils.checkFiles(/.*\.cy\.js$/);
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No E2E test files found${colors.reset}`);
      return { success: true, skipped: true };
    }
    
    console.log(`Found ${files.length} E2E test files:`);
    files.forEach(file => console.log(`  - ${path.basename(file)}`));
    
    let command = `${config.command} ${config.args}`;
    
    if (options.watch) {
      command = `npx cypress open --config specPattern="${paths.testsDir}/*.cy.js"`;
    }
    
    return utils.execWithColor(command, { cwd: config.workingDir });
  },

  // Esegue backend API tests
  runBackendTests: (options = {}) => {
    console.log(`\n${colors.green}🔧 Running Backend API Tests...${colors.reset}`);
    
    if (!utils.hasCommand('python')) {
      console.log(`${colors.red}Python not found. Install Python 3.8+${colors.reset}`);
      return { success: false };
    }
    
    // Installa dipendenze
    const depsResult = utils.ensureDependencies('backend');
    if (!depsResult.success) {
      return depsResult;
    }
    
    const config = testConfig.backend;
    const files = utils.checkFiles(/.*\.test\.py$/);
    
    if (files.length === 0) {
      console.log(`${colors.yellow}No backend test files found${colors.reset}`);
      return { success: true, skipped: true };
    }
    
    console.log(`Found ${files.length} backend test files:`);
    files.forEach(file => console.log(`  - ${path.basename(file)}`));
    
    let command = `${config.command} ${config.args}`;
    
    if (options.coverage) {
      command += ' --cov=app --cov-report=html --cov-report=term';
    }
    
    if (options.watch) {
      command = `python -m pytest-watch -- ${config.args}`;
    }
    
    return utils.execWithColor(command, { cwd: config.workingDir });
  },

  // Esegue tutti i test
  runAllTests: (options = {}) => {
    console.log(`\n${colors.green}🚀 Running Complete Authentication Test Suite...${colors.reset}`);
    
    const results = {
      unit: { success: false },
      e2e: { success: false },
      backend: { success: false }
    };
    
    // Unit tests
    results.unit = runners.runUnitTests(options);
    
    // E2E tests (solo se unit tests passano)
    if (results.unit.success) {
      results.e2e = runners.runE2ETests(options);
    }
    
    // Backend tests
    results.backend = runners.runBackendTests(options);
    
    // Report finale
    console.log(`\n${colors.cyan}📊 Test Results Summary:${colors.reset}`);
    Object.entries(results).forEach(([type, result]) => {
      const status = result.success ? 
        `${colors.green}✅ PASSED${colors.reset}` : 
        result.skipped ? 
          `${colors.yellow}⏭️  SKIPPED${colors.reset}` :
          `${colors.red}❌ FAILED${colors.reset}`;
      console.log(`  ${type.toUpperCase()}: ${status}`);
    });
    
    const allPassed = Object.values(results).every(r => r.success || r.skipped);
    return { success: allPassed, results };
  }
};

// Help message
const showHelp = () => {
  console.log(`
${colors.cyan}Authentication Test Suite Runner${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node run-auth-suite.js [OPTIONS]

${colors.bright}OPTIONS:${colors.reset}
  --help, -h          Show this help message
  --all, -a           Run all tests (unit + e2e + backend)
  --unit, -u          Run only unit tests (Jest + RTL)
  --e2e, -e           Run only E2E tests (Cypress)
  --backend, -b       Run only backend API tests (Pytest)
  --coverage, -c      Include coverage reports
  --watch, -w         Run in watch mode
  --list, -l          List available test files

${colors.bright}EXAMPLES:${colors.reset}
  node run-auth-suite.js --all --coverage
  node run-auth-suite.js --unit --watch
  node run-auth-suite.js --e2e
  node run-auth-suite.js --backend

${colors.bright}TEST FILES LOCATION:${colors.reset}
  ${paths.testsDir}

${colors.bright}REQUIREMENTS:${colors.reset}
  - Node.js 16+ (for Jest/Cypress)
  - Python 3.8+ (for Pytest)
  - Dependencies will be auto-installed
  `);
};

// Lista file di test disponibili
const listTestFiles = () => {
  console.log(`\n${colors.cyan}📋 Available Test Files:${colors.reset}`);
  
  const fileTypes = [
    { pattern: /.*\.test\.js$/, label: 'Unit Tests (Jest)' },
    { pattern: /.*\.cy\.js$/, label: 'E2E Tests (Cypress)' },
    { pattern: /.*\.test\.py$/, label: 'Backend Tests (Pytest)' }
  ];
  
  fileTypes.forEach(({ pattern, label }) => {
    const files = utils.checkFiles(pattern);
    console.log(`\n${colors.green}${label}:${colors.reset}`);
    if (files.length === 0) {
      console.log(`  ${colors.yellow}No files found${colors.reset}`);
    } else {
      files.forEach(file => {
        console.log(`  - ${path.basename(file)}`);
      });
    }
  });
  
  console.log(`\n${colors.blue}Support Files:${colors.reset}`);
  const supportFiles = ['setup.js', 'helpers.js', 'cypress-commands.js', 'requirements-backend.txt'];
  supportFiles.forEach(file => {
    const exists = fs.existsSync(path.join(paths.testsDir, file));
    const status = exists ? colors.green + '✓' : colors.red + '✗';
    console.log(`  ${status} ${file}${colors.reset}`);
  });
};

// Main function
const main = () => {
  const args = process.argv.slice(2);
  
  printBanner();
  
  // Parse arguments
  const options = {
    coverage: args.includes('--coverage') || args.includes('-c'),
    watch: args.includes('--watch') || args.includes('-w')
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    listTestFiles();
    return;
  }
  
  // Run tests based on arguments
  let result = { success: false };
  
  if (args.includes('--all') || args.includes('-a')) {
    result = runners.runAllTests(options);
  } else if (args.includes('--unit') || args.includes('-u')) {
    result = runners.runUnitTests(options);
  } else if (args.includes('--e2e') || args.includes('-e')) {
    result = runners.runE2ETests(options);
  } else if (args.includes('--backend') || args.includes('-b')) {
    result = runners.runBackendTests(options);
  } else {
    console.log(`${colors.yellow}No test type specified. Use --help for usage information.${colors.reset}`);
    showHelp();
    return;
  }
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runners, utils, testConfig };
