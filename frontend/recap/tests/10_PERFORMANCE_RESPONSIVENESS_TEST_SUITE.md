# 10 - PERFORMANCE E RESPONSIVENESS TEST SUITE

## OVERVIEW
Questa suite testa completamente le prestazioni e la responsiveness dell'applicazione, inclusi tempi di caricamento, performance su dispositivi diversi, ottimizzazioni, caching e user experience.

## STRUMENTI UTILIZZATI
- **Lighthouse** per performance auditing
- **WebPageTest** per speed testing
- **Jest** per performance unit tests
- **Cypress** per responsive testing
- **Browser performance APIs** per metriche

---

## TASK 1: PERFORMANCE DI CARICAMENTO PAGINE

### Cosa Testare
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Bundle size optimization

### Come Testare
**Unit Test (Jest)**:
```javascript
test('should meet performance budgets', async () => {
  const performanceMetrics = await measurePagePerformance('/dashboard');
  
  // Core Web Vitals thresholds
  expect(performanceMetrics.LCP).toBeLessThan(2500); // ms
  expect(performanceMetrics.FCP).toBeLessThan(1800); // ms
  expect(performanceMetrics.CLS).toBeLessThan(0.1); // score
  expect(performanceMetrics.TTI).toBeLessThan(3800); // ms
});

test('should optimize bundle sizes', () => {
  const bundleAnalysis = analyzeBundleSize();
  
  // Main bundle should be under 250KB
  expect(bundleAnalysis.mainBundle.size).toBeLessThan(250 * 1024);
  
  // Vendor bundle should be under 500KB
  expect(bundleAnalysis.vendorBundle.size).toBeLessThan(500 * 1024);
  
  // Code splitting should be implemented
  expect(bundleAnalysis.chunkCount).toBeGreaterThan(5);
});

test('should implement lazy loading correctly', () => {
  const lazyComponents = [
    'AdminPanel',
    'AnalyticsDashboard',
    'SensoryProfileChart',
    'ReportsGenerator'
  ];
  
  lazyComponents.forEach(component => {
    const componentInfo = getComponentLoadInfo(component);
    expect(componentInfo.isLazyLoaded).toBe(true);
    expect(componentInfo.loadTrigger).toBeDefined();
  });
});

test('should optimize image loading', () => {
  const imageOptimizations = checkImageOptimizations();
  
  expect(imageOptimizations.webpSupport).toBe(true);
  expect(imageOptimizations.lazyLoading).toBe(true);
  expect(imageOptimizations.responsiveImages).toBe(true);
  expect(imageOptimizations.averageImageSize).toBeLessThan(200 * 1024);
});
```

**E2E Test (Cypress)**:
```javascript
it('should meet performance standards on key pages', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/dashboard', name: 'Dashboard' },
    { url: '/children', name: 'Children List' },
    { url: '/professionals', name: 'Professionals' }
  ];
  
  pages.forEach(page => {
    cy.visit(page.url);
    
    // Measure performance using Lighthouse
    cy.lighthouse({
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 85
    });
    
    // Check specific metrics
    cy.window().then((win) => {
      const observer = new win.PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            expect(entry.startTime).to.be.lessThan(2500);
          }
          
          if (entry.entryType === 'first-contentful-paint') {
            expect(entry.startTime).to.be.lessThan(1800);
          }
        });
      });
      
      observer.observe({entryTypes: ['largest-contentful-paint', 'first-contentful-paint']});
    });
  });
});

it('should load content progressively', () => {
  cy.visit('/dashboard');
  
  // Check skeleton loading states
  cy.get('[data-testid="skeleton-loader"]').should('be.visible');
  
  // Verify progressive content loading
  cy.get('[data-testid="quick-stats"]').should('be.visible');
  cy.get('[data-testid="skeleton-loader"]').should('not.exist');
  
  // Check lazy-loaded sections
  cy.scrollTo('bottom');
  cy.get('[data-testid="analytics-section"]').should('be.visible');
  
  // Verify images load lazily
  cy.get('[data-testid="user-avatar"]').should('have.attr', 'loading', 'lazy');
});

it('should handle slow network conditions', () => {
  // Simulate slow 3G
  cy.intercept('**/*', { delay: 2000 });
  
  cy.visit('/dashboard');
  
  // Should show loading states
  cy.get('[data-testid="loading-spinner"]').should('be.visible');
  cy.get('[data-testid="loading-message"]').should('contain', 'Loading');
  
  // Should provide feedback for slow operations
  cy.get('[data-testid="slow-connection-warning"]', { timeout: 10000 })
    .should('be.visible');
  
  // Content should eventually load
  cy.get('[data-testid="dashboard-content"]', { timeout: 30000 })
    .should('be.visible');
});
```

