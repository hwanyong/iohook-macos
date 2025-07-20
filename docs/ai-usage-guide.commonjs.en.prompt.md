# AI Usage Guide: iohook-macos (CommonJS - English)

**[AI Context Start]**  
You are an AI assistant helping developers use the `iohook-macos` library in CommonJS environments. This library provides high-performance macOS system event hooking capabilities for Electron applications. Focus on practical usage patterns, common implementations, and best practices.
**[AI Context End]**

## Library Overview

`iohook-macos` is a **high-performance native library for hooking macOS system events in Electron applications** using CommonJS syntax.

### Key Capabilities
- **Real-time event monitoring**: Keyboard, mouse, scroll events
- **System-level access**: Global shortcuts and gestures  
- **High performance**: Optimized polling with configurable rates
- **Event filtering**: Process ID, coordinates, event type filtering
- **Accessibility integration**: Built-in permission handling

## CommonJS Usage Patterns

### Basic Setup
```javascript
const iohook = require('iohook-macos')

// Check accessibility permissions first
const permissions = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('Accessibility permissions required')
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// Start monitoring
iohook.startMonitoring()
```

### Event Listeners

#### String-based Events (Recommended)
```javascript
// Keyboard events
iohook.on('keyDown', (event) => {
    console.log('Key pressed:', event.keyCode)
    console.log('Timestamp:', event.timestamp)
})

iohook.on('keyUp', (event) => {
    console.log('Key released:', event.keyCode)
})

// Mouse events
iohook.on('leftMouseDown', (event) => {
    console.log('Left click at:', event.x, event.y)
})

iohook.on('mouseMoved', (event) => {
    console.log('Mouse moved to:', event.x, event.y)
})

// Scroll events
iohook.on('scrollWheel', (event) => {
    console.log('Scroll detected at:', event.x, event.y)
})
```

#### Number-based Events (CGEventType)
```javascript
// Using CGEventType integers directly
iohook.on(10, (event) => { // kCGEventKeyDown
    console.log('Key down:', event.keyCode)
})

iohook.on(1, (event) => { // kCGEventLeftMouseDown
    console.log('Left mouse down:', event.x, event.y)
})

// Generic event listener for all events
iohook.on('event', (event) => {
    console.log('Any event:', event.type, event)
})
```

### Event Data Structure
```javascript
// Event object properties
const eventData = {
    type: 10,              // CGEventType number
    x: 123.45,            // X coordinate (mouse events)
    y: 678.90,            // Y coordinate (mouse events) 
    timestamp: 1678886400000, // Event timestamp
    processId: 12345,     // Source process ID
    keyCode: 36,          // Key code (keyboard events)
    hasKeyCode: true      // Whether keyCode is available
}
```

## Performance Optimization

### High-Performance Mode
```javascript
// Enable performance mode for high-frequency events
iohook.enablePerformanceMode()

// Set optimal polling rate (60fps = 16ms)
iohook.setPollingRate(16)

// Throttle mouse move events to reduce CPU usage
iohook.setMouseMoveThrottling(16) // 60fps

// Monitor queue size to prevent overflow
setInterval(() => {
    const queueSize = iohook.getQueueSize()
    if (queueSize > 100) {
        console.warn('Event queue getting large:', queueSize)
        // Consider increasing polling rate or filtering events
    }
}, 1000)
```

### Queue Management
```javascript
// Manual queue control
const nextEvent = iohook.getNextEvent() // Get next event manually
iohook.clearQueue() // Clear all pending events

// Check monitoring status
if (iohook.isMonitoring()) {
    console.log('Currently monitoring events')
}
```

## Event Filtering

### Process-based Filtering
```javascript
// Monitor only specific process
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 1234,
    excludeProcessId: false // Include only this process
})

// Exclude specific process  
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 5678,
    excludeProcessId: true // Exclude this process
})
```

### Coordinate-based Filtering
```javascript
// Monitor only specific screen region
iohook.setEventFilter({
    filterByCoordinates: true,
    minX: 0, maxX: 1920,    // Screen width range
    minY: 0, maxY: 1080     // Screen height range
})
```

### Event Type Filtering
```javascript
// Filter by event categories
iohook.setEventFilter({
    filterByEventType: true,
    allowKeyboard: true,     // Allow keyboard events
    allowMouse: false,       // Block mouse events
    allowScroll: true        // Allow scroll events
})

// Clear all filters
iohook.clearEventFilter()
```

## Electron Integration

