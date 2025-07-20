# AI Usage Guide: iohook-macos (ESM - English)

**[AI Context Start]**  
You are an AI assistant helping developers use the `iohook-macos` library in ESM (ECMAScript Modules) environments. This library provides high-performance macOS system event hooking capabilities for Electron applications using modern ES module syntax. Focus on ES module patterns, import/export syntax, and modern JavaScript practices.
**[AI Context End]**

## Library Overview

`iohook-macos` is a **high-performance native library for hooking macOS system events in Electron applications** using ESM syntax.

### Key Capabilities
- **ESM compatibility**: Native ES module support
- **Real-time event monitoring**: Keyboard, mouse, scroll events
- **System-level access**: Global shortcuts and gestures  
- **High performance**: Optimized polling with configurable rates
- **Event filtering**: Process ID, coordinates, event type filtering

## ESM Usage Patterns

### Import Statements
```javascript
// Named imports (recommended)
import { 
    startMonitoring, 
    stopMonitoring, 
    checkAccessibilityPermissions,
    setEventFilter,
    on as addListener 
} from 'iohook-macos'

// Default import
import iohook from 'iohook-macos'

// Dynamic import
const { default: iohook } = await import('iohook-macos')
```

### Basic Setup
```javascript
import iohook from 'iohook-macos'

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

### Event Listeners with ESM
```javascript
import iohook from 'iohook-macos'

// Keyboard events
iohook.on('keyDown', (event) => {
    console.log('Key pressed:', event.keyCode)
})

// Mouse events
iohook.on('leftMouseDown', (event) => {
    console.log('Left click at:', event.x, event.y)
})

// Generic event listener
iohook.on('event', (event) => {
    console.log('Event type:', event.type)
})
```

## Performance with ESM

### Modular Performance Configuration
```javascript
// performance.mjs
import iohook from 'iohook-macos'

export const setupPerformanceMode = () => {
    iohook.enablePerformanceMode()
    iohook.setPollingRate(16) // 60fps
    iohook.setMouseMoveThrottling(16)
}

export const monitorQueue = () => {
    setInterval(() => {
        const queueSize = iohook.getQueueSize()
        if (queueSize > 100) {
            console.warn('Queue size:', queueSize)
        }
    }, 1000)
}

// main.mjs
import { setupPerformanceMode, monitorQueue } from './performance.mjs'

setupPerformanceMode()
monitorQueue()
```

## Event Filtering with ESM

### Filter Modules
```javascript
// filters.mjs
export const createProcessFilter = (processId, exclude = false) => ({
    filterByProcessId: true,
    targetProcessId: processId,
    excludeProcessId: exclude
})

export const createCoordinateFilter = (minX, maxX, minY, maxY) => ({
    filterByCoordinates: true,
    minX, maxX, minY, maxY
})

// main.mjs
import iohook from 'iohook-macos'
import { createProcessFilter, createCoordinateFilter } from './filters.mjs'

iohook.setEventFilter(createProcessFilter(1234))
iohook.setEventFilter(createCoordinateFilter(0, 1920, 0, 1080))
```

## Electron Integration with ESM

### Main Process (ESM)
```javascript
// main.mjs
import { app, BrowserWindow } from 'electron'
import iohook from 'iohook-macos'

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // Forward events to renderer
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('globalKeyDown', data)
    })

    // Start monitoring when ready
    mainWindow.once('ready-to-show', () => {
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
        }
    })
}

app.whenReady().then(createWindow)

// Cleanup
app.on('window-all-closed', () => {
    iohook.stopMonitoring()
    if (process.platform !== 'darwin') app.quit()
})
```

### Package.json Configuration
```json
{
    "type": "module",
    "main": "main.mjs",
    "scripts": {
        "start": "electron main.mjs",
        "dev": "electron main.mjs --enable-logging"
    }
}
```

## Common Use Cases with ESM

### Modular Global Shortcuts
```javascript
// shortcuts.mjs
import iohook from 'iohook-macos'

class ShortcutManager {
    constructor() {
        this.modifiers = { cmd: false, shift: false }
        this.setupListeners()
    }

    setupListeners() {
        iohook.on('keyDown', this.handleKeyDown.bind(this))
        iohook.on('keyUp', this.handleKeyUp.bind(this))
    }

    handleKeyDown(event) {
        if (event.keyCode === 55) this.modifiers.cmd = true
        if (event.keyCode === 56) this.modifiers.shift = true
        
        if (event.keyCode === 49 && this.modifiers.cmd && this.modifiers.shift) {
            this.onGlobalShortcut()
        }
    }

    handleKeyUp(event) {
        if (event.keyCode === 55) this.modifiers.cmd = false
        if (event.keyCode === 56) this.modifiers.shift = false
    }

