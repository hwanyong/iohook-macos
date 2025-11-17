#!/usr/bin/env node

console.log('=== iohook-macos Event Bridge Test ===')
console.log('This test will monitor keyboard and mouse events for 10 seconds.')
console.log('Try pressing keys and clicking mouse buttons...\n')

// Load the module
let hasError = false
let errorObj = null
let iohook = null

try {
    iohook = require('../../index.js')
} catch (e) {
    hasError = true
    errorObj = e
}

if (hasError) {
    console.error('Test failed:', errorObj)
    process.exit(1)
}
    
// Set up event listeners
iohook.on('keyDown', (eventData) => {
        console.log('🔽 Key Down Event:', eventData)
    })
    
    iohook.on('keyUp', (eventData) => {
        console.log('🔼 Key Up Event:', eventData)
    })
    
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🖱️  Left Mouse Down Event:', eventData)
    })
    
    iohook.on('leftMouseUp', (eventData) => {
        console.log('🖱️  Left Mouse Up Event:', eventData)
    })
    
    // Start monitoring
    console.log('Starting event monitoring...')
    iohook.startMonitoring()
    
    console.log('Monitoring active! Press keys or click mouse...')
    console.log('Test will automatically stop in 10 seconds.\n')
    
    // Stop after 10 seconds
    setTimeout(() => {
        console.log('\n=== Stopping monitoring ===')
        iohook.stopMonitoring()
        
        console.log('Event bridge test completed!')
        console.log('If you saw events above, the bridge is working perfectly! 🎉')
        process.exit(0)
    }, 10000)