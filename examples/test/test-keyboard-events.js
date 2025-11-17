#!/usr/bin/env node

console.log('=== iohook-macos Keyboard Events Test ===')
console.log('This test focuses on keyboard input detection.')
console.log('Please type keys, use modifiers (Shift, Cmd, Ctrl, Option)...\n')

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
    console.error('Keyboard event test failed:', errorObj)
    process.exit(1)
}
    
// Set up keyboard-focused event listeners
iohook.on('keyDown', (eventData) => {
        console.log('⬇️  Key Down:')
        console.log('  - Key Code:', eventData.keyCode)
        console.log('  - Modifiers:', JSON.stringify(eventData.modifiers, null, 2))
        console.log('  - Location: (' + eventData.x + ', ' + eventData.y + ')')
        console.log('  - Process ID:', eventData.processId)
        console.log('  - Timestamp:', new Date(eventData.timestamp * 1000).toISOString())
        console.log('')
    })
    
    iohook.on('keyUp', (eventData) => {
        console.log('⬆️  Key Up:')
        console.log('  - Key Code:', eventData.keyCode)
        console.log('  - Modifiers:', JSON.stringify(eventData.modifiers, null, 2))
        console.log('')
    })
    
    // Also listen to mouse events but with minimal output
    iohook.on('leftMouseDown', (eventData) => {
        console.log('🖱️  Mouse Click (to show mouse still works)')
    })
    
    console.log('Starting keyboard event monitoring...')
    iohook.startMonitoring()
    
    console.log('📝 Test keyboard inputs:')
    console.log('  - Type letters: a, b, c, etc.')
    console.log('  - Try numbers: 1, 2, 3, etc.')
    console.log('  - Use modifiers: Shift+a, Cmd+c, Ctrl+v, Option+e')
    console.log('  - Special keys: Space, Enter, Tab, Escape')
    console.log('  - Function keys: F1, F2, etc.')
    console.log('  - Arrow keys: ←, →, ↑, ↓')
    console.log('  - Test will run for 20 seconds...\n')
    
    // Stop after 20 seconds
    setTimeout(() => {
        console.log('\n=== Stopping keyboard event monitoring ===')
        iohook.stopMonitoring()
        
        console.log('Keyboard event test completed!')
        console.log('If you saw keyboard events above, keyboard detection is working! 🎉')
        process.exit(0)
    }, 20000)