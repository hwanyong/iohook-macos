# AI Usage Guide: iohook-macos (TypeScript - English)

**[AI Context Start]**  
You are an AI assistant helping developers use the `iohook-macos` library in TypeScript environments. This library provides high-performance macOS system event hooking capabilities for Electron applications with full type safety. Focus on TypeScript-specific patterns, type definitions, and type-safe implementations.
**[AI Context End]**

## Library Overview

`iohook-macos` is a **high-performance native library for hooking macOS system events in Electron applications** with complete TypeScript support and type definitions.

### Key Capabilities
- **Type-safe event handling**: Full TypeScript definitions included
- **Real-time event monitoring**: Keyboard, mouse, scroll events with typed interfaces
- **System-level access**: Global shortcuts and gestures with type safety
- **High performance**: Optimized polling with configurable rates
- **Event filtering**: Process ID, coordinates, event type filtering with typed options

## TypeScript Usage Patterns

### Installation & Setup
```typescript
import * as iohook from 'iohook-macos'
import type { 
    EventData, 
    AccessibilityPermissionsResult, 
    EventFilterOptions,
    CGEventTypeString,
    CGEventTypeNumber
} from 'iohook-macos'

// Type-safe permission checking
const permissions: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('Accessibility permissions required:', permissions.message)
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// Start monitoring with type safety
iohook.startMonitoring()
```

### Type-Safe Event Listeners

#### String-based Events (Recommended)
```typescript
// Keyboard events with full type safety
iohook.on('keyDown', (event: EventData) => {
    console.log('Key pressed:', event.keyCode)
    console.log('Process ID:', event.processId)
    console.log('Has key code:', event.hasKeyCode)
    
    // TypeScript ensures all properties are properly typed
    if (event.hasKeyCode && event.keyCode) {
        console.log('Valid key code:', event.keyCode)
    }
})

iohook.on('keyUp', (event: EventData) => {
    console.log('Key released:', event.keyCode)
})

// Mouse events with coordinate type safety
iohook.on('leftMouseDown', (event: EventData) => {
    if (event.x !== undefined && event.y !== undefined) {
        console.log(`Left click at: (${event.x}, ${event.y})`)
        console.log('Timestamp:', event.timestamp)
    }
})

iohook.on('mouseMoved', (event: EventData) => {
    if (event.x !== undefined && event.y !== undefined) {
        console.log(`Mouse moved to: (${event.x}, ${event.y})`)
    }
})

// Scroll events
iohook.on('scrollWheel', (event: EventData) => {
    console.log('Scroll event at:', event.x, event.y)
})
```

#### Number-based Events (CGEventType)
```typescript
// Using CGEventType with type safety
iohook.on(10 as CGEventTypeNumber, (event: EventData) => { // kCGEventKeyDown
    console.log('Key down event:', event.keyCode)
})

iohook.on(1 as CGEventTypeNumber, (event: EventData) => { // kCGEventLeftMouseDown
    console.log('Left mouse down:', event.x, event.y)
})

// Generic event listener with type safety
iohook.on('event', (event: EventData) => {
    console.log('Event type:', event.type)
    console.log('Event data:', event)
})
```

### Event Data Interface
```typescript
// Complete EventData interface
interface EventData {
    type: number           // CGEventType integer value
    x?: number            // X coordinate (mouse events)
    y?: number            // Y coordinate (mouse events)
    timestamp: number     // Event timestamp
    processId?: number    // Source process ID
    keyCode?: number      // Key code (keyboard events)
    hasKeyCode?: boolean  // Whether keyCode is available
}

// Usage with type guards
function isMouseEvent(event: EventData): event is EventData & { x: number; y: number } {
    return event.x !== undefined && event.y !== undefined
}

function isKeyboardEvent(event: EventData): event is EventData & { keyCode: number } {
    return event.hasKeyCode === true && event.keyCode !== undefined
}

// Type-safe event handling
iohook.on('event', (event: EventData) => {
    if (isMouseEvent(event)) {
        console.log(`Mouse event at: (${event.x}, ${event.y})`)
    }
    
    if (isKeyboardEvent(event)) {
        console.log(`Keyboard event with key: ${event.keyCode}`)
    }
})
```

## Performance Optimization

### Type-Safe Performance Configuration
```typescript
// Type-safe performance mode setup
interface PerformanceConfig {
    pollingRate: number
    mouseThrottling: number
    enablePerformance: boolean
}

const performanceConfig: PerformanceConfig = {
    pollingRate: 16,        // 60fps
    mouseThrottling: 16,    // 60fps
    enablePerformance: true
}

// Apply configuration with type safety
if (performanceConfig.enablePerformance) {
    iohook.enablePerformanceMode()
}

iohook.setPollingRate(performanceConfig.pollingRate)
iohook.setMouseMoveThrottling(performanceConfig.mouseThrottling)

// Type-safe queue monitoring
function monitorQueue(): void {
    setInterval(() => {
        const queueSize: number = iohook.getQueueSize()
        if (queueSize > 100) {
            console.warn('Event queue getting large:', queueSize)
        }
    }, 1000)
}

monitorQueue()
```

