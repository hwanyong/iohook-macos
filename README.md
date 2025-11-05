# iohook-macos

## 📖 Documentation
**[English](README.md)** | **[한국어](README.ko.md)**

[![npm version](https://badge.fury.io/js/iohook-macos.svg)](https://badge.fury.io/js/iohook-macos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![macOS](https://img.shields.io/badge/macOS-10.15+-green.svg)](https://www.apple.com/macos/)
[![Electron](https://img.shields.io/badge/Electron-Compatible-lightblue.svg)](https://www.electronjs.org/)

High-performance macOS system event hook library for Electron applications with **full TypeScript support**.

## 🤖 AI-Enhanced Documentation

This library includes comprehensive AI-optimized documentation to help AI assistants understand and implement the library effectively. These specialized guides are designed to provide AI with contextual usage patterns and best practices.

### Available AI Usage Guides

- **[CommonJS Guide (English)](docs/ai-usage-guide.commonjs.en.prompt.md)** - Complete CommonJS patterns and implementations
- **[CommonJS Guide (한국어)](docs/ai-usage-guide.commonjs.ko.prompt.md)** - CommonJS 패턴 및 구현 가이드
- **[ESM Guide (English)](docs/ai-usage-guide.esm.en.prompt.md)** - Modern ES Module syntax and patterns
- **[ESM Guide (한국어)](docs/ai-usage-guide.esm.ko.prompt.md)** - 최신 ES 모듈 문법 및 패턴
- **[TypeScript Guide (English)](docs/ai-usage-guide.typescript.en.prompt.md)** - Type-safe implementations and patterns
- **[TypeScript Guide (한국어)](docs/ai-usage-guide.typescript.ko.prompt.md)** - 타입 안전한 구현 및 패턴
- **[Development Document](docs/prd/macos_event_hook_library_dev_document.md)** - Technical specifications and architecture

These guides enable AI assistants to provide accurate, context-aware assistance for implementing system event hooks in macOS applications.

## 🎯 Why iohook-macos?

Traditional macOS event hooking solutions often suffer from fragmentation and complexity, requiring developers to integrate multiple disparate libraries, manage complex native dependencies, and navigate inconsistent APIs across different event types. This fragmented ecosystem leads to increased development overhead, maintenance burden, and potential compatibility issues.

**iohook-macos** addresses these challenges by providing a **unified, comprehensive solution** that consolidates all system-level event monitoring capabilities into a single, well-designed library. Our approach eliminates the need for multiple dependencies while delivering enterprise-grade performance, complete TypeScript integration, and intuitive APIs that abstract away the underlying complexity of macOS Core Graphics Event Services.

By offering a cohesive development experience with consistent patterns across keyboard, mouse, and scroll event handling, developers can focus on building features rather than wrestling with infrastructure concerns.

## 🎯 Features

- **🎹 Keyboard Events**: `keyDown`, `keyUp`, `flagsChanged`
- **🖱️ Mouse Events**: Click, movement, drag (left/right/other buttons)
- **🌀 Scroll Events**: Mouse wheel and trackpad gestures
- **⌨️ Modifier Keys**: Automatic parsing of modifier key states (Shift, Control, Option, Command, Caps Lock, Fn)
- **🔒 Security**: Built-in accessibility permission handling
- **⚡ Performance**: Optimized polling mode with configurable rates
- **🎛️ Filtering**: Process ID, coordinate range, and event type filters
- **🛡️ Type Safety**: Complete TypeScript definitions included
- **📊 Monitoring**: Real-time queue monitoring and statistics

## 📦 Installation

```bash
npm install iohook-macos
```

### Prerequisites

- **macOS 10.15+** (Catalina or later)
- **Node.js 14+**
- **Electron** (if using with Electron apps)
- **Xcode Command Line Tools**

## 🚀 Quick Start

### JavaScript

```javascript
const iohook = require('iohook-macos')

// Check accessibility permissions
const permissions = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('Please grant accessibility permissions')
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// Set up event listeners
iohook.on('keyDown', (event) => {
    console.log('Key pressed:', event.keyCode)
})

iohook.on('leftMouseDown', (event) => {
    console.log('Mouse clicked at:', event.x, event.y)
})

// Start monitoring
iohook.startMonitoring()
```

### TypeScript 🎉

```typescript
import * as iohook from 'iohook-macos'
import type { EventData, AccessibilityPermissionsResult } from 'iohook-macos'

// Type-safe permission checking
const permissions: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()

// Type-safe event handling
iohook.on('keyDown', (event: EventData) => {
    console.log('Key pressed:', event.keyCode)
    console.log('Event type:', event.type) // CGEventType number
})

// Number-based event listeners (CGEventType)
iohook.on(1, (event: EventData) => { // kCGEventLeftMouseDown
    console.log('Left mouse down at:', event.x, event.y)
})

// Start monitoring with full type safety
iohook.startMonitoring()
```

## 📚 TypeScript Support

This library includes comprehensive TypeScript definitions for full type safety and IntelliSense support.

### Key Types

```typescript
interface EventData {
    type: number           // CGEventType integer
    x?: number            // X coordinate (mouse events)
    y?: number            // Y coordinate (mouse events)
    timestamp: number     // Event timestamp
    processId?: number    // Source process ID
    keyCode?: number      // Key code (keyboard events)
    hasKeyCode?: boolean  // Whether keyCode is available
    modifiers: {          // Parsed modifier key states
        shift: boolean
        control: boolean
        option: boolean
        command: boolean
        capsLock: boolean
        fn: boolean
    }
}

interface AccessibilityPermissionsResult {
    hasPermissions: boolean
    message: string
}

interface EventFilterOptions {
    filterByProcessId?: boolean
    excludeProcessId?: boolean
    targetProcessId?: number
    filterByCoordinates?: boolean
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
    filterByEventType?: boolean
    allowKeyboard?: boolean
    allowMouse?: boolean
    allowScroll?: boolean
}
```

### Event Types

Both string and numeric event types are fully supported:

```typescript
// String-based (recommended for readability)
iohook.on('keyDown', handler)
iohook.on('leftMouseDown', handler)
iohook.on('scrollWheel', handler)

// Number-based (CGEventType integers)
iohook.on(10, handler)  // kCGEventKeyDown
iohook.on(1, handler)   // kCGEventLeftMouseDown
iohook.on(22, handler)  // kCGEventScrollWheel
```

### Running TypeScript Examples

```bash
# Install TypeScript dependencies
npm install

# Run TypeScript example
npm run typescript-example

# Compile TypeScript example
npm run typescript-compile
```

## 🎛️ API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `startMonitoring()` | Start event monitoring | `void` |
| `stopMonitoring()` | Stop event monitoring | `void` |
| `isMonitoring()` | Check monitoring status | `boolean` |

### Polling Control

| Method | Description | Parameters |
|--------|-------------|------------|
| `setPollingRate(ms)` | Set polling interval | `ms: number` |
| `getQueueSize()` | Get event queue size | - |
| `clearQueue()` | Clear event queue | - |
| `getNextEvent()` | Get next event manually | - |

### Performance

| Method | Description | Parameters |
|--------|-------------|------------|
| `enablePerformanceMode()` | Enable high-performance mode | - |
| `disablePerformanceMode()` | Disable performance mode | - |
| `setMouseMoveThrottling(ms)` | Throttle mouse move events | `ms: number` |
| `setVerboseLogging(enable)` | Control verbose logging | `enable: boolean` |

### Filtering

| Method | Description | Parameters |
|--------|-------------|------------|
| `setEventFilter(options)` | Configure event filters (unified interface) | `options: EventFilterOptions` |
| `setProcessFilter(processId, exclude)` | Filter by process ID | `processId: number, exclude: boolean` |
| `setCoordinateFilter(minX, minY, maxX, maxY)` | Filter by screen coordinates | `minX, minY, maxX, maxY: number` |
| `setEventTypeFilter(allowKeyboard, allowMouse, allowScroll)` | Filter by event types | All parameters: `boolean` |
| `clearFilters()` | Clear all filters | - |
| `clearEventFilter()` | Clear all filters (deprecated, use `clearFilters()`) | - |

## 🔒 Accessibility Permissions

macOS requires accessibility permissions for system event monitoring:

```javascript
// Check permissions
const result = iohook.checkAccessibilityPermissions()
console.log(result.hasPermissions) // boolean
console.log(result.message)        // descriptive message

// Request permissions (shows system dialog)
if (!result.hasPermissions) {
    const requestResult = iohook.requestAccessibilityPermissions()
    console.log(requestResult.message) // Shows dialog to user
}
```

**Note:** The `requestAccessibilityPermissions()` method will open the System Preferences accessibility panel if permissions are not already granted. Users must manually add your application to the accessibility list.

**Manual Setup:**
1. Open **System Preferences** → **Security & Privacy** → **Privacy**
2. Select **Accessibility** from the left panel
3. Click the lock icon and enter your password
4. Add your application to the list

## 📊 Event Monitoring

### Basic Event Handling

```javascript
// Listen for specific events
iohook.on('keyDown', (event) => {
    console.log(`Key ${event.keyCode} pressed`)
})

iohook.on('mouseMoved', (event) => {
    console.log(`Mouse at (${event.x}, ${event.y})`)
})

// Generic event listener
iohook.on('event', (event) => {
    console.log(`Event type: ${event.type}`)
})
```

### Modifier Keys

All events include a `modifiers` object with parsed modifier key states, eliminating the need for manual bitwise operations:

```javascript
// Easy access to modifier key states
iohook.on('keyDown', (event) => {
    if (event.modifiers.shift && event.modifiers.command) {
        console.log('Shift + Command pressed')
    }
    
    if (event.modifiers.option) {
        console.log('Option key is pressed')
    }
})

// Before (complex bitwise operations)
const shiftPressed = (event.flags & 0x00020000) !== 0
const cmdPressed = (event.flags & 0x00100000) !== 0

// After (clean and intuitive)
const shiftPressed = event.modifiers.shift
const cmdPressed = event.modifiers.command
```

**Available modifier keys:**
- `shift` - Shift key state
- `control` - Control key state
- `option` - Option (Alt) key state
- `command` - Command (⌘) key state
- `capsLock` - Caps Lock state
- `fn` - Function key state

The `modifiers` object is available on **all event types** (keyboard, mouse, scroll, etc.), not just `flagsChanged` events.

### Event Filtering

```javascript
// Unified filter interface (recommended for complex filters)
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 1234,
    excludeProcessId: false, // Include only this process
    filterByCoordinates: true,
    minX: 0, maxX: 1920,
    minY: 0, maxY: 1080,
    filterByEventType: true,
    allowKeyboard: true,
    allowMouse: true,
    allowScroll: false
})

// Or use direct native methods for single filters
iohook.setProcessFilter(1234, false) // Include only process 1234
iohook.setCoordinateFilter(0, 0, 1920, 1080) // Screen region
iohook.setEventTypeFilter(true, true, false) // Keyboard, mouse, no scroll

// Clear all filters
iohook.clearFilters()
```

## 🎮 Electron Integration

```javascript
// Main process (main.js)
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

    // Set up event forwarding
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('keyDown', data)
    })

    iohook.startMonitoring()
}

app.whenReady().then(createWindow)
```

## 🧪 Examples

The repository includes comprehensive examples:

- **JavaScript**: `examples/test/`
- **TypeScript**: `examples/typescript/`
- **Electron**: `examples/electron/`

```bash
# Run basic test
npm test

# Run comprehensive test
npm run test-comprehensive

# Run Electron example
npm run electron-test

# Run TypeScript example
npm run typescript-example
```

## ⚡ Performance Optimization

```javascript
// Enable performance mode
iohook.enablePerformanceMode()

// Set optimal polling rate (60fps)
iohook.setPollingRate(16)

// Throttle high-frequency mouse events
iohook.setMouseMoveThrottling(16)

// Monitor queue size
setInterval(() => {
    const queueSize = iohook.getQueueSize()
    if (queueSize > 100) {
        console.warn('Queue getting large:', queueSize)
    }
}, 1000)
```

## 🛠️ Development

### Building from Source

```bash
# Install dependencies
npm install

# Rebuild native module
npm run rebuild

# For Electron
npm run electron-rebuild
```

### Requirements

- **Xcode** with Command Line Tools
- **Python 3** (for node-gyp)
- **Node.js 14+**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Node.js N-API](https://nodejs.org/api/n-api.html)
- Uses macOS [Core Graphics Event Services](https://developer.apple.com/documentation/coregraphics/core_graphics_event_services)
- Inspired by the cross-platform [iohook](https://github.com/wilix-team/iohook) library

---

**Made with ❤️ for macOS developers** 