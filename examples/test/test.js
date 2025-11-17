#!/usr/bin/env node

console.log('=== iohook-macos Basic Functionality Test ===')

// Load the module
console.log('\n1. Loading iohook-macos module...')
const loadResult = { success: false, error: null, module: null }

let moduleObj = null
let loadError = false
let loadErrorObj = null

// Minimal try-catch only for require() which must throw
try {
    moduleObj = require('../../index.js')
} catch (e) {
    loadError = true
    loadErrorObj = e
}

if (loadError) {
    loadResult.error = loadErrorObj
    console.error('Test failed:', loadResult.error)
    process.exit(1)
}

loadResult.success = true
loadResult.module = moduleObj

const iohook = loadResult.module

// Test initial state
console.log('\n2. Testing initial state...')
console.log('Initial monitoring state:', iohook.isMonitoring())

// Test startMonitoring (this will fail without accessibility permissions, which is expected)
console.log('\n3. Testing startMonitoring...')

let startError = false
let startErrorObj = null

// Minimal try-catch for startMonitoring
try {
    iohook.startMonitoring()
} catch (e) {
    startError = true
    startErrorObj = e
}

// Early return pattern with value-based error handling
if (startError) {
    console.log('Expected error (likely accessibility permissions):', startErrorObj.message)
    console.log('This is normal - accessibility permissions need to be granted manually')
    
    console.log('\n4. Testing stopMonitoring (should handle gracefully)...')
    iohook.stopMonitoring()
    
    console.log('\n=== Basic test completed! ===')
    console.log('Next step: Grant accessibility permissions to test full functionality')
    process.exit(0)
}

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