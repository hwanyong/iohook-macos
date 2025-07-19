const EventEmitter = require('events')
const path = require('path')

// Load native module
let nativeModule
try {
    // Try to load the built native module
    nativeModule = require('./build/Release/iohook-macos.node')
    console.log('[iohook-macos] Native module loaded successfully')
} catch (error) {
    console.error('[iohook-macos] Failed to load native module:', error.message)
    throw error
}

class MacOSEventHook extends EventEmitter {
    constructor() {
        super()
        console.log('[iohook-macos] MacOSEventHook instance created')
        
        // Set up the bridge between C++ and JavaScript
        this._setupEmitBridge()
    }

    /**
     * Set up the emit function bridge to C++
     * @private
     */
    _setupEmitBridge() {
        try {
            // Pass the emit function to the native module
            nativeModule.setEmitFunction((eventType, eventData) => {
                console.log('[iohook-macos] JavaScript: Received event from C++:', eventType)
                
                // Emit the event through EventEmitter
                this.emit(eventType, eventData)
            })
            console.log('[iohook-macos] Emit bridge setup completed')
        } catch (error) {
            console.error('[iohook-macos] Failed to setup emit bridge:', error.message)
            throw error
        }
    }

    /**
     * Starts monitoring macOS system events
     * @returns {MacOSEventHook} This EventEmitter instance
     */
    startMonitoring() {
        console.log('[iohook-macos] JavaScript: startMonitoring called')
        
        try {
            // Call native function
            nativeModule.startMonitoring()
            console.log('[iohook-macos] JavaScript: Native startMonitoring completed')
            console.log('[iohook-macos] JavaScript: Listening for events...')
            return this
        } catch (error) {
            console.error('[iohook-macos] JavaScript: startMonitoring failed:', error.message)
            throw error
        }
    }

    /**
     * Stops monitoring macOS system events
     */
    stopMonitoring() {
        console.log('[iohook-macos] JavaScript: stopMonitoring called')
        
        try {
            // Call native function
            nativeModule.stopMonitoring()
            console.log('[iohook-macos] JavaScript: Native stopMonitoring completed')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: stopMonitoring failed:', error.message)
            throw error
        }
    }

    /**
     * Checks if monitoring is currently active
     * @returns {boolean} True if monitoring is active
     */
    isMonitoring() {
        try {
            const result = nativeModule.isMonitoring()
            console.log('[iohook-macos] JavaScript: isMonitoring result:', result)
            return result
        } catch (error) {
            console.error('[iohook-macos] JavaScript: isMonitoring failed:', error.message)
            return false
        }
    }

    /**
     * Checks accessibility permissions status
     * @returns {Object} Object with hasPermissions boolean and message string
     */
    checkAccessibilityPermissions() {
        try {
            const result = nativeModule.checkAccessibilityPermissions()
            console.log('[iohook-macos] JavaScript: Accessibility permissions check:', result)
            return result
        } catch (error) {
            console.error('[iohook-macos] JavaScript: checkAccessibilityPermissions failed:', error.message)
            return { hasPermissions: false, message: 'Permission check failed' }
        }
    }

    /**
     * Requests accessibility permissions with system dialog
     * @returns {Object} Object with hasPermissions boolean and message string
     */
    requestAccessibilityPermissions() {
        try {
            const result = nativeModule.requestAccessibilityPermissions()
            console.log('[iohook-macos] JavaScript: Accessibility permissions request:', result)
            return result
        } catch (error) {
            console.error('[iohook-macos] JavaScript: requestAccessibilityPermissions failed:', error.message)
            return { hasPermissions: false, message: 'Permission request failed' }
        }
    }

    /**
     * Enables event modification and consumption functionality
     * When enabled, events can be modified or prevented from propagating to the system
     * Monitoring must be restarted for changes to take effect
     */
    enableModificationAndConsumption() {
        try {
            nativeModule.enableModificationAndConsumption()
            console.log('[iohook-macos] JavaScript: Event modification and consumption enabled')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: enableModificationAndConsumption failed:', error.message)
            throw error
        }
    }

    /**
     * Disables event modification and consumption functionality
     * The library reverts to observe-only mode for events
     * Monitoring must be restarted for changes to take effect
     */
    disableModificationAndConsumption() {
        try {
            nativeModule.disableModificationAndConsumption()
            console.log('[iohook-macos] JavaScript: Event modification and consumption disabled')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: disableModificationAndConsumption failed:', error.message)
            throw error
        }
    }

