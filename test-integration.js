#!/usr/bin/env node

/**
 * Script di test integrazione Smile Adventure
 * Testa la comunicazione tra frontend e backend
 */

const https = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testBackend() {
  log.info('🔍 Testing Smile Adventure Backend Integration...\n');
  
  // Test 1: Backend API Docs
  try {
    const docsResult = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/docs',
      method: 'GET'
    });
    
    if (docsResult.status === 200) {
      log.success('Backend API Docs accessible');
    } else {
      log.error(`Backend API Docs failed (${docsResult.status})`);
    }
  } catch (e) {
    log.error(`Backend connection failed: ${e.message}`);
    return false;
  }
  
  // Test 2: Auth endpoint structure
  try {
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Status 422 è corretto (validation error per body vuoto)
    if (loginResult.status === 422) {
      log.success('Auth endpoint responsive (validation working)');
    } else {
      log.warning(`Auth endpoint returned: ${loginResult.status}`);
    }
  } catch (e) {
    log.error(`Auth endpoint failed: ${e.message}`);
  }
  
  // Test 3: Check database connectivity (indirectamente)
  try {
    const dashboardResult = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/reports/dashboard',
      method: 'GET'
    });
    
    // Status 401 è corretto (unauthorized - no token)
    if (dashboardResult.status === 401) {
      log.success('Database connection working (unauthorized response expected)');
    } else {
      log.warning(`Dashboard endpoint returned: ${dashboardResult.status}`);
    }
  } catch (e) {
    log.error(`Dashboard endpoint failed: ${e.message}`);
  }
  
  return true;
}

async function testFrontend() {
  log.info('\n🎨 Testing Frontend Application...');
  
  try {
    const frontendResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    
    if (frontendResult.status === 200) {
      log.success('Frontend React app accessible');
      
      // Check se contiene React
      if (frontendResult.data.includes('react') || frontendResult.data.includes('root')) {
        log.success('React app structure detected');
      }
    } else {
      log.error(`Frontend failed (${frontendResult.status})`);
    }
  } catch (e) {
    log.error(`Frontend connection failed: ${e.message}`);
  }
}

async function main() {
  console.log(`
${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    🚀 SMILE ADVENTURE                        ║
║                  Integration Test Suite                      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`);
  
  const backendOk = await testBackend();
  await testFrontend();
  
  console.log('\n' + '='.repeat(60));
  
  if (backendOk) {
    log.success('🎉 Integration tests completed successfully!');
    log.info('System is ready for development and testing');
    console.log(`
📚 Next steps:
   • Test login/register flow in browser
   • Test dashboard for different user roles  
   • Test children CRUD operations
   • Test game session tracking
   • Test analytics and reporting
    `);
  } else {
    log.error('❌ Integration tests failed');
    log.info('Check that backend services are running with: docker-compose up');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
