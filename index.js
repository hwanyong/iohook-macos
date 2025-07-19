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
}

// Export singleton instance
const eventHook = new MacOSEventHook()
console.log('[iohook-macos] Singleton instance created and ready')

module.exports = eventHook 