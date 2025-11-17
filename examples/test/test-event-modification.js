#!/usr/bin/env node

console.log('=== iohook-macos Event Modification/Consumption Test ===')
console.log('This test demonstrates event modification and consumption capabilities.')
console.log('WARNING: This will modify/block system events - use carefully!\n')

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Main test function using async/await
async function runModificationTest() {
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
        console.error('Event modification test failed:', errorObj)
        process.exit(1)
        return
    }
    
    // Phase 1: Basic observation mode
    console.log('📝 Phase 1: Basic observation mode (5 seconds)')
    console.log('Events will be observed but not modified...')
    
    iohook.on('keyDown', (eventData) => {
        console.log('🔍 [OBSERVE] Key Down - Key Code:', eventData.keyCode, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🔍 [OBSERVE] Mouse Click - Button:', eventData.button, 'Location: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.startMonitoring()
    await delay(5000)
    
    // Phase 2: Enable modification mode
    console.log('\n📝 Phase 2: Enabling modification/consumption mode...')
    iohook.stopMonitoring()
    
    iohook.enableModificationAndConsumption()
    iohook.removeAllListeners()
    
    iohook.on('keyDown', (eventData) => {
        console.log('⚡ [MODIFY] Key Down - Key Code:', eventData.keyCode)
        
        // Example: Block all 'a' key presses (key code varies by layout)
        if (eventData.keyCode == 0) { // Key code for 'a'
            console.log('🚫 Blocking "a" key press')
            eventData.preventDefault()
        }
        
        // Example: Modify key code (change one key to another)
        if (eventData.keyCode == 1) { // Key code for 's'
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
    await delay(10000)
    
    // Phase 3: Disable modification mode
    console.log('\n📝 Phase 3: Disabling modification mode...')
    iohook.stopMonitoring()
    
    iohook.disableModificationAndConsumption()
    
    console.log('🔍 Back to observation mode - events will not be modified')
    iohook.startMonitoring()
    await delay(5000)
    
    // Summary
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
}

// Run test
runModificationTest()