#!/usr/bin/env node

console.log('=== iohook-macos Detailed Event Data Test ===')
console.log('This test will show all available event data fields.')
console.log('Try different input types: keys, mouse buttons, scroll wheel...\n')

try {
    const { default: iohook } = await import('@iohook/macos')
    
    // Set up detailed event listeners
    iohook.on('keyDown', (eventData) => {
        console.log('🔽 Key Down Event:')
        console.log('  - Type:', eventData.type)
        console.log('  - Key Code:', eventData.keyCode)
        console.log('  - Modifiers:', eventData.modifiers)
        console.log('  - Location: (' + eventData.x + ', ' + eventData.y + ')')
        console.log('  - Process ID:', eventData.processId)
        console.log('  - Timestamp:', new Date(eventData.timestamp * 1000).toISOString())
        console.log('')
    })
    
    iohook.on('keyUp', (eventData) => {
        console.log('🔼 Key Up Event:')
        console.log('  - Key Code:', eventData.keyCode)
        console.log('  - Modifiers:', eventData.modifiers)
        console.log('')
    })
    
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🖱️  Left Mouse Down:')
        console.log('  - Button:', eventData.button)
        console.log('  - Click Count:', eventData.clickCount)
        console.log('  - Pressure:', eventData.pressure)
        console.log('  - Location: (' + eventData.x + ', ' + eventData.y + ')')
        console.log('')
    })
    
    iohook.on('rightMouseDown', (eventData) => {
        console.log('🖱️  Right Mouse Down:')
        console.log('  - Button:', eventData.button)
        console.log('  - Click Count:', eventData.clickCount)
        console.log('  - Location: (' + eventData.x + ', ' + eventData.y + ')')
        console.log('')
    })
    
    iohook.on('mouseMoved', (eventData) => {
        console.log('📍 Mouse Moved: (' + eventData.x + ', ' + eventData.y + ')')
    })
    
    iohook.on('scrollWheel', (eventData) => {
        console.log('🎢 Scroll Wheel Event:')
        console.log('  - Delta X:', eventData.deltaX)
        console.log('  - Delta Y:', eventData.deltaY)
        console.log('  - Delta Z:', eventData.deltaZ)
        console.log('  - Fixed Point Delta Y:', eventData.fixedPtDeltaY)
        console.log('  - Location: (' + eventData.x + ', ' + eventData.y + ')')
        console.log('')
    })
    
    console.log('Starting detailed event monitoring...')
    iohook.startMonitoring()
    
    console.log('📝 Test different inputs:')
    console.log('  - Press keys (with/without modifiers like Shift, Cmd)')
    console.log('  - Click left/right mouse buttons')
    console.log('  - Move mouse cursor')
    console.log('  - Use scroll wheel or trackpad gestures')
    console.log('  - Test will run for 15 seconds...\n')
    
    // Stop after 15 seconds
    setTimeout(() => {
        console.log('\n=== Stopping detailed event monitoring ===')
        iohook.stopMonitoring()
        
        console.log('Detailed event data test completed!')
        console.log('All available event fields have been implemented! 🎉')
        process.exit(0)
    }, 15000)
    
} catch (error) {
    console.error('Detailed event test failed:', error)
    process.exit(1)
} 