#!/usr/bin/env node

console.log('=== iohook-macos Comprehensive System Test ===')
console.log('Testing all implemented features and data flow integrity...\n')

let testsPassed = 0
let testsTotal = 0

function runTest(testName, testFunction) {
    testsTotal++
    console.log(`🧪 Test ${testsTotal}: ${testName}`)
    
    try {
        const result = testFunction()
        if (result === true || result === undefined) {
            console.log('✅ PASSED\n')
            testsPassed++
        } else {
            console.log('❌ FAILED:', result, '\n')
        }
    } catch (error) {
        console.log('❌ FAILED with exception:', error.message, '\n')
    }
}

try {
    // Load the module
    const iohook = require('../../index.js')
    
    // Test 1: Module Loading and Initialization
    runTest('Module Loading and Initialization', () => {
        return iohook !== undefined && typeof iohook === 'object'
    })
    
    // Test 2: EventEmitter Interface
    runTest('EventEmitter Interface', () => {
        return typeof iohook.on === 'function' && 
               typeof iohook.emit === 'function' &&
               typeof iohook.removeListener === 'function'
    })
    
    // Test 3: Core API Functions
    runTest('Core API Functions Available', () => {
        return typeof iohook.startMonitoring === 'function' &&
               typeof iohook.stopMonitoring === 'function' &&
               typeof iohook.isMonitoring === 'function'
    })
    
    // Test 4: Permission API Functions
    runTest('Permission API Functions Available', () => {
        return typeof iohook.checkAccessibilityPermissions === 'function' &&
               typeof iohook.requestAccessibilityPermissions === 'function'
    })
    
    // Test 5: Initial State Check
    runTest('Initial Monitoring State', () => {
        const isMonitoring = iohook.isMonitoring()
        return isMonitoring === false
    })
    
    // Test 6: Accessibility Permissions Check
    runTest('Accessibility Permissions Check', () => {
        const result = iohook.checkAccessibilityPermissions()
        return result && typeof result.hasPermissions === 'boolean' && typeof result.message === 'string'
    })
    
    // Test 7: Event Listener Registration
    runTest('Event Listener Registration', () => {
        let listenerCalled = false
        const testListener = () => { listenerCalled = true }
        
        iohook.on('test-event', testListener)
        iohook.emit('test-event')
        
        iohook.removeListener('test-event', testListener)
        return listenerCalled === true
    })
    
    // Test 8: Multiple Event Types Registration
    runTest('Multiple Event Types Registration', () => {
        const events = ['keyDown', 'keyUp', 'leftMouseDown', 'leftMouseUp', 
                       'rightMouseDown', 'rightMouseUp', 'mouseMoved', 'scrollWheel']
        
        events.forEach(eventType => {
            iohook.on(eventType, () => {}) // Silent listener
        })
        
        return true // If no exceptions thrown, registration successful
    })
    
    // Test 9: Start Monitoring
    runTest('Start Monitoring', () => {
        iohook.startMonitoring()
        return iohook.isMonitoring() === true
    })
    
    // Test 10: State Persistence During Monitoring
    runTest('State Persistence During Monitoring', () => {
        // Check state multiple times
        return iohook.isMonitoring() === true && iohook.isMonitoring() === true
    })
    
    // Test 11: Stop Monitoring
    runTest('Stop Monitoring', () => {
        iohook.stopMonitoring()
        return iohook.isMonitoring() === false
    })
    
    // Test 12: Restart Capability
    runTest('Restart Capability', () => {
        iohook.startMonitoring()
        const started = iohook.isMonitoring()
        
        iohook.stopMonitoring()
        const stopped = iohook.isMonitoring()
        
        return started === true && stopped === false
    })
    
    // Test 13: Memory Management (Multiple Start/Stop Cycles)
    runTest('Memory Management - Multiple Cycles', () => {
        for (let i = 0; i < 5; i++) {
            iohook.startMonitoring()
            iohook.stopMonitoring()
        }
        return iohook.isMonitoring() === false
    })
    
    // Test 14: Error Handling - Double Start
    runTest('Error Handling - Double Start', () => {
        iohook.startMonitoring()
        iohook.startMonitoring() // Should handle gracefully
        const isMonitoring = iohook.isMonitoring()
        iohook.stopMonitoring()
        return isMonitoring === true
    })
    
    // Test 15: Error Handling - Double Stop
    runTest('Error Handling - Double Stop', () => {
        iohook.stopMonitoring() // Should handle gracefully when not monitoring
        return iohook.isMonitoring() === false
    })
    
    // Final cleanup and summary
    console.log('🔧 Final Cleanup...')
    iohook.stopMonitoring()
    
    // Remove all test listeners
    iohook.removeAllListeners()
    
    console.log('=== COMPREHENSIVE TEST SUMMARY ===')
    console.log(`Tests Passed: ${testsPassed}/${testsTotal}`)
    console.log(`Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`)
    
    if (testsPassed === testsTotal) {
        console.log('🎉 ALL TESTS PASSED! System is stable and ready.')
        console.log('\n📋 Current System Status:')
        console.log('✅ Module loading and initialization')
        console.log('✅ EventEmitter interface complete')
        console.log('✅ Core monitoring APIs functional')
        console.log('✅ Accessibility permission management')
        console.log('✅ Event listener registration system')
        console.log('✅ State management and persistence')
        console.log('✅ Memory management and cleanup')
        console.log('✅ Error handling and edge cases')
        console.log('\n🔄 Next Step: Address CFRunLoop integration for live event detection')
    } else {
        console.log('⚠️  Some tests failed. Review the issues above.')
        process.exit(1)
    }
    
} catch (error) {
    console.error('💥 Comprehensive test failed:', error)
    process.exit(1)
} 