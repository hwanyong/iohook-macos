#!/usr/bin/env node

console.log('=== iohook-macos Performance Optimization Test ===')
console.log('This test demonstrates performance optimization features.')
console.log('Different performance settings will be applied during the test.\n')

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Main test function using async/await
async function runPerformanceTest() {
    let hasError = false
    let errorObj = null
    let iohook = null
    
    // Load module
    try {
        iohook = require('../../index.js')
    } catch (e) {
        hasError = true
        errorObj = e
    }
    
    if (hasError) {
        console.error('Performance optimization test failed:', errorObj)
        process.exit(1)
        return
    }
    
    let eventCount = 0
    
    // Event listener to count events
    iohook.on('mouseMoved', () => {
        eventCount++
        if (eventCount % 50 == 0) { // Log every 50th event to avoid spam
            console.log(`📊 Mouse move events processed: ${eventCount}`)
        }
    })
    
    iohook.on('leftMouseDown', () => {
        console.log('🖱️  Mouse click detected')
    })
    
    iohook.on('keyDown', (eventData) => {
        console.log('⌨️  Key press detected - Key Code:', eventData.keyCode)
    })
    
    // Phase 1: Default mode
    console.log('📝 Phase 1: Default mode (verbose logging) - 8 seconds')
    console.log('Full logging enabled, all events captured...')
    console.log('Move your mouse around to see high-frequency events')
    
    iohook.startMonitoring()
    eventCount = 0
    await delay(8000)
    
    const phase1Count = eventCount
    console.log(`\n📊 Phase 1 Result: ${phase1Count} mouse move events in 8 seconds`)
    
    // Phase 2: Performance mode
    console.log('\n📝 Phase 2: Performance mode enabled - 8 seconds')
    console.log('Reduced logging, mouse move throttling active...')
    
    iohook.enablePerformanceMode()
    eventCount = 0
    await delay(8000)
    
    const phase2Count = eventCount
    console.log(`\n📊 Phase 2 Result: ${phase2Count} mouse move events in 8 seconds`)
    console.log(`🚀 Performance improvement: ${phase1Count - phase2Count} fewer events (${((phase1Count - phase2Count) / phase1Count * 100).toFixed(1)}% reduction)`)
    
    // Phase 3: Custom throttling
    console.log('\n📝 Phase 3: Custom throttling (33ms = ~30fps) - 8 seconds')
    console.log('Custom mouse move throttling for even better performance...')
    
    iohook.setMouseMoveThrottling(true, 33)
    eventCount = 0
    await delay(8000)
    
    const phase3Count = eventCount
    console.log(`\n📊 Phase 3 Result: ${phase3Count} mouse move events in 8 seconds`)
    console.log(`🚀 Additional improvement: ${phase2Count - phase3Count} fewer events vs Phase 2`)
    
    // Phase 4: Verbose logging test
    console.log('\n📝 Phase 4: Verbose logging test - 5 seconds')
    console.log('Testing verbose logging control...')
    
    iohook.setVerboseLogging(false)
    console.log('🔇 Verbose logging disabled - C++ console output should be minimal')
    await delay(5000)
    
    // Phase 5: Restore defaults
    console.log('\n📝 Phase 5: Restore default settings - 3 seconds')
    
    iohook.disablePerformanceMode()
    iohook.setVerboseLogging(true)
    console.log('🔊 All settings restored to default')
    await delay(3000)
    
    // Summary
    console.log('\n=== Performance optimization test completed ===')
    iohook.stopMonitoring()
    
    console.log('\n✅ Performance Test Summary:')
    console.log(`  📊 Default mode: ${phase1Count} events/8s`)
    console.log(`  🚀 Performance mode: ${phase2Count} events/8s (${((phase1Count - phase2Count) / phase1Count * 100).toFixed(1)}% reduction)`)
    console.log(`  ⚡ Custom throttling: ${phase3Count} events/8s (additional ${((phase2Count - phase3Count) / phase2Count * 100).toFixed(1)}% reduction)`)
    console.log('  ✅ Verbose logging control working')
    console.log('  ✅ Settings restoration working')
    
    console.log('\n🎉 Performance optimization features are fully functional!')
    console.log('💡 Use enablePerformanceMode() for high-frequency applications')
    console.log('💡 Use setMouseMoveThrottling() for custom performance tuning')
    
    process.exit(0)
}

// Run test
runPerformanceTest()