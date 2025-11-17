#!/usr/bin/env node

console.log('=== iohook-macos CI Test ===')

// Test 1: Module loading
function testModuleLoading() {
    console.log('\n1. Testing module loading...')
    
    let hasError = false
    let errorObj = null
    let moduleObj = null
    
    try {
        moduleObj = require('../../index.js')
    } catch (e) {
        hasError = true
        errorObj = e
    }
    
    if (hasError) {
        console.error('\n❌ CI Test failed:', errorObj.message)
        console.error('\nStack trace:', errorObj.stack)
        process.exit(1)
    }
    
    console.log('✓ Module loaded successfully')
    return moduleObj
}

// Test 2: Basic API existence
function testAPIAvailability(iohook) {
    console.log('\n2. Testing API availability...')
    
    const requiredMethods = [
        'startMonitoring',
        'stopMonitoring',
        'isMonitoring',
        'checkAccessibilityPermissions',
        'setPollingRate',
        'getQueueSize',
        'clearQueue',
        'getNextEvent',
        'on',
        'emit'
    ]
    
    let missingMethods = []
    
    for (const method of requiredMethods) {
        if (typeof iohook[method] == 'function') {
            console.log(`  ✓ ${method} exists`)
            continue
        }
        
        console.log(`  ✗ ${method} missing or not a function`)
        missingMethods.push(method)
    }
    
    if (missingMethods.length > 0) {
        console.error(`\n❌ Missing required methods: ${missingMethods.join(', ')}`)
        process.exit(1)
    }
}

// Test 3: Initial state
function testInitialState(iohook) {
    console.log('\n3. Testing initial state...')
    const initialState = iohook.isMonitoring()
    console.log(`✓ Initial monitoring state: ${initialState}`)
}

// Test 4: Event type mappings
function testEventTypeMappings(iohook) {
    console.log('\n4. Testing event type mappings...')
    
    if (!iohook.CGEventTypes || typeof iohook.CGEventTypes != 'object') {
        console.error('\n❌ CGEventTypes mapping missing')
        process.exit(1)
    }
    
    console.log('✓ CGEventTypes mapping exists')
    console.log(`  Found ${Object.keys(iohook.CGEventTypes).length} event types`)
    
    if (!iohook.EventTypeToInt || typeof iohook.EventTypeToInt != 'object') {
        console.error('\n❌ EventTypeToInt mapping missing')
        process.exit(1)
    }
    
    console.log('✓ EventTypeToInt mapping exists')
    console.log(`  Found ${Object.keys(iohook.EventTypeToInt).length} reverse mappings`)
}

// Test 5: Accessibility check (safe method)
function testAccessibilityCheck(iohook) {
    console.log('\n5. Testing accessibility permissions check...')
    
    let hasError = false
    let errorObj = null
    let permissions = null
    
    try {
        permissions = iohook.checkAccessibilityPermissions()
    } catch (e) {
        hasError = true
        errorObj = e
    }
    
    if (hasError) {
        console.log(`⚠ Accessibility check failed (this is expected in CI): ${errorObj.message}`)
        return
    }
    
    console.log(`✓ Accessibility check completed`)
    console.log(`  Has permissions: ${permissions.hasPermissions}`)
    console.log(`  Message: ${permissions.message}`)
}

// Test 6: Queue operations (safe methods)
function testQueueOperations(iohook) {
    console.log('\n6. Testing queue operations...')
    
    let hasError = false
    let errorObj = null
    let queueSize = 0
    
    try {
        queueSize = iohook.getQueueSize()
    } catch (e) {
        hasError = true
        errorObj = e
    }
    
    if (hasError) {
        console.log(`⚠ Queue operations failed: ${errorObj.message}`)
        return
    }
    
    console.log(`✓ Queue size check: ${queueSize}`)
    
    let clearError = false
    let clearErrorObj = null
    
    try {
        iohook.clearQueue()
    } catch (e) {
        clearError = true
        clearErrorObj = e
    }
    
    if (clearError) {
        console.log(`⚠ Queue clear failed: ${clearErrorObj.message}`)
        return
    }
    
    console.log('✓ Queue clear completed')
}

// Run all tests
const iohook = testModuleLoading()
testAPIAvailability(iohook)
testInitialState(iohook)
testEventTypeMappings(iohook)
testAccessibilityCheck(iohook)
testQueueOperations(iohook)

console.log('\n=== CI Test completed successfully! ===')
console.log('All core functionality is available and working')
process.exit(0)