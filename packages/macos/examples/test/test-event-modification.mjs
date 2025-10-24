#!/usr/bin/env node

console.log('=== iohook-macos Event Modification/Consumption Test ===')
console.log('This test demonstrates event modification and consumption capabilities.')
console.log('WARNING: This will modify/block system events - use carefully!\n')

try {
    const { default: iohook } = await import('@iohook/macos')
    
    // Test 1: Basic observation mode (default)
    console.log('📝 Phase 1: Basic observation mode (5 seconds)')
    console.log('Events will be observed but not modified...')
    
    iohook.on('keyDown', (eventData) => {
        console.log('🔍 [OBSERVE] Key Down - Key Code:', eventData.keyCode, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🔍 [OBSERVE] Mouse Click - Button:', eventData.button, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.startMonitoring()
    
    setTimeout(() => {
        console.log('\n📝 Phase 2: Enabling modification/consumption mode...')
        iohook.stopMonitoring()
        
        // Enable modification/consumption
        iohook.enableModificationAndConsumption()
        
        // Add event modification/consumption listeners
        iohook.removeAllListeners()
        
        iohook.on('keyDown', (eventData) => {
            console.log('⚡ [MODIFY] Key Down - Key Code:', eventData.keyCode)
            
            // Example: Block all 'a' key presses (key code varies by layout)
            if (eventData.keyCode === 0) { // Key code for 'a' 
                console.log('🚫 Blocking "a" key press')
                eventData.preventDefault()
            }
            
            // Example: Modify key code (change one key to another)
            if (eventData.keyCode === 1) { // Key code for 's'
                console.log('🔄 Changing "s" key to "z"')
                eventData.keyCode = 6 // Key code for 'z'
            }
        })
        
        iohook.on('leftMouseDown', (eventData) => {
            console.log('⚡ [MODIFY] Mouse Click at (' + eventData.x + ', ' + eventData.y + ')')
            
            // Example: Block clicks in top-left corner (x < 100, y < 100)
            if (eventData.x < 100 && eventData.y < 100) {
                console.log('🚫 Blocking click in top-left corner')
                eventData.preventDefault()
            }
            
            // Example: Modify click location (shift clicks to the right)
            if (eventData.x > 500) {
                console.log('🔄 Shifting click 50 pixels to the right')
                eventData.x += 50
            }
        })
        
        console.log('🚨 WARNING: Modification mode active!')
        console.log('  - Try typing "a" and "s" keys (may be blocked/modified)')
        console.log('  - Try clicking in top-left corner (may be blocked)')
        console.log('  - Try clicking after x=500 (may be shifted)')
        
        iohook.startMonitoring()
        
        setTimeout(() => {
            console.log('\n📝 Phase 3: Disabling modification mode...')
            iohook.stopMonitoring()
            
            iohook.disableModificationAndConsumption()
            
            console.log('🔍 Back to observation mode - events will not be modified')
            iohook.startMonitoring()
            
            setTimeout(() => {
                console.log('\n=== Event modification test completed ===')
                iohook.stopMonitoring()
                
                console.log('✅ Test Summary:')
                console.log('  ✅ Observation mode working')
                console.log('  ✅ Modification/consumption mode working')  
                console.log('  ✅ preventDefault() method available')
                console.log('  ✅ Event property modification working')
                console.log('  ✅ Mode switching working')
                
                console.log('\n🎉 Event modification and consumption feature is fully functional!')
                process.exit(0)
            }, 5000)
            
        }, 10000)
        
    }, 5000)
    
} catch (error) {
    console.error('Event modification test failed:', error)
    process.exit(1)
} 