### Main Process Setup
```javascript
const { app, BrowserWindow, ipcMain } = require('electron')
const iohook = require('iohook-macos')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Forward events to renderer process
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('globalKeyDown', data)
    })

    iohook.on('leftMouseDown', (data) => {
        mainWindow.webContents.send('globalMouseClick', data)
    })

    // Start monitoring after window is ready
    mainWindow.once('ready-to-show', () => {
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
        } else {
            console.log('Please grant accessibility permissions')
        }
    })

    return mainWindow
}

app.whenReady().then(createWindow)

// Handle app cleanup
app.on('window-all-closed', () => {
    iohook.stopMonitoring()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
```

### IPC Communication
```javascript
// In renderer process
const { ipcRenderer } = require('electron')

ipcRenderer.on('globalKeyDown', (event, data) => {
    console.log('Global key pressed:', data.keyCode)
    // Update UI based on global keyboard input
})

ipcRenderer.on('globalMouseClick', (event, data) => {
    console.log('Global mouse click at:', data.x, data.y)
    // Handle global mouse events
})
```

## Permission Handling

### Accessibility Permissions
```javascript
// Check and request permissions
function ensurePermissions() {
    const result = iohook.checkAccessibilityPermissions()
    
    if (!result.hasPermissions) {
        console.log('Status:', result.message)
        
        // Show system permission dialog
        iohook.requestAccessibilityPermissions()
        
        console.log('Please grant accessibility permissions and restart the app')
        return false
    }
    
    return true
}

// Use before starting monitoring
if (ensurePermissions()) {
    iohook.startMonitoring()
}
```

## Common Use Cases

### Global Shortcuts
```javascript
// Implement Cmd+Shift+Space shortcut
let cmdPressed = false
let shiftPressed = false

iohook.on('keyDown', (event) => {
    if (event.keyCode === 55) cmdPressed = true      // Cmd key
    if (event.keyCode === 56) shiftPressed = true    // Shift key
    if (event.keyCode === 49) {                      // Space key
        if (cmdPressed && shiftPressed) {
            console.log('Global shortcut triggered!')
            // Execute your action here
        }
    }
})

iohook.on('keyUp', (event) => {
    if (event.keyCode === 55) cmdPressed = false
    if (event.keyCode === 56) shiftPressed = false
})
```

### Mouse Tracking
```javascript
// Track mouse position with throttling
let lastMouseTime = 0
const MOUSE_THROTTLE = 50 // 50ms = 20fps

iohook.on('mouseMoved', (event) => {
    const now = Date.now()
    if (now - lastMouseTime > MOUSE_THROTTLE) {
        console.log(`Mouse at: ${event.x}, ${event.y}`)
        lastMouseTime = now
    }
})
```

### Click Monitoring
```javascript
// Monitor click patterns
let clickCount = 0
let lastClickTime = 0

iohook.on('leftMouseDown', (event) => {
    const now = Date.now()
    
    // Reset count if too much time passed
    if (now - lastClickTime > 500) {
        clickCount = 0
    }
    
    clickCount++
    lastClickTime = now
    
    console.log(`Click #${clickCount} at: ${event.x}, ${event.y}`)
    
    // Double-click detection
    if (clickCount === 2) {
        console.log('Double-click detected!')
    }
})
```

## Error Handling

### Common Error Patterns
```javascript
// Robust monitoring setup
function startMonitoringWithErrorHandling() {
    try {
        // Check permissions first
        const permissions = iohook.checkAccessibilityPermissions()
        if (!permissions.hasPermissions) {
            throw new Error('Accessibility permissions not granted')
        }
        
        // Start monitoring
        iohook.startMonitoring()
        console.log('Event monitoring started successfully')
        
    } catch (error) {
        console.error('Failed to start monitoring:', error.message)
        
        if (error.message.includes('permission')) {
            console.log('Please grant accessibility permissions in System Preferences')
        }
        
        return false
    }
    
    return true
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...')
    if (iohook.isMonitoring()) {
        iohook.stopMonitoring()
    }
    process.exit(0)
})
```

## Event Reference

### Supported Event Types
```javascript
const EVENT_TYPES = {
    // Keyboard
    'keyDown': 10,
    'keyUp': 11,
    'flagsChanged': 12,
    
    // Mouse Clicks
    'leftMouseDown': 1,
    'leftMouseUp': 2,
    'rightMouseDown': 3,
    'rightMouseUp': 4,
    'otherMouseDown': 25,
    'otherMouseUp': 26,
    
    // Mouse Movement
    'mouseMoved': 5,
    'leftMouseDragged': 6,
    'rightMouseDragged': 7,
    'otherMouseDragged': 27,
    
    // Scroll & Others
    'scrollWheel': 22,
    'tabletPointer': 23,
    'tabletProximity': 24
}
```

This guide provides comprehensive CommonJS usage patterns for `iohook-macos`. Focus on practical implementations and performance optimization for real-world applications. 