### Strumento
- **Lighthouse** per Core Web Vitals
- **Bundle analyzer** per size optimization
- **Performance Observer API** per metriche

### Risultato Atteso
- ✅ LCP < 2.5s per tutte le pagine
- ✅ FCP < 1.8s per tutte le pagine
- ✅ CLS < 0.1 per stabilità layout
- ✅ Bundle size ottimizzato
- ✅ Lazy loading implementato

---

## TASK 2: RESPONSIVE DESIGN E MULTI-DEVICE

### Cosa Testare
- Layout responsivo su vari breakpoint
- Touch interactions su mobile
- Orientamento device (portrait/landscape)
- Cross-browser compatibility
- Accessibility su mobile

### Come Testare
**Unit Test**:
```javascript
test('should handle various viewport sizes', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };
  
  Object.entries(breakpoints).forEach(([device, dimensions]) => {
    const layout = calculateLayout(dimensions);
    
    expect(layout.columns).toBeDefined();
    expect(layout.gridGap).toBeDefined();
    expect(layout.fontSize).toBeGreaterThan(0);
    
    if (device === 'mobile') {
      expect(layout.columns).toBe(1);
      expect(layout.navigation).toBe('bottom');
    } else if (device === 'desktop') {
      expect(layout.columns).toBeGreaterThan(2);
      expect(layout.navigation).toBe('sidebar');
    }
  });
});

test('should optimize touch interactions', () => {
  const touchTargets = [
    { element: 'button', minSize: 44 },
    { element: 'link', minSize: 44 },
    { element: 'input', minSize: 48 }
  ];
  
  touchTargets.forEach(target => {
    const elementSize = calculateTouchTargetSize(target.element);
    expect(elementSize.width).toBeGreaterThanOrEqual(target.minSize);
    expect(elementSize.height).toBeGreaterThanOrEqual(target.minSize);
  });
});

test('should handle orientation changes', () => {
  const landscapeLayout = calculateLayout({ width: 896, height: 414 }); // iPhone landscape
  const portraitLayout = calculateLayout({ width: 414, height: 896 }); // iPhone portrait
  
  expect(landscapeLayout.orientation).toBe('landscape');
  expect(portraitLayout.orientation).toBe('portrait');
  
  // Layout should adapt appropriately
  expect(landscapeLayout.headerHeight).toBeLessThan(portraitLayout.headerHeight);
  expect(landscapeLayout.contentColumns).toBeGreaterThan(portraitLayout.contentColumns);
});
```

**E2E Test**:
```javascript
it('should work correctly on mobile devices', () => {
  const mobileDevices = [
    'iphone-6',
    'iphone-x',
    'samsung-s10',
    'ipad-2'
  ];
  
  mobileDevices.forEach(device => {
    cy.viewport(device);
    cy.visit('/dashboard');
    
    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
    cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
    
    // Test mobile menu functionality
    cy.get('[data-testid="mobile-menu-trigger"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Test touch interactions
    cy.get('[data-testid="menu-item"]').first().click();
    
    // Check content adapts to mobile
    cy.get('[data-testid="content-grid"]').should('have.class', 'mobile-layout');
    
    // Test form interactions on mobile
    cy.visit('/profile/edit');
    cy.get('[data-testid="mobile-form"]').should('be.visible');
    
    // Check input accessibility on mobile
    cy.get('[data-testid="input-field"]').should('have.css', 'font-size')
      .and('match', /1[6-9]px|[2-9][0-9]px/); // Minimum 16px to prevent zoom
  });
});

it('should handle orientation changes gracefully', () => {
  // Start in portrait
  cy.viewport(414, 896); // iPhone portrait
  cy.visit('/children');
  
  cy.get('[data-testid="children-grid"]').should('have.class', 'portrait-layout');
  
  // Change to landscape
  cy.viewport(896, 414); // iPhone landscape
  
  cy.get('[data-testid="children-grid"]').should('have.class', 'landscape-layout');
  
  // Content should remain functional
  cy.get('[data-testid="child-card"]').should('be.visible');
  cy.get('[data-testid="child-card"]').first().click();
  
  // Modal should adapt to landscape
  cy.get('[data-testid="child-detail-modal"]').should('be.visible');
  cy.get('[data-testid="modal-content"]').should('have.class', 'landscape-modal');
});

it('should maintain performance on different devices', () => {
  const deviceTests = [
    { device: 'iphone-6', expectedFCP: 2000 },
    { device: 'ipad-2', expectedFCP: 1500 },
    { device: 'macbook-13', expectedFCP: 1000 }
  ];
  
  deviceTests.forEach(test => {
    cy.viewport(test.device);
    cy.visit('/dashboard');
    
    // Measure FCP on device
    cy.window().then((win) => {
      const observer = new win.PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          expect(fcpEntry.startTime).to.be.lessThan(test.expectedFCP);
        }
      });
      
      observer.observe({entryTypes: ['paint']});
    });
    
    // Check memory usage
    cy.window().then((win) => {
      if (win.performance.memory) {
        const memory = win.performance.memory;
        expect(memory.usedJSHeapSize).to.be.lessThan(50 * 1024 * 1024); // 50MB
      }
    });
  });
});
```