### Queue Management with Types
```typescript
// Type-safe queue operations
const nextEvent: EventData | null = iohook.getNextEvent()
if (nextEvent) {
    console.log('Next event:', nextEvent.type)
}

// Clear queue
iohook.clearQueue()

// Check monitoring status with type safety
const isMonitoring: boolean = iohook.isMonitoring()
if (isMonitoring) {
    console.log('Currently monitoring events')
}
```

## Type-Safe Event Filtering

### Filter Configuration Interface
```typescript
// Complete filter options interface
const filterOptions: EventFilterOptions = {
    // Process filtering
    filterByProcessId: true,
    excludeProcessId: false,  // Include only target process
    targetProcessId: 1234,
    
    // Coordinate filtering
    filterByCoordinates: true,
    minX: 0,
    maxX: 1920,
    minY: 0,
    maxY: 1080,
    
    // Event type filtering
    filterByEventType: true,
    allowKeyboard: true,
    allowMouse: false,
    allowScroll: true
}

// Apply filter with type safety
iohook.setEventFilter(filterOptions)

// Partial filter updates
const partialFilter: Partial<EventFilterOptions> = {
    filterByCoordinates: true,
    minX: 100,
    maxX: 800
}

iohook.setEventFilter(partialFilter)
```

### Type-Safe Filter Functions
```typescript
// Helper functions for common filtering patterns
function createProcessFilter(processId: number, exclude: boolean = false): EventFilterOptions {
    return {
        filterByProcessId: true,
        targetProcessId: processId,
        excludeProcessId: exclude
    }
}

function createCoordinateFilter(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
): EventFilterOptions {
    return {
        filterByCoordinates: true,
        minX,
        maxX,
        minY,
        maxY
    }
}

function createEventTypeFilter(
    allowKeyboard: boolean = true,
    allowMouse: boolean = true,
    allowScroll: boolean = true
): EventFilterOptions {
    return {
        filterByEventType: true,
        allowKeyboard,
        allowMouse,
        allowScroll
    }
}

// Usage with unified filter interface
iohook.setEventFilter(createProcessFilter(1234, false))
iohook.setEventFilter(createCoordinateFilter(0, 1920, 0, 1080))
iohook.setEventFilter(createEventTypeFilter(true, false, true))
```

### Direct Native Filter Methods
```typescript
// Type-safe direct filter methods (more efficient)
// Process filtering
iohook.setProcessFilter(1234, false)  // Include only process 1234
iohook.setProcessFilter(5678, true)   // Exclude process 5678

// Coordinate filtering
iohook.setCoordinateFilter(0, 0, 1920, 1080)  // Screen bounds

// Event type filtering
iohook.setEventTypeFilter(true, false, true)  // Keyboard + Scroll only
iohook.setEventTypeFilter(false, true, false) // Mouse events only

// Clear all filters (recommended)
iohook.clearFilters()

// DEPRECATED: Use clearFilters() instead
iohook.clearEventFilter()  // Still works for backward compatibility
```

### Type Definitions for Direct Methods
```typescript
// Direct filter method signatures
declare function setProcessFilter(processId: number, exclude: boolean): void
declare function setCoordinateFilter(minX: number, minY: number, maxX: number, maxY: number): void
declare function setEventTypeFilter(allowKeyboard: boolean, allowMouse: boolean, allowScroll: boolean): void
declare function clearFilters(): void
declare function clearEventFilter(): void  // DEPRECATED
```

## Electron Integration with TypeScript

### Type-Safe Main Process
```typescript
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import * as iohook from 'iohook-macos'
import type { EventData } from 'iohook-macos'

interface ElectronWindow extends BrowserWindow {
    sendEventToRenderer(eventName: string, data: EventData): void
}

function createWindow(): ElectronWindow {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    }) as ElectronWindow

    // Add type-safe method
    mainWindow.sendEventToRenderer = (eventName: string, data: EventData) => {
        mainWindow.webContents.send(eventName, data)
    }

    // Type-safe event forwarding
    iohook.on('keyDown', (data: EventData) => {
        mainWindow.sendEventToRenderer('globalKeyDown', data)
    })

    iohook.on('leftMouseDown', (data: EventData) => {
        mainWindow.sendEventToRenderer('globalMouseClick', data)
    })

    return mainWindow
}

// Type-safe IPC handlers
ipcMain.handle('checkPermissions', (): AccessibilityPermissionsResult => {
    return iohook.checkAccessibilityPermissions()
})

ipcMain.handle('startMonitoring', (): boolean => {
    try {
        iohook.startMonitoring()
        return true
    } catch (error) {
        console.error('Failed to start monitoring:', error)
        return false
    }
})
```

