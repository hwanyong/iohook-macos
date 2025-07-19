#!/usr/bin/env node

console.log('=== iohook-macos Accessibility Permissions Test ===\n')

try {
    // Load the module
    const iohook = require('./index.js')
    
    // Check current permissions status
    console.log('1. Checking current accessibility permissions...')
    const permissionStatus = iohook.checkAccessibilityPermissions()
    console.log('Permission Status:', permissionStatus)
    
    if (permissionStatus.hasPermissions) {
        console.log('✅ Accessibility permissions are already granted!')
        console.log('You can proceed with event monitoring.')
    } else {
        console.log('❌ Accessibility permissions are not granted.')
        console.log('\n2. Requesting accessibility permissions...')
        
        const requestResult = iohook.requestAccessibilityPermissions()
        console.log('Request Result:', requestResult)
        
        if (!requestResult.hasPermissions) {
            console.log('\n📝 Manual Steps Required:')
            console.log('1. Go to System Preferences > Security & Privacy > Privacy')
            console.log('2. Select "Accessibility" from the list')
            console.log('3. Click the lock icon and enter your password')
            console.log('4. Find and enable this application (Terminal or Node.js)')
            console.log('5. Restart the application and try again')
        }
    }
    
    console.log('\n=== Permission test completed ===')
    
} catch (error) {
    console.error('Permission test failed:', error)
    process.exit(1)
} 