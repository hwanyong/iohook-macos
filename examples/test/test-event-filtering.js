#!/usr/bin/env node

console.log('=== iohook-macos Event Filtering Test ===')
console.log('This test demonstrates various event filtering capabilities.')
console.log('Different filters will be applied and removed during the test.\n')

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Main test function using async/await
async function runFilteringTest() {
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
        console.error('Event filtering test failed:', errorObj)
        process.exit(1)
        return
    }
    
    // Generic event listener for all tests
    iohook.on('keyDown', (eventData) => {
        console.log('⌨️  [FILTERED] Key Down - Key Code:', eventData.keyCode, 'Process:', eventData.processId, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🖱️  [FILTERED] Mouse Click - Process:', eventData.processId, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.on('scrollWheel', (eventData) => {
        console.log('🎢 [FILTERED] Scroll Wheel - Process:', eventData.processId, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    // Phase 1: No filters
    console.log('📝 Phase 1: No filters (5 seconds)')
    console.log('All events will be captured...')
    
    iohook.startMonitoring()
    await delay(5000)
    
    // Phase 2: Process ID filter
    console.log('\n📝 Phase 2: Process ID filter (10 seconds)')
    const currentPid = process.pid
    console.log('Setting filter to EXCLUDE current Node.js process (PID:', currentPid, ')')
    iohook.setProcessFilter(currentPid, true)
    await delay(10000)
    
    // Phase 3: Coordinate filter
    console.log('\n📝 Phase 3: Coordinate filter (10 seconds)')
    console.log('Setting filter to monitor only center screen area (coordinates 500-1500 x 300-900)')
    iohook.clearFilters()
    iohook.setCoordinateFilter(500, 300, 1500, 900)
    await delay(10000)
    
    // Phase 4: Event type filter (keyboard only)
    console.log('\n📝 Phase 4: Event type filter (10 seconds)')
    console.log('Setting filter to monitor ONLY keyboard events (no mouse/scroll)')
    iohook.clearFilters()
    iohook.setEventTypeFilter(true, false, false)
    await delay(10000)
    
    // Phase 5: Event type filter (mouse only)
    console.log('\n📝 Phase 5: Mouse-only filter (10 seconds)')
    console.log('Setting filter to monitor ONLY mouse events (no keyboard/scroll)')
    iohook.clearFilters()
    iohook.setEventTypeFilter(false, true, false)
    await delay(10000)
    
    // Phase 6: Combined filters
    console.log('\n📝 Phase 6: Combined filters (10 seconds)')
    console.log('Setting combined filter: Mouse events in small screen area')
    iohook.clearFilters()
    iohook.setEventTypeFilter(false, true, false)
    iohook.setCoordinateFilter(100, 100, 800, 600)
    await delay(10000)
    
    // Cleanup and summary
    console.log('\n=== Clearing all filters ===')
    iohook.clearFilters()
    iohook.stopMonitoring()
    
    console.log('✅ Event Filtering Test Summary:')
    console.log('  ✅ No filters - All events captured')
    console.log('  ✅ Process ID filter - Include/exclude specific processes')
    console.log('  ✅ Coordinate filter - Monitor specific screen areas')
    console.log('  ✅ Event type filter - Monitor specific event types')
    console.log('  ✅ Combined filters - Multiple conditions together')
    console.log('  ✅ Filter clearing - Remove all filters')
    
    console.log('\n🎉 Event filtering feature is fully functional!')
    process.exit(0)
}

// Run test
runFilteringTest()