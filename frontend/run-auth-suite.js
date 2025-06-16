#!/usr/bin/env node

/**
 * AUTH SUITE RUNNER
 * Script principale per eseguire la suite completa di test Authentication
 * 
 * Usage:
 *   npm run test:auth:all          # Esegue tutti i test
 *   npm run test:auth:unit         # Solo unit tests
 *   npm run test:auth:e2e          # Solo E2E tests
 *   npm run test:auth:coverage     # Con coverage report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Banner della suite
const printBanner = () => {
  console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                  🔐 AUTHENTICATION TEST SUITE                ║
║                                                              ║
║  Smile Adventure - Suite completa test autenticazione       ║
║  Copertura: Registration, Login, Token Management, RBAC     ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
  `);
};

// Configurazione test
const testConfig = {
  unit: {
    name: 'Unit Tests',
    pattern: 'tests/auth/*.test.js',
    environment: 'jsdom',
    setupFiles: ['tests/auth/setup.js']
  },
  e2e: {
    name: 'E2E Tests',
    pattern: 'cypress/e2e/auth/*.cy.js',
    browser: 'chrome',
    headless: true
  },
  backend: {
    name: 'Backend API Tests',
    pattern: 'tests/auth/*backend*.test.py',
    framework: 'pytest',
    workingDir: '../backend'
  },
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    reporters: ['text', 'html', 'lcov']
  }
};

// Funzioni helper
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
};

const logTask = (task, status = 'info') => {
  const statusIcon = {
    info: '🔄',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  
  let color = 'blue';
  if (status === 'error') color = 'red';
  else if (status === 'success') color = 'green';
  
  log(`${statusIcon[status]} ${task}`, color);
};

// Esecuzione comandi con gestione errori
const runCommand = (command, description) => {
  logTask(`Eseguendo: ${description}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    logTask(`✓ ${description}`, 'success');
    return { success: true, output };
  } catch (error) {
    logTask(`✗ ${description}: ${error.message}`, 'error');
    return { success: false, error: error.message, output: error.stdout };
  }
};

// Verifica prerequisiti
const checkPrerequisites = () => {
  logSection('🔧 VERIFICA PREREQUISITI');
  
  const checks = [
    {
      name: 'Node.js version',
      command: 'node --version',
      validate: (output) => {
        const version = output.trim();
        const major = parseInt(version.slice(1).split('.')[0]);
        return major >= 16;
      }
    },
    {
      name: 'NPM dependencies',
      command: 'npm list --depth=0',
      validate: () => true // Se il comando non fallisce, le deps sono ok
    },
    {
      name: 'Test files exist',
      command: 'ls tests/auth/*.test.js',
      validate: (output) => output.includes('.test.js')
    }
  ];

  let allPassed = true;
  
  checks.forEach(check => {
    const result = runCommand(check.command, check.name);
    if (result.success && check.validate(result.output)) {
      logTask(`${check.name}: OK`, 'success');
    } else {
      logTask(`${check.name}: FAIL`, 'error');
      allPassed = false;
    }
  });

  if (!allPassed) {
    log('\n❌ Alcuni prerequisiti non sono soddisfatti. Controllare la configurazione.', 'red');
    process.exit(1);
  }

  log('\n✅ Tutti i prerequisiti soddisfatti!', 'green');
};

// Esecuzione unit tests
const runUnitTests = (withCoverage = false) => {
  logSection('🧪 UNIT TESTS');
  
  const jestCommand = withCoverage 
    ? 'npx jest tests/auth --coverage --coverageReporters=text-summary --coverageReporters=html'
    : 'npx jest tests/auth --verbose';

  const result = runCommand(jestCommand, 'Jest Unit Tests');
  
  if (result.success) {
    log('\n📊 RISULTATI UNIT TESTS:', 'green');
    console.log(result.output);
    
    if (withCoverage) {
      log('\n📈 Coverage report generato in: coverage/lcov-report/index.html', 'cyan');
    }
  }
  
  return result.success;
};

// Esecuzione E2E tests
const runE2ETests = () => {
  logSection('🚀 E2E TESTS');
    // Avvia server di sviluppo in background
  logTask('Avviando server di sviluppo...');
  execSync('npm run start &', { stdio: 'pipe' });
  
  // Attendi che il server sia pronto
  const waitForServer = () => {
    return new Promise((resolve) => {
      const checkServer = () => {
        try {
          execSync('curl -f http://localhost:3000 > /dev/null 2>&1');
          resolve();
        } catch {
          setTimeout(checkServer, 1000);
        }
      };
      checkServer();
    });
  };

  return waitForServer().then(() => {
    const cypressCommand = 'npx cypress run --spec "cypress/e2e/auth/*.cy.js" --headless';
    const result = runCommand(cypressCommand, 'Cypress E2E Tests');
      // Chiudi server
    try {
      execSync('pkill -f "npm run start"');
    } catch (error) {
      log(`⚠️ Impossibile terminare server: ${error.message}`, 'yellow');
    }
      return result.success;
  });
};

// Esecuzione Backend API tests
const runBackendTests = () => {
  logSection('🔧 BACKEND API TESTS');
  
  const backendDir = testConfig.backend.workingDir;
  const testFile = 'tests/auth/auth-api-001-backend-endpoints.test.py';
  
  log(`📂 Switching to backend directory: ${backendDir}`, 'cyan');
  
  const pytestCommand = `cd ${backendDir} && python -m pytest ..\\frontend\\${testFile} -v --tb=short`;
  
  const result = runCommand(pytestCommand, 'Pytest Backend API Tests');
  
  if (result.success) {
    log('\n📊 RISULTATI BACKEND API TESTS:', 'green');
    console.log(result.output);
  } else {
    log('\n❌ Backend tests failed. Verifica:', 'red');
    log('  - Backend dependencies installate', 'yellow');
    log('  - Database accessibile', 'yellow');
    log('  - Python environment attivo', 'yellow');
  }
  
  return result.success;
};

// Analisi coverage
const analyzeCoverage = () => {
  logSection('📊 ANALISI COVERAGE');
  
  const coveragePath = 'coverage/lcov-report/index.html';
  
  if (fs.existsSync(coveragePath)) {
    log('✅ Report coverage disponibile:', 'green');
    log(`   file://${path.resolve(coveragePath)}`, 'cyan');
    
    // Leggi coverage summary
    try {
      const summaryPath = 'coverage/coverage-summary.json';
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        const total = summary.total;
        
        log('\n📈 Coverage Summary:', 'blue');
        log(`   Lines: ${total.lines.pct}%`, total.lines.pct >= 80 ? 'green' : 'yellow');
        log(`   Functions: ${total.functions.pct}%`, total.functions.pct >= 80 ? 'green' : 'yellow');
        log(`   Branches: ${total.branches.pct}%`, total.branches.pct >= 80 ? 'green' : 'yellow');
        log(`   Statements: ${total.statements.pct}%`, total.statements.pct >= 80 ? 'green' : 'yellow');
      }    } catch (error) {
      log(`⚠️ Impossibile leggere summary coverage: ${error.message}`, 'yellow');
    }
  } else {
    log('⚠️ Report coverage non trovato', 'yellow');
  }
};

// Test report generation
const generateTestReport = (results) => {
  logSection('📋 GENERAZIONE REPORT');
  
  const reportData = {
    suite: 'Authentication Test Suite',
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r).length,
      failed: Object.values(results).filter(r => !r).length
    }
  };

  const reportPath = 'test-reports/auth-suite-report.json';
  
  // Crea directory se non esiste
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  log(`✅ Report salvato in: ${reportPath}`, 'green');
  
  // Summary
  log('\n📊 SUMMARY FINALE:', 'bright');
  log(`   Total tests: ${reportData.summary.total}`, 'blue');
  log(`   Passed: ${reportData.summary.passed}`, 'green');
  log(`   Failed: ${reportData.summary.failed}`, reportData.summary.failed > 0 ? 'red' : 'green');
  
  return reportData.summary.failed === 0;
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';
  
  printBanner();
  
  const startTime = Date.now();
  const results = {};
    try {
    // Verifica prerequisiti
    checkPrerequisites();
    
    // Esegui test basato su modalità
    switch (mode) {
      case 'unit':
        results.unitTests = runUnitTests(false);
        break;
        
      case 'e2e':
        results.e2eTests = await runE2ETests();
        break;
        
      case 'backend':
        results.backendTests = runBackendTests();
        break;
        
      case 'coverage':
        results.unitTests = runUnitTests(true);
        analyzeCoverage();
        break;
        
      case 'all':
      default:
        logTask('Modalità: Esecuzione completa della suite');
        results.unitTests = runUnitTests(true);
        results.e2eTests = await runE2ETests();
        results.backendTests = runBackendTests();
        analyzeCoverage();
        break;
    }
    
    // Genera report finale
    const allPassed = generateTestReport(results);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (allPassed) {
      log(`\n🎉 SUITE COMPLETATA CON SUCCESSO in ${duration}s`, 'green');
      process.exit(0);
    } else {
      log(`\n💥 SUITE FALLITA in ${duration}s`, 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 ERRORE DURANTE L'ESECUZIONE: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${colors.cyan}Authentication Test Suite Runner${colors.reset}

Usage:
  node run-auth-suite.js [mode]

Modes:
  all       - Esegue tutti i test (unit + e2e + backend + coverage)
  unit      - Solo unit tests
  e2e       - Solo E2E tests  
  backend   - Solo backend API tests
  coverage  - Unit tests con coverage report

Options:
  --help, -h  - Mostra questo aiuto

Examples:
  node run-auth-suite.js all
  node run-auth-suite.js unit
  node run-auth-suite.js backend
  node run-auth-suite.js coverage
  `);
  process.exit(0);
}

// Esegui script
if (require.main === module) {
  main();
}

module.exports = {
  runUnitTests,
  runE2ETests,
  runBackendTests,
  analyzeCoverage,
  generateTestReport
};