### Type-Safe IPC Communication
```typescript
// Renderer process types
import { ipcRenderer, IpcRendererEvent } from 'electron'
import type { EventData, AccessibilityPermissionsResult } from 'iohook-macos'

// Type-safe event handlers
ipcRenderer.on('globalKeyDown', (event: IpcRendererEvent, data: EventData) => {
    console.log('Global key pressed:', data.keyCode)
    // Type-safe UI updates based on keyboard input
    if (data.hasKeyCode && data.keyCode) {
        handleGlobalKeyPress(data.keyCode)
    }
})

ipcRenderer.on('globalMouseClick', (event: IpcRendererEvent, data: EventData) => {
    if (data.x !== undefined && data.y !== undefined) {
        console.log(`Global mouse click at: (${data.x}, ${data.y})`)
        handleGlobalMouseClick(data.x, data.y)
    }
})

// Type-safe IPC calls
async function checkPermissions(): Promise<AccessibilityPermissionsResult> {
    return await ipcRenderer.invoke('checkPermissions')
}

async function startMonitoring(): Promise<boolean> {
    return await ipcRenderer.invoke('startMonitoring')
}

// UI functions with type safety
function handleGlobalKeyPress(keyCode: number): void {
    // Implementation with type safety
}

function handleGlobalMouseClick(x: number, y: number): void {
    // Implementation with type safety
}
```

## Permission Handling with Types

### Type-Safe Permission Management
```typescript
// Permission checking with typed result
async function ensurePermissions(): Promise<boolean> {
    const result: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
    
    if (!result.hasPermissions) {
        console.log('Permission status:', result.message)
        
        // Type-safe permission request
        // Opens System Settings > Privacy & Security > Accessibility
        const requestResult: AccessibilityPermissionsResult = iohook.requestAccessibilityPermissions()
        console.log('Request result:', requestResult.message)
        // Returns: { hasPermissions: false, message: "Opening System Settings..." }
        
        return false
    }
    
    return true
}

// Usage with proper error handling
async function initializeMonitoring(): Promise<void> {
    try {
        const hasPermissions = await ensurePermissions()
        
        if (hasPermissions) {
            iohook.startMonitoring()
            console.log('Monitoring started successfully')
        } else {
            throw new Error('Accessibility permissions not granted')
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Initialization failed:', error.message)
        }
    }
}
```

### AccessibilityPermissionsResult Interface
```typescript
// Type definition for permission result
interface AccessibilityPermissionsResult {
    hasPermissions: boolean  // Current permission status
    message: string          // Status description
}

// Both checkAccessibilityPermissions() and requestAccessibilityPermissions()
// return this same structure
const checkResult: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
const requestResult: AccessibilityPermissionsResult = iohook.requestAccessibilityPermissions()
```

## Common Use Cases with TypeScript

### Type-Safe Global Shortcuts
```typescript
interface ModifierKeys {
    cmd: boolean
    shift: boolean
    alt: boolean
    ctrl: boolean
}

class GlobalShortcutManager {
    private modifiers: ModifierKeys = {
        cmd: false,
        shift: false,
        alt: false,
        ctrl: false
    }

    private readonly KEY_CODES = {
        CMD: 55,
        SHIFT: 56,
        ALT: 58,
        CTRL: 59,
        SPACE: 49
    } as const

    constructor() {
        this.setupEventListeners()
    }

    private setupEventListeners(): void {
        iohook.on('keyDown', (event: EventData) => {
            this.updateModifiers(event, true)
            this.checkShortcuts(event)
        })

        iohook.on('keyUp', (event: EventData) => {
            this.updateModifiers(event, false)
        })
    }

    private updateModifiers(event: EventData, pressed: boolean): void {
        if (!event.keyCode) return

        switch (event.keyCode) {
            case this.KEY_CODES.CMD:
                this.modifiers.cmd = pressed
                break
            case this.KEY_CODES.SHIFT:
                this.modifiers.shift = pressed
                break
            case this.KEY_CODES.ALT:
                this.modifiers.alt = pressed
                break
            case this.KEY_CODES.CTRL:
                this.modifiers.ctrl = pressed
                break
        }
    }

    private checkShortcuts(event: EventData): void {
        if (!event.keyCode) return

        // Cmd+Shift+Space
        if (event.keyCode === this.KEY_CODES.SPACE && 
            this.modifiers.cmd && 
            this.modifiers.shift) {
            this.onCmdShiftSpace()
        }
    }

    private onCmdShiftSpace(): void {
        console.log('Global shortcut Cmd+Shift+Space triggered!')
        // Type-safe action implementation
    }
}

// Usage
const shortcutManager = new GlobalShortcutManager()
```

