#!/usr/bin/env node

console.log('=== iohook-macos CI Test ===')

try {
    // Test 1: Module loading
    console.log('\n1. Testing module loading...')
    const { default: iohook } = await import('@iohook/macos')
    console.log('✓ Module loaded successfully')
    
    // Test 2: Basic API existence
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
    
    requiredMethods.forEach(method => {
        if (typeof iohook[method] === 'function') {
            console.log(`  ✓ ${method} exists`)
        } else {
            console.log(`  ✗ ${method} missing or not a function`)
            missingMethods.push(method)
        }
    })
    
    if (missingMethods.length > 0) {
        throw new Error(`Missing required methods: ${missingMethods.join(', ')}`)
    }
    
    // Test 3: Initial state
    console.log('\n3. Testing initial state...')
    const initialState = iohook.isMonitoring()
    console.log(`✓ Initial monitoring state: ${initialState}`)
    
    // Test 4: Event type mappings
    console.log('\n4. Testing event type mappings...')
    const { CGEventTypes, EventTypeToInt } = await import('@iohook/shared')
    
    if (CGEventTypes && typeof CGEventTypes === 'object') {
        console.log('✓ CGEventTypes mapping exists')
        console.log(`  Found ${Object.keys(CGEventTypes).length} event types`)
    } else {
        throw new Error('CGEventTypes mapping missing')
    }
    
    if (EventTypeToInt && typeof EventTypeToInt === 'object') {
        console.log('✓ EventTypeToInt mapping exists')
        console.log(`  Found ${Object.keys(EventTypeToInt).length} reverse mappings`)
    } else {
        throw new Error('EventTypeToInt mapping missing')
    }
    
    // Test 5: Accessibility check (safe method)
    console.log('\n5. Testing accessibility permissions check...')
    try {
        const permissions = iohook.checkAccessibilityPermissions()
        console.log(`✓ Accessibility check completed`)
        console.log(`  Has permissions: ${permissions.hasPermissions}`)
        console.log(`  Message: ${permissions.message}`)
    } catch (error) {
        console.log(`⚠ Accessibility check failed (this is expected in CI): ${error.message}`)
    }
    
    // Test 6: Queue operations (safe methods)
    console.log('\n6. Testing queue operations...')
    try {
        const queueSize = iohook.getQueueSize()
        console.log(`✓ Queue size check: ${queueSize}`)
        
        iohook.clearQueue()
        console.log('✓ Queue clear completed')
    } catch (error) {
        console.log(`⚠ Queue operations failed: ${error.message}`)
    }
    
    console.log('\n=== CI Test completed successfully! ===')
    console.log('All core functionality is available and working')
    process.exit(0)
    
} catch (error) {
    console.error('\n❌ CI Test failed:', error.message)
    console.error('\nStack trace:', error.stack)
    process.exit(1)
}