### Strumento
- **Responsive design testing** per breakpoints
- **Device emulation** per multi-device testing
- **Touch testing** per mobile interactions

### Risultato Atteso
- ✅ Layout responsivo su tutti i dispositivi
- ✅ Touch interactions ottimizzate
- ✅ Orientamento gestito correttamente
- ✅ Performance mantenuta su mobile
- ✅ Accessibility preservata

---

## TASK 3: CACHING E OTTIMIZZAZIONI

### Cosa Testare
- Browser caching strategies
- Service Worker per offline support
- CDN performance
- Database query optimization
- Memory leak prevention

### Come Testare
**Unit Test**:
```javascript
test('should implement effective caching strategies', () => {
  const cacheStrategies = {
    static: 'cache-first',
    api: 'network-first',
    images: 'cache-first',
    user_data: 'network-only'
  };
  
  Object.entries(cacheStrategies).forEach(([type, strategy]) => {
    const cacheConfig = getCacheStrategy(type);
    expect(cacheConfig.strategy).toBe(strategy);
    expect(cacheConfig.maxAge).toBeDefined();
  });
});

test('should prevent memory leaks', () => {
  const componentInstances = [];
  
  // Create multiple component instances
  for (let i = 0; i < 100; i++) {
    const instance = createComponentInstance('ChildrenList');
    componentInstances.push(instance);
  }
  
  const initialMemory = getMemoryUsage();
  
  // Cleanup components
  componentInstances.forEach(instance => {
    instance.unmount();
  });
  
  // Force garbage collection (if available)
  if (global.gc) {
    global.gc();
  }
  
  const finalMemory = getMemoryUsage();
  
  // Memory should be released
  expect(finalMemory).toBeLessThan(initialMemory * 1.1); // 10% tolerance
});

test('should optimize API calls', () => {
  const apiCallHistory = [];
  const mockApiCall = jest.fn().mockImplementation((endpoint) => {
    apiCallHistory.push(endpoint);
    return Promise.resolve({});
  });
  
  // Simulate multiple calls to same endpoint
  const duplicateCalls = [
    '/api/children',
    '/api/children',
    '/api/children'
  ];
  
  duplicateCalls.forEach(endpoint => {
    optimizedApiCall(endpoint, mockApiCall);
  });
  
  // Should only make one actual API call due to deduplication
  expect(mockApiCall).toHaveBeenCalledTimes(1);
});

test('should implement efficient data structures', () => {
  const largeDataset = generateLargeDataset(10000);
  
  const startTime = performance.now();
  
  // Test search performance
  const searchResult = searchDataset(largeDataset, 'query');
  
  const endTime = performance.now();
  const searchTime = endTime - startTime;
  
  expect(searchTime).toBeLessThan(100); // Should complete in < 100ms
  expect(searchResult).toBeDefined();
});
```

