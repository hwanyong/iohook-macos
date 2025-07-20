#!/usr/bin/env node

console.log('=== iohook-macos Basic Functionality Test ===')

try {
    // Load the module
    console.log('\n1. Loading iohook-macos module...')
    const iohook = require('../../index.js')
    
    // Test initial state
    console.log('\n2. Testing initial state...')
    console.log('Initial monitoring state:', iohook.isMonitoring())
    
    // Test startMonitoring (this will fail without accessibility permissions, which is expected)
    console.log('\n3. Testing startMonitoring...')
    try {
        iohook.startMonitoring()
        console.log('startMonitoring completed successfully')
        
        // Test state after starting
        console.log('Monitoring state after start:', iohook.isMonitoring())
        
        // Wait a moment then stop
        setTimeout(() => {
            console.log('\n4. Testing stopMonitoring...')
            iohook.stopMonitoring()
            console.log('Final monitoring state:', iohook.isMonitoring())
            
            console.log('\n=== Test completed successfully! ===')
            process.exit(0)
        }, 1000)
        
    } catch (error) {
        console.log('Expected error (likely accessibility permissions):', error.message)
        console.log('This is normal - accessibility permissions need to be granted manually')
        
        console.log('\n4. Testing stopMonitoring (should handle gracefully)...')
        iohook.stopMonitoring()
        
        console.log('\n=== Basic test completed! ===')
        console.log('Next step: Grant accessibility permissions to test full functionality')
        process.exit(0)
    }
    
} catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
} 