    /**
     * Sets a process ID filter to monitor only specific processes
     * @param {number} processId - Target process ID
     * @param {boolean} exclude - If true, exclude this process; if false, include only this process
     */
    setProcessFilter(processId, exclude = false) {
        try {
            nativeModule.setProcessFilter(processId, exclude)
            console.log(`[iohook-macos] JavaScript: Process filter set - PID: ${processId}, Mode: ${exclude ? 'EXCLUDE' : 'INCLUDE'}`)
        } catch (error) {
            console.error('[iohook-macos] JavaScript: setProcessFilter failed:', error.message)
            throw error
        }
    }

    /**
     * Sets a coordinate range filter to monitor only events within specified area
     * @param {number} minX - Minimum X coordinate
     * @param {number} minY - Minimum Y coordinate
     * @param {number} maxX - Maximum X coordinate
     * @param {number} maxY - Maximum Y coordinate
     */
    setCoordinateFilter(minX, minY, maxX, maxY) {
        try {
            nativeModule.setCoordinateFilter(minX, minY, maxX, maxY)
            console.log(`[iohook-macos] JavaScript: Coordinate filter set - Range: (${minX}, ${minY}) to (${maxX}, ${maxY})`)
        } catch (error) {
            console.error('[iohook-macos] JavaScript: setCoordinateFilter failed:', error.message)
            throw error
        }
    }

    /**
     * Sets event type filter to monitor only specific types of events
     * @param {boolean} allowKeyboard - Allow keyboard events
     * @param {boolean} allowMouse - Allow mouse events
     * @param {boolean} allowScroll - Allow scroll events
     */
    setEventTypeFilter(allowKeyboard = true, allowMouse = true, allowScroll = true) {
        try {
            nativeModule.setEventTypeFilter(allowKeyboard, allowMouse, allowScroll)
            console.log(`[iohook-macos] JavaScript: Event type filter set - Keyboard: ${allowKeyboard}, Mouse: ${allowMouse}, Scroll: ${allowScroll}`)
        } catch (error) {
            console.error('[iohook-macos] JavaScript: setEventTypeFilter failed:', error.message)
            throw error
        }
    }

    /**
     * Clears all active event filters
     * All events will be monitored again (no filtering)
     */
    clearFilters() {
        try {
            nativeModule.clearFilters()
            console.log('[iohook-macos] JavaScript: All event filters cleared')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: clearFilters failed:', error.message)
            throw error
        }
    }

    /**
     * Enables performance mode for high-frequency event handling
     * Reduces logging, enables mouse move throttling, optimizes memory usage
     */
    enablePerformanceMode() {
        try {
            nativeModule.enablePerformanceMode()
            console.log('[iohook-macos] JavaScript: Performance mode enabled - Optimized for high-frequency events')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: enablePerformanceMode failed:', error.message)
            throw error
        }
    }

    /**
     * Disables performance mode and restores full event logging and processing
     */
    disablePerformanceMode() {
        try {
            nativeModule.disablePerformanceMode()
            console.log('[iohook-macos] JavaScript: Performance mode disabled - Full event logging restored')
        } catch (error) {
            console.error('[iohook-macos] JavaScript: disablePerformanceMode failed:', error.message)
            throw error
        }
    }

    /**
     * Configures mouse move event throttling to reduce event frequency
     * @param {boolean} enabled - Enable/disable mouse move throttling
     * @param {number} intervalMs - Minimum interval between mouse move events in milliseconds (default: 16ms = ~60fps)
     */
    setMouseMoveThrottling(enabled, intervalMs = 16) {
        try {
            nativeModule.setMouseMoveThrottling(enabled, intervalMs)
            console.log(`[iohook-macos] JavaScript: Mouse move throttling set - Enabled: ${enabled}, Interval: ${intervalMs}ms`)
        } catch (error) {
            console.error('[iohook-macos] JavaScript: setMouseMoveThrottling failed:', error.message)
            throw error
        }
    }

    /**
     * Controls verbose logging level for debugging and performance
     * @param {boolean} enabled - Enable/disable verbose console logging
     */
    setVerboseLogging(enabled) {
        try {
            nativeModule.setVerboseLogging(enabled)
            console.log(`[iohook-macos] JavaScript: Verbose logging ${enabled ? 'enabled' : 'disabled'}`)
        } catch (error) {
            console.error('[iohook-macos] JavaScript: setVerboseLogging failed:', error.message)
            throw error
        }
    }
}

// Export singleton instance
const eventHook = new MacOSEventHook()
console.log('[iohook-macos] Singleton instance created and ready')

module.exports = eventHook 