**E2E Test**:
```javascript
it('should implement effective caching', () => {
  // First visit - cache resources
  cy.visit('/dashboard');
  
  // Check cache headers
  cy.intercept('GET', '/static/**/*', (req) => {
    req.reply((res) => {
      expect(res.headers['cache-control']).to.include('max-age');
    });
  });
  
  // Reload page - should use cached resources
  cy.reload();
  
  // Check performance improvement on reload
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(1000);
  });
  
  // Test API response caching
  cy.visit('/children');
  cy.intercept('GET', '/api/v1/children', { middleware: true }, (req) => {
    req.reply((res) => {
      expect(res.headers['cache-control']).to.include('max-age=300'); // 5 minutes
    });
  });
});

it('should work offline with service worker', () => {
  cy.visit('/dashboard');
  
  // Wait for service worker registration
  cy.window().then((win) => {
    expect(win.navigator.serviceWorker.controller).to.exist;
  });
  
  // Go offline
  cy.window().then((win) => {
    win.navigator.onLine = false;
  });
  
  // Should show offline indicator
  cy.get('[data-testid="offline-indicator"]').should('be.visible');
  
  // Cached pages should still work
  cy.visit('/children');
  cy.get('[data-testid="cached-content"]').should('be.visible');
  
  // Should show cached data notice
  cy.get('[data-testid="cached-data-notice"]').should('contain', 'offline');
});

it('should optimize large dataset rendering', () => {
  // Mock large dataset
  cy.intercept('GET', '/api/v1/admin/users*', { fixture: 'large-user-dataset.json' });
  
  cy.visit('/admin/users');
  
  // Should implement virtual scrolling
  cy.get('[data-testid="virtual-list"]').should('be.visible');
  
  // Should only render visible items
  cy.get('[data-testid="user-row"]').should('have.length.lessThan', 50);
  
  // Scrolling should load more items efficiently
  const startTime = Date.now();
  
  cy.get('[data-testid="virtual-list"]').scrollTo('bottom');
  
  cy.get('[data-testid="user-row"]').should('have.length.lessThan', 50);
  
  const endTime = Date.now();
  expect(endTime - startTime).to.be.lessThan(200); // Smooth scrolling
});
```

### Strumento
- **Cache analysis tools** per caching strategies
- **Service Worker testing** per offline support
- **Memory profiling** per leak detection

### Risultato Atteso
- ✅ Caching strategies ottimali
- ✅ Service Worker funzionante
- ✅ Memory leaks prevenuti
- ✅ API calls ottimizzate
- ✅ Large datasets gestiti efficientemente

---

## TASK 4: NETWORK PERFORMANCE

### Cosa Testare
- API response times
- Request/response compression
- HTTP/2 optimization
- Error handling for slow networks
- Progressive data loading

### Come Testare
**Unit Test**:
```javascript
test('should compress API responses', () => {
  const largePayload = {
    data: new Array(1000).fill(0).map((_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@test.com`,
      profile: {
        settings: { theme: 'light', lang: 'en' },
        metadata: { created: new Date(), updated: new Date() }
      }
    }))
  };
  
  const uncompressedSize = JSON.stringify(largePayload).length;
  const compressedSize = compressPayload(largePayload).length;
  
  // Should achieve significant compression
  expect(compressedSize).toBeLessThan(uncompressedSize * 0.5);
});

test('should handle API timeouts gracefully', async () => {
  const slowApiCall = jest.fn().mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, 10000))
  );
  
  const timeoutPromise = apiCallWithTimeout(slowApiCall, 3000);
  
  await expect(timeoutPromise).rejects.toThrow('Request timeout');
});