### Type-Safe Mouse Tracking
```typescript
interface MousePosition {
    x: number
    y: number
    timestamp: number
}

class MouseTracker {
    private positions: MousePosition[] = []
    private lastTrackTime: number = 0
    private readonly THROTTLE_MS = 50 // 20fps

    constructor() {
        this.setupTracking()
    }

    private setupTracking(): void {
        iohook.on('mouseMoved', (event: EventData) => {
            if (this.shouldTrack(event)) {
                this.addPosition(event)
            }
        })
    }

    private shouldTrack(event: EventData): boolean {
        const now = Date.now()
        return (now - this.lastTrackTime > this.THROTTLE_MS) &&
               (event.x !== undefined && event.y !== undefined)
    }

    private addPosition(event: EventData): void {
        if (event.x === undefined || event.y === undefined) return

        const position: MousePosition = {
            x: event.x,
            y: event.y,
            timestamp: event.timestamp
        }

        this.positions.push(position)
        this.lastTrackTime = Date.now()

        // Keep only last 100 positions
        if (this.positions.length > 100) {
            this.positions.shift()
        }

        this.onPositionUpdate(position)
    }

    private onPositionUpdate(position: MousePosition): void {
        console.log(`Mouse at: (${position.x}, ${position.y})`)
    }

    public getRecentPositions(count: number = 10): MousePosition[] {
        return this.positions.slice(-count)
    }

    public clearHistory(): void {
        this.positions = []
    }
}

// Usage
const mouseTracker = new MouseTracker()
```

## Error Handling with TypeScript

### Type-Safe Error Management
```typescript
// Custom error types
class PermissionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PermissionError'
    }
}

class MonitoringError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MonitoringError'
    }
}

// Type-safe monitoring setup
class EventMonitor {
    private isActive: boolean = false

    public async start(): Promise<void> {
        try {
            await this.checkPermissions()
            this.startMonitoring()
            this.isActive = true
            console.log('Event monitoring started successfully')
        } catch (error) {
            this.handleError(error)
        }
    }

    private async checkPermissions(): Promise<void> {
        const result: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
        
        if (!result.hasPermissions) {
            throw new PermissionError(`Accessibility permissions not granted: ${result.message}`)
        }
    }

    private startMonitoring(): void {
        try {
            iohook.startMonitoring()
        } catch (error) {
            throw new MonitoringError('Failed to start system event monitoring')
        }
    }

    private handleError(error: unknown): void {
        if (error instanceof PermissionError) {
            console.error('Permission error:', error.message)
            console.log('Please grant accessibility permissions in System Preferences')
        } else if (error instanceof MonitoringError) {
            console.error('Monitoring error:', error.message)
        } else if (error instanceof Error) {
            console.error('Unknown error:', error.message)
        } else {
            console.error('Unexpected error:', error)
        }
    }

    public stop(): void {
        if (this.isActive) {
            iohook.stopMonitoring()
            this.isActive = false
            console.log('Event monitoring stopped')
        }
    }

    public get isMonitoring(): boolean {
        return this.isActive && iohook.isMonitoring()
    }
}

// Usage with proper cleanup
const monitor = new EventMonitor()

process.on('SIGINT', () => {
    console.log('Shutting down...')
    monitor.stop()
    process.exit(0)
})

monitor.start()
```

## Event Type Reference

### Type Definitions
```typescript
// Complete event type mappings
type CGEventTypeString = 
    | "null"
    | "leftMouseDown" | "leftMouseUp"
    | "rightMouseDown" | "rightMouseUp"
    | "mouseMoved"
    | "leftMouseDragged" | "rightMouseDragged"
    | "keyDown" | "keyUp" | "flagsChanged"
    | "scrollWheel"
    | "tabletPointer" | "tabletProximity"
    | "otherMouseDown" | "otherMouseUp" | "otherMouseDragged"

type CGEventTypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 26 | 27

// Event type utility functions
function isKeyboardEventType(type: number): boolean {
    return type === 10 || type === 11 || type === 12 // keyDown, keyUp, flagsChanged
}

function isMouseEventType(type: number): boolean {
    return [1, 2, 3, 4, 5, 6, 7, 25, 26, 27].includes(type)
}

function isScrollEventType(type: number): boolean {
    return type === 22 // scrollWheel
}

// Type-safe event categorization
function categorizeEvent(event: EventData): 'keyboard' | 'mouse' | 'scroll' | 'other' {
    if (isKeyboardEventType(event.type)) return 'keyboard'
    if (isMouseEventType(event.type)) return 'mouse'
    if (isScrollEventType(event.type)) return 'scroll'
    return 'other'
}
```

This guide provides comprehensive TypeScript usage patterns for `iohook-macos` with full type safety. Focus on leveraging TypeScript's type system for robust, maintainable event handling implementations. 