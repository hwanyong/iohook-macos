// TypeScript usage example for iohook-macos
import iohook from '@iohook/macos'
import type { EventData, AccessibilityPermissionsResult, EventFilterOptions } from '@iohook/macos'

// Type-safe event handling example
function setupEventListeners(): void {
    console.log('🎯 Setting up TypeScript event listeners...')
    
    // String-based event listeners (type-safe)
    iohook.on('keyDown', (data: EventData) => {
        console.log('🔽 Key Down:', {
            type: data.type,
            keyCode: data.keyCode,
            timestamp: data.timestamp,
            processId: data.processId
        })
    })
    
    iohook.on('keyUp', (data: EventData) => {
        console.log('🔼 Key Up:', {
            type: data.type,
            keyCode: data.keyCode
        })
    })
    
    // Number-based event listeners (CGEventType integers)
    iohook.on(1, (data: EventData) => { // kCGEventLeftMouseDown
        console.log('🖱️ Left Mouse Down:', {
            type: data.type,
            x: data.x,
            y: data.y,
            processId: data.processId
        })
    })
    
    iohook.on(2, (data: EventData) => { // kCGEventLeftMouseUp
        console.log('🖱️ Left Mouse Up:', {
            type: data.type,
            x: data.x,
            y: data.y
        })
    })
    
    // Mouse movement events
    iohook.on('mouseMoved', (data: EventData) => {
        console.log(`📍 Mouse at (${data.x}, ${data.y})`)
    })
    
    // Scroll events
    iohook.on('scrollWheel', (data: EventData) => {
        console.log('🌀 Scroll detected:', {
            type: data.type,
            x: data.x,
            y: data.y
        })
    })
    
    // Generic event listener
    iohook.on('event', (data: EventData) => {
        console.log('📡 Generic event:', data.type)
    })
}

// Type-safe permission checking
function checkPermissions(): void {
    console.log('🔐 Checking accessibility permissions...')
    
    const result: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
    
    console.log('Permission status:', {
        hasPermissions: result.hasPermissions,
        message: result.message
    })
    
    if (!result.hasPermissions) {
        console.log('❌ Accessibility permissions not granted')
        
        // Request permissions with type safety
        const requestResult: AccessibilityPermissionsResult = iohook.requestAccessibilityPermissions()
        console.log('Permission request result:', requestResult)
    } else {
        console.log('✅ Accessibility permissions granted')
    }
}

// Type-safe configuration
function configureLibrary(): void {
    console.log('⚙️ Configuring iohook-macos with TypeScript...')
    
    // Performance settings
    iohook.enablePerformanceMode()
    iohook.setVerboseLogging(true)
    iohook.setMouseMoveThrottling(16) // 60fps
    
    // Polling configuration
    iohook.setPollingRate(16) // 60fps polling
    
    // Event filtering with type-safe options
    const filterOptions: EventFilterOptions = {
        filterByEventType: true,
        allowKeyboard: true,
        allowMouse: true,
        allowScroll: false, // Disable scroll events for this example
        filterByCoordinates: true,
        minX: 0,
        maxX: 1920,
        minY: 0,
        maxY: 1080
    }
    
    iohook.setEventFilter(filterOptions)
}

// Type-safe monitoring control
function demonstrateMonitoring(): void {
    console.log('🚀 Starting monitoring demonstration...')
    
    // Check initial state
    const isInitiallyMonitoring: boolean = iohook.isMonitoring()
    console.log('Initial monitoring state:', isInitiallyMonitoring)
    
    // Start monitoring
    try {
        iohook.startMonitoring()
        console.log('✅ Monitoring started successfully')
        
        // Check queue periodically
        const queueChecker = setInterval(() => {
            const queueSize: number = iohook.getQueueSize()
            if (queueSize > 0) {
                console.log(`📊 Queue size: ${queueSize}`)
            }
            
            // Manually get next event for demonstration
            const nextEvent: EventData | null = iohook.getNextEvent()
            if (nextEvent) {
                console.log('📦 Manual event retrieval:', nextEvent)
            }
        }, 1000)
        
        // Stop after 10 seconds
        setTimeout(() => {
            clearInterval(queueChecker)
            iohook.stopMonitoring()
            console.log('🛑 Monitoring stopped')
            
            // Clear queue
            iohook.clearQueue()
            console.log('🗑️ Queue cleared')
        }, 10000)
        
    } catch (error) {
        console.error('❌ Failed to start monitoring:', error)
    }
}

// Type-safe access to static mappings
function demonstrateTypeMappings(): void {
    console.log('🗺️ Demonstrating type mappings...')
    
    // Access CGEventTypes mapping with full type safety
    console.log('CGEventTypes mapping:')
    const eventTypes = iohook.CGEventTypes
    console.log('Left mouse down:', eventTypes[1]) // "leftMouseDown"
    console.log('Key down:', eventTypes[10]) // "keyDown"
    
    // Access reverse mapping
    console.log('EventTypeToInt mapping:')
    const typeToInt = iohook.EventTypeToInt
    console.log('leftMouseDown code:', typeToInt.leftMouseDown) // 1
    console.log('keyDown code:', typeToInt.keyDown) // 10
}

// Main execution function
function main(): void {
    console.log('🎉 iohook-macos TypeScript Example Started')
    console.log('=' .repeat(50))
    
    // Run all demonstrations
    demonstrateTypeMappings()
    checkPermissions()
    configureLibrary()
    setupEventListeners()
    
    // Only start monitoring if permissions are available
    const permissions = iohook.checkAccessibilityPermissions()
    if (permissions.hasPermissions) {
        demonstrateMonitoring()
    } else {
        console.log('⚠️ Skipping monitoring demo - no accessibility permissions')
    }
}

// Error handling
process.on('uncaughtException', (error: Error) => {
    console.error('💥 Uncaught Exception:', error.message)
    process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥 Unhandled Rejection:', reason)
    process.exit(1)
})

// Run the example
if (require.main === module) {
    main()
}

export { main, setupEventListeners, checkPermissions, configureLibrary } 