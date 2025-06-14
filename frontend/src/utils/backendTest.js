// Test di connettività frontend-backend
// Questo file può essere utilizzato per testare la comunicazione tra frontend e backend

const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test 1: Health check (se disponibile)
    try {
      const healthResponse = await fetch('http://localhost:8000/health');
      console.log('✅ Health check:', healthResponse.status === 200 ? 'OK' : 'FAILED');
    } catch (e) {
      console.log('⚠️  Health endpoint not available');
    }
    
    // Test 2: API docs endpoint
    try {
      const docsResponse = await fetch('http://localhost:8000/docs');
      console.log('✅ API Docs:', docsResponse.status === 200 ? 'OK' : 'FAILED');
    } catch (e) {
      console.log('❌ Docs endpoint failed:', e.message);
    }
    
    // Test 3: Login endpoint (senza credenziali)
    try {
      const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      // Dovrebbe ritornare 422 (validation error) - questo è OK
      console.log('✅ Login endpoint responsive:', loginResponse.status === 422 ? 'OK' : `Status: ${loginResponse.status}`);
    } catch (e) {
      console.log('❌ Login endpoint failed:', e.message);
    }
    
    console.log('🎉 Backend connection test completed!');
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
  }
};

// Funzione per testare il sistema di autenticazione completo
const testAuthFlow = async () => {
  try {
    console.log('🔐 Testing authentication flow...');
    
    // Test registrazione con dati di esempio
    const registerData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      password_confirm: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
      role: 'parent'
    };
    
    const registerResponse = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });
    
    console.log('📝 Register test:', registerResponse.status, await registerResponse.text());
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
  }
};

// Export per utilizzare in console del browser
window.testBackendConnection = testBackendConnection;
window.testAuthFlow = testAuthFlow;

console.log('🚀 Backend test functions loaded!');
console.log('Run: testBackendConnection() or testAuthFlow() in browser console');