test('should implement request deduplication', () => {
  const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: () => ({}) });
  
  // Make multiple simultaneous requests
  const requests = [
    apiRequest('/api/users', mockFetch),
    apiRequest('/api/users', mockFetch),
    apiRequest('/api/users', mockFetch)
  ];
  
  return Promise.all(requests).then(() => {
    // Should only make one actual request
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

test('should prioritize critical API calls', () => {
  const apiQueue = new APIQueue();
  
  // Add various priority requests
  apiQueue.add('/api/auth/verify', 'critical');
  apiQueue.add('/api/analytics', 'low');
  apiQueue.add('/api/children', 'high');
  apiQueue.add('/api/notifications', 'medium');
  
  const executionOrder = apiQueue.getExecutionOrder();
  
  expect(executionOrder[0].endpoint).toBe('/api/auth/verify');
  expect(executionOrder[1].endpoint).toBe('/api/children');
  expect(executionOrder[2].endpoint).toBe('/api/notifications');
  expect(executionOrder[3].endpoint).toBe('/api/analytics');
});
```

**E2E Test**:
```javascript
it('should handle various network conditions', () => {
  const networkConditions = [
    { name: 'Fast 3G', latency: 150, download: 1600, upload: 750 },
    { name: 'Slow 3G', latency: 400, download: 500, upload: 500 },
    { name: 'Offline', latency: 0, download: 0, upload: 0 }
  ];
  
  networkConditions.forEach(condition => {
    if (condition.name !== 'Offline') {
      // Simulate network condition
      cy.intercept('**/*', { delay: condition.latency });
    }
    
    cy.visit('/dashboard');
    
    if (condition.name === 'Offline') {
      // Should show offline message
      cy.get('[data-testid="offline-message"]').should('be.visible');
    } else if (condition.name === 'Slow 3G') {
      // Should show slow connection warning
      cy.get('[data-testid="slow-connection-warning"]').should('be.visible');
      
      // Should prioritize critical content
      cy.get('[data-testid="critical-content"]').should('be.visible');
      cy.get('[data-testid="non-critical-content"]').should('not.exist');
    }
  });
});

it('should implement progressive data loading', () => {
  cy.visit('/children');
  
  // Should load essential data first
  cy.get('[data-testid="children-list-skeleton"]').should('be.visible');
  cy.get('[data-testid="basic-child-info"]').should('be.visible');
  
  // Additional data should load progressively
  cy.get('[data-testid="child-photos"]', { timeout: 5000 }).should('be.visible');
  cy.get('[data-testid="sensory-profile-preview"]', { timeout: 8000 }).should('be.visible');
  
  // Non-critical data loads last
  cy.get('[data-testid="analytics-widgets"]', { timeout: 10000 }).should('be.visible');
});

it('should optimize API call patterns', () => {
  let apiCallCount = 0;
  
  cy.intercept('GET', '/api/**/*', (req) => {
    apiCallCount++;
  });
  
  cy.visit('/dashboard');
  
  // Should batch related API calls
  cy.wait(2000).then(() => {
    expect(apiCallCount).to.be.lessThan(10); // Reasonable number of API calls
  });
  
  // Navigation shouldn't trigger unnecessary calls
  const initialCallCount = apiCallCount;
  
  cy.get('[data-testid="nav-children"]').click();
  cy.wait(1000).then(() => {
    const additionalCalls = apiCallCount - initialCallCount;
    expect(additionalCalls).to.be.lessThan(3); // Only essential calls for new page
  });
});
```

### Strumento
- **Network throttling** per simulation
- **API monitoring** per response times
- **Compression testing** per payload optimization

### Risultato Atteso
- ✅ API response times ottimali
- ✅ Compression implementata
- ✅ Network errors gestiti
- ✅ Progressive loading funzionante
- ✅ Request prioritization attiva

---

## TASK 5: USER EXPERIENCE PERFORMANCE

### Cosa Testare
- Perceived performance
- Loading states e feedback
- Smooth animations
- Interaction responsiveness
- Error recovery UX

### Come Testare
**Unit Test**:
```javascript
test('should provide immediate feedback for user actions', () => {
  const mockAction = jest.fn().mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, 2000))
  );
  
  const { getByText, getByTestId } = render(
    <ActionButton onClick={mockAction}>Save Profile</ActionButton>
  );
  
  const button = getByText('Save Profile');
  fireEvent.click(button);
  
  // Should show loading state immediately
  expect(getByTestId('loading-spinner')).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('should implement smooth animations', () => {
  const animationConfig = {
    duration: 300,
    easing: 'ease-out',
    properties: ['opacity', 'transform']
  };
  
  const animation = createAnimation(animationConfig);
  
  expect(animation.duration).toBeLessThanOrEqual(300);
  expect(animation.willChange).toContain('transform');
  expect(animation.willChange).toContain('opacity');
});

test('should optimize rendering performance', () => {
  const largeComponentTree = createLargeComponentTree(1000);
  
  const startTime = performance.now();
  render(largeComponentTree);
  const endTime = performance.now();
  
  const renderTime = endTime - startTime;
  expect(renderTime).toBeLessThan(100); // Should render in < 100ms
});

test('should implement efficient state updates', () => {
  const mockSetState = jest.fn();
  const optimizedUpdate = optimizeStateUpdate(mockSetState);
  
  // Multiple rapid updates
  optimizedUpdate({ field1: 'value1' });
  optimizedUpdate({ field2: 'value2' });
  optimizedUpdate({ field3: 'value3' });
  
  // Should batch updates
  expect(mockSetState).toHaveBeenCalledTimes(1);
  expect(mockSetState).toHaveBeenCalledWith({
    field1: 'value1',
    field2: 'value2',
    field3: 'value3'
  });
});
```

**E2E Test**:
```javascript
it('should provide excellent perceived performance', () => {
  cy.visit('/children');
  
  // Should show skeleton loading immediately
  cy.get('[data-testid="skeleton-loader"]').should('be.visible');
  
  // Content should appear progressively
  cy.get('[data-testid="child-card"]').should('be.visible');
  cy.get('[data-testid="skeleton-loader"]').should('not.exist');
  
  // Interactions should feel responsive
  cy.get('[data-testid="child-card"]').first().click();
  
  // Modal should appear immediately with loading state
  cy.get('[data-testid="child-modal"]').should('be.visible');
  cy.get('[data-testid="modal-loading"]').should('be.visible');
  
  // Content should load progressively
  cy.get('[data-testid="child-basic-info"]').should('be.visible');
  cy.get('[data-testid="child-detailed-info"]', { timeout: 3000 }).should('be.visible');
});

it('should handle form interactions smoothly', () => {
  cy.visit('/profile/edit');
  
  // Form should be responsive to input
  cy.get('[data-testid="name-input"]').type('New Name');
  
  // Should provide immediate validation feedback
  cy.get('[data-testid="validation-success"]').should('be.visible');
  
  // Saving should provide clear feedback
  cy.get('[data-testid="save-btn"]').click();
  
  // Button should show loading state
  cy.get('[data-testid="save-btn"]').should('contain', 'Saving...');
  cy.get('[data-testid="save-btn"]').should('be.disabled');
  
  // Success should be clearly indicated
  cy.get('[data-testid="save-success"]', { timeout: 5000 })
    .should('be.visible')
    .and('contain', 'Profile updated successfully');
});

it('should maintain 60fps during animations', () => {
  cy.visit('/dashboard');
  
  // Trigger animation
  cy.get('[data-testid="menu-toggle"]').click();
  
  // Monitor frame rate during animation
  cy.window().then((win) => {
    let frameCount = 0;
    let startTime = performance.now();
    
    const countFrames = () => {
      frameCount++;
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
    
    // After animation completes
    cy.wait(1000).then(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (frameCount / duration) * 1000;
      
      expect(fps).to.be.greaterThan(55); // Close to 60fps
    });
  });
});
```

### Strumento
- **Performance Observer API** per metriche UX
- **Animation performance testing** per smoothness
- **User interaction timing** per responsiveness

### Risultato Atteso
- ✅ Perceived performance ottimale
- ✅ Loading states immediate
- ✅ Animazioni a 60fps
- ✅ Interazioni responsive
- ✅ Error recovery fluida

---

## TASK 6: MONITORING E ALERTING PERFORMANCE

### Cosa Testare
- Real User Monitoring (RUM)
- Performance alerts
- Error tracking
- Performance degradation detection
- Automated performance testing

### Come Testare
**Unit Test**:
```javascript
test('should implement performance monitoring', () => {
  const performanceMonitor = new PerformanceMonitor();
  
  // Should track key metrics
  const metrics = performanceMonitor.getMetrics();
  
  expect(metrics).toHaveProperty('loadTime');
  expect(metrics).toHaveProperty('renderTime');
  expect(metrics).toHaveProperty('interactionDelay');
  expect(metrics).toHaveProperty('memoryUsage');
});

test('should detect performance degradation', () => {
  const performanceHistory = [
    { date: '2024-03-01', loadTime: 1200 },
    { date: '2024-03-02', loadTime: 1300 },
    { date: '2024-03-03', loadTime: 2100 }, // Degradation
    { date: '2024-03-04', loadTime: 2200 }
  ];
  
  const alerts = detectPerformanceDegradation(performanceHistory);
  
  expect(alerts).toHaveLength(1);
  expect(alerts[0].type).toBe('PERFORMANCE_DEGRADATION');
  expect(alerts[0].metric).toBe('loadTime');
  expect(alerts[0].severity).toBe('WARNING');
});

test('should implement performance budgets', () => {
  const performanceBudgets = {
    loadTime: 2000,
    bundleSize: 500000,
    imageSize: 200000,
    apiResponseTime: 1000
  };
  
  const currentMetrics = {
    loadTime: 2500, // Over budget
    bundleSize: 450000,
    imageSize: 180000,
    apiResponseTime: 1200 // Over budget
  };
  
  const budgetViolations = checkPerformanceBudgets(currentMetrics, performanceBudgets);
  
  expect(budgetViolations).toHaveLength(2);
  expect(budgetViolations.map(v => v.metric)).toContain('loadTime');
  expect(budgetViolations.map(v => v.metric)).toContain('apiResponseTime');
});
```

**E2E Test**:
```javascript
it('should collect real user monitoring data', () => {
  cy.visit('/dashboard');
  
  // Should send performance data
  cy.intercept('POST', '/api/v1/analytics/performance', (req) => {
    expect(req.body).to.have.property('loadTime');
    expect(req.body).to.have.property('userAgent');
    expect(req.body).to.have.property('viewport');
    expect(req.body).to.have.property('connectionType');
  });
  
  // Trigger performance data collection
  cy.window().then((win) => {
    win.dispatchEvent(new Event('beforeunload'));
  });
});

it('should handle performance issues gracefully', () => {
  // Simulate slow backend
  cy.intercept('GET', '/api/**/*', { delay: 5000 });
  
  cy.visit('/dashboard');
  
  // Should show slow loading message
  cy.get('[data-testid="slow-loading-message"]', { timeout: 3000 })
    .should('be.visible');
  
  // Should offer alternative actions
  cy.get('[data-testid="offline-mode-btn"]').should('be.visible');
  cy.get('[data-testid="retry-btn"]').should('be.visible');
  
  // Should still provide basic functionality
  cy.get('[data-testid="basic-navigation"]').should('be.visible');
});

it('should automatically report performance issues', () => {
  let performanceReport = null;
  
  cy.intercept('POST', '/api/v1/errors/performance', (req) => {
    performanceReport = req.body;
  });
  
  // Simulate performance issue
  cy.window().then((win) => {
    // Simulate long task
    const start = performance.now();
    while (performance.now() - start < 100) {
      // Blocking operation
    }
  });
  
  cy.visit('/dashboard');
  
  // Should automatically report performance issue
  cy.wait(2000).then(() => {
    expect(performanceReport).to.not.be.null;
    expect(performanceReport.type).to.equal('LONG_TASK');
  });
});
```

### Strumento
- **Real User Monitoring** tools
- **Performance alerting** systems
- **Automated testing** per CI/CD

### Risultato Atteso
- ✅ RUM data collection attiva
- ✅ Performance alerts configurati
- ✅ Degradation detection funzionante
- ✅ Budget violations monitorate
- ✅ Automated reporting attivo

---

## CONFIGURAZIONE TEST

### Setup Performance Testing
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testTimeout: 10000
};

// Mock Performance APIs
global.performance = {
  ...global.performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};
```

### Lighthouse CI Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }]
      }
    }
  }
};
```

### Cypress Performance Commands
```javascript
// cypress/support/commands.js
Cypress.Commands.add('lighthouse', (options) => {
  cy.task('lighthouse', {
    url: Cypress.config().baseUrl + Cypress.currentTest.titlePath.join('/'),
    options: options
  });
});

Cypress.Commands.add('checkPerformance', (page) => {
  cy.visit(page);
  cy.window().then((win) => {
    const observer = new win.PerformanceObserver((list) => {
      const entries = list.getEntries();
      // Performance assertions
    });
    observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
  });
});
```

## COVERAGE TARGET
- **Performance Budget Compliance**: 100%
- **Core Web Vitals**: Good (>75th percentile)
- **Mobile Performance Score**: >85
- **Accessibility Score**: >95

## ESECUZIONE TEST
```bash
# Unit tests performance
npm test src/performance/ -- --coverage

# E2E performance tests
npx cypress run --spec "cypress/e2e/performance.cy.js"

# Lighthouse CI
npx lhci autorun

# Bundle analysis
npm run analyze-bundle
```
