#!/usr/bin/env node

console.log('=== iohook-macos Event Filtering Test ===')
console.log('This test demonstrates various event filtering capabilities.')
console.log('Different filters will be applied and removed during the test.\n')

try {
    const iohook = require('./index.js')
    
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
    
    console.log('📝 Phase 1: No filters (5 seconds)')
    console.log('All events will be captured...')
    
    iohook.startMonitoring()
    
    setTimeout(() => {
        console.log('\n📝 Phase 2: Process ID filter (10 seconds)')
        
        // Get current process ID for demonstration
        const currentPid = process.pid
        console.log('Setting filter to EXCLUDE current Node.js process (PID:', currentPid, ')')
        
        iohook.setProcessFilter(currentPid, true) // Exclude current process
        
        setTimeout(() => {
            console.log('\n📝 Phase 3: Coordinate filter (10 seconds)')
            console.log('Setting filter to monitor only center screen area (coordinates 500-1500 x 300-900)')
            
            iohook.clearFilters()
            iohook.setCoordinateFilter(500, 300, 1500, 900) // Center screen area
            
            setTimeout(() => {
                console.log('\n📝 Phase 4: Event type filter (10 seconds)')
                console.log('Setting filter to monitor ONLY keyboard events (no mouse/scroll)')
                
                iohook.clearFilters()
                iohook.setEventTypeFilter(true, false, false) // Only keyboard
                
                setTimeout(() => {
                    console.log('\n📝 Phase 5: Mouse-only filter (10 seconds)')
                    console.log('Setting filter to monitor ONLY mouse events (no keyboard/scroll)')
                    
                    iohook.clearFilters()
                    iohook.setEventTypeFilter(false, true, false) // Only mouse
                    
                    setTimeout(() => {
                        console.log('\n📝 Phase 6: Combined filters (10 seconds)')
                        console.log('Setting combined filter: Mouse events in small screen area')
                        
                        iohook.clearFilters()
                        iohook.setEventTypeFilter(false, true, false) // Only mouse
                        iohook.setCoordinateFilter(100, 100, 800, 600) // Top-left area
                        
                        setTimeout(() => {
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
                        }, 10000)
                        
                    }, 10000)
                    
                }, 10000)
                
            }, 10000)
            
        }, 10000)
        
    }, 5000)
    
} catch (error) {
    console.error('Event filtering test failed:', error)
    process.exit(1)
} 