    onGlobalShortcut() {
        console.log('Global shortcut triggered!')
    }
}

export default ShortcutManager

// main.mjs
import ShortcutManager from './shortcuts.mjs'
const shortcuts = new ShortcutManager()
```

### Mouse Tracking Module
```javascript
// mouse-tracker.mjs
import iohook from 'iohook-macos'

export class MouseTracker {
    constructor(throttleMs = 50) {
        this.positions = []
        this.lastTime = 0
        this.throttle = throttleMs
        this.setup()
    }

    setup() {
        iohook.on('mouseMoved', (event) => {
            this.trackPosition(event)
        })
    }

    trackPosition(event) {
        const now = Date.now()
        if (now - this.lastTime > this.throttle) {
            this.positions.push({
                x: event.x,
                y: event.y,
                timestamp: event.timestamp
            })
            this.lastTime = now
        }
    }

    getRecentPositions(count = 10) {
        return this.positions.slice(-count)
    }
}

// Usage
import { MouseTracker } from './mouse-tracker.mjs'
const tracker = new MouseTracker(50)
```

## Error Handling with ESM

### Error Management Module
```javascript
// error-handler.mjs
export class PermissionError extends Error {
    constructor(message) {
        super(message)
        this.name = 'PermissionError'
    }
}

export class MonitoringError extends Error {
    constructor(message) {
        super(message)
        this.name = 'MonitoringError'
    }
}

export const handleError = (error) => {
    if (error instanceof PermissionError) {
        console.error('Permission error:', error.message)
    } else if (error instanceof MonitoringError) {
        console.error('Monitoring error:', error.message)
    } else {
        console.error('Unknown error:', error)
    }
}

// main.mjs
import iohook from 'iohook-macos'
import { PermissionError, MonitoringError, handleError } from './error-handler.mjs'

const startMonitoring = async () => {
    try {
        const permissions = iohook.checkAccessibilityPermissions()
        if (!permissions.hasPermissions) {
            throw new PermissionError('Accessibility permissions not granted')
        }
        
        iohook.startMonitoring()
    } catch (error) {
        handleError(error)
    }
}
```

## Event Reference for ESM

### Event Types Module
```javascript
// event-types.mjs
export const EVENT_TYPES = {
    // Keyboard
    keyDown: 10,
    keyUp: 11,
    flagsChanged: 12,
    
    // Mouse
    leftMouseDown: 1,
    leftMouseUp: 2,
    rightMouseDown: 3,
    rightMouseUp: 4,
    mouseMoved: 5,
    
    // Scroll
    scrollWheel: 22
}

export const isKeyboardEvent = (type) => 
    [EVENT_TYPES.keyDown, EVENT_TYPES.keyUp, EVENT_TYPES.flagsChanged].includes(type)

export const isMouseEvent = (type) => 
    [EVENT_TYPES.leftMouseDown, EVENT_TYPES.leftMouseUp, 
     EVENT_TYPES.rightMouseDown, EVENT_TYPES.rightMouseUp, 
     EVENT_TYPES.mouseMoved].includes(type)

// Usage
import { EVENT_TYPES, isKeyboardEvent } from './event-types.mjs'
import iohook from 'iohook-macos'

iohook.on('event', (event) => {
    if (isKeyboardEvent(event.type)) {
        console.log('Keyboard event detected')
    }
})
```

## Dynamic Imports

### Conditional Loading
```javascript
// main.mjs
const initializeEventHook = async () => {
    try {
        // Dynamic import for conditional loading
        const { default: iohook } = await import('iohook-macos')
        
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
            return iohook
        } else {
            throw new Error('Permissions required')
        }
    } catch (error) {
        console.error('Failed to initialize:', error.message)
        return null
    }
}

// Use top-level await (Node.js 14+)
const iohook = await initializeEventHook()
if (iohook) {
    console.log('Event monitoring started')
}
```

### Feature Detection
```javascript
// feature-detection.mjs
export const checkPlatformSupport = async () => {
    if (process.platform !== 'darwin') {
        throw new Error('iohook-macos only supports macOS')
    }
    
    try {
        const { default: iohook } = await import('iohook-macos')
        return iohook.checkAccessibilityPermissions()
    } catch (error) {
        throw new Error('Failed to load iohook-macos: ' + error.message)
    }
}

// main.mjs
import { checkPlatformSupport } from './feature-detection.mjs'

try {
    const permissions = await checkPlatformSupport()
    if (permissions.hasPermissions) {
        const { default: iohook } = await import('iohook-macos')
        iohook.startMonitoring()
    }
} catch (error) {
    console.error('Platform check failed:', error.message)
}
```

This guide provides comprehensive ESM usage patterns for `iohook-macos`. Focus on modern ES module syntax, modular architecture, and dynamic imports for optimal development experience. 