/**
 * Quick test to verify frontend-backend communication after rate limit reset
 */

import axios from 'axios';

const testFrontendBackendComm = async () => {
  console.log('🔄 Testing Frontend-Backend Communication...');
  
  try {
    // Test 1: Check if backend is reachable
    console.log('Test 1: Backend health check...');
    const healthResponse = await axios.get('http://localhost:8000/health');
    console.log('✅ Backend Health:', healthResponse.status);
    
    // Test 2: Test proxy configuration
    console.log('Test 2: Testing proxy via frontend...');
    const proxyResponse = await axios.get('/api/v1/health', {
      baseURL: 'http://localhost:3000'
    });
    console.log('✅ Proxy Working:', proxyResponse.status);
    
    // Test 3: Test login API
    console.log('Test 3: Testing login API...');
    const loginData = new FormData();
    loginData.append('username', 'parent@demo.com');
    loginData.append('password', 'TestParent123!');
    
    const loginResponse = await axios.post('http://localhost:8000/api/v1/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('✅ Login API Working:', {
      status: loginResponse.status,
      hasUser: !!loginResponse.data.user,
      hasToken: !!loginResponse.data.token
    });
    
    console.log('🎉 All tests passed! Frontend-Backend communication is working.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // If it's a 429 error, the rate limit is still active
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limit still active. Please wait a moment and try again.');
    }
    
    return false;
  }
};

// Run the test
testFrontendBackendComm();
