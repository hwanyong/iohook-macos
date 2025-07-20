const EventEmitter = require('events');
const path = require('path');

// Load the native module using node-gyp-build for better binary distribution
let nativeModule;
try {
    nativeModule = require('node-gyp-build')(path.join(__dirname));
    console.log('[iohook-macos] Native module loaded successfully via node-gyp-build');
} catch (buildError) {
    console.log('[iohook-macos] node-gyp-build failed, trying fallback paths...');
    try {
        // Fallback to direct path
        nativeModule = require('./build/Release/iohook-macos.node');
        console.log('[iohook-macos] Native module loaded via fallback path');
    } catch (fallbackError) {
        console.error('[iohook-macos] Failed to load native module:', buildError.message);
        console.error('[iohook-macos] Fallback also failed:', fallbackError.message);
        throw new Error('Native module could not be loaded. Please run: npm run rebuild');
    }
}

// CGEventType to String mapping table
const CGEventTypes = {
    0: "null",
    1: "leftMouseDown", 
    2: "leftMouseUp",
    3: "rightMouseDown",
    4: "rightMouseUp",
    5: "mouseMoved",
    6: "leftMouseDragged",
    7: "rightMouseDragged",
    10: "keyDown",
    11: "keyUp",
    12: "flagsChanged",
    22: "scrollWheel",
    23: "tabletPointer",
    24: "tabletProximity",
    25: "otherMouseDown",
    26: "otherMouseUp",
    27: "otherMouseDragged"
}

// Reverse mapping for convenience (string to int)
const EventTypeToInt = {}
Object.keys(CGEventTypes).forEach(key => {
    EventTypeToInt[CGEventTypes[key]] = parseInt(key)
})

class MacOSEventHook extends EventEmitter {
    constructor() {
        super();
        this._isMonitoring = false;
        this.pollingInterval = null;
        this.pollingRate = 16; // ~60fps (16ms)
        
        console.log('[iohook-macos] MacOSEventHook instance created');
    }

    // Static getter for CGEventTypes mapping
    static get CGEventTypes() {
        return CGEventTypes
    }

    // Static getter for reverse mapping  
    static get EventTypeToInt() {
        return EventTypeToInt
    }

    // Instance getters for convenience
    get CGEventTypes() {
        return CGEventTypes
    }

    get EventTypeToInt() {
        return EventTypeToInt
    }

    // Set polling rate (in milliseconds)
    setPollingRate(ms) {
        this.pollingRate = Math.max(1, ms); // Minimum 1ms
        console.log(`[iohook-macos] Polling rate set to ${this.pollingRate}ms`);
        
        // Restart polling if already running
        if (this._isMonitoring) {
            this.stopPolling();
            this.startPolling();
        }
    }
    
    // Start event polling
    startPolling() {
        if (this.pollingInterval) return;
        
        this.pollingInterval = setInterval(() => {
            try {
                // Get all available events
                let event;
                let eventCount = 0;
                const maxEventsPerPoll = 50; // Prevent blocking
                
                while ((event = nativeModule.getNextEvent()) && eventCount < maxEventsPerPoll) {
                    // event.type is now an int (CGEventType value)
                    const eventTypeInt = event.type
                    const eventTypeString = CGEventTypes[eventTypeInt] || "unknown"
                    
                    // Emit with both int and string for user convenience
                    this.emit(eventTypeInt, event)        // For users who want to use int
                    this.emit(eventTypeString, event)     // For users who want to use string
                    this.emit('event', event)             // Generic event for all types
                    
                    eventCount++;
                }
                
                if (eventCount >= maxEventsPerPoll) {
                    console.log(`[iohook-macos] Processed ${eventCount} events in one poll cycle`);
                }
            } catch (error) {
                console.error('[iohook-macos] Error during polling:', error);
            }
        }, this.pollingRate);
        
        console.log(`[iohook-macos] Polling started at ${this.pollingRate}ms intervals`);
    }
    
    // Stop event polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[iohook-macos] Polling stopped');
        }
    }

    // Start monitoring (includes native start + polling)
    startMonitoring() {
        console.log('[iohook-macos] JavaScript: startMonitoring called');
        
        // Set up the emit bridge (legacy compatibility)
        nativeModule.setEmitFunction((eventType, eventData) => {
            // This is not used in polling mode but kept for compatibility
            console.log('[iohook-macos] JavaScript: Legacy emit called (not used in polling mode)');
        });
        
        console.log('[iohook-macos] Emit bridge setup completed');
        
        // Start native monitoring
        nativeModule.startMonitoring();
        console.log('[iohook-macos] JavaScript: Native startMonitoring completed');
        
        // Start JavaScript polling
        this.startPolling();
        this._isMonitoring = true;
        
        console.log('[iohook-macos] JavaScript: Listening for events...');
    }

    // Stop monitoring
    stopMonitoring() {
        console.log('[iohook-macos] JavaScript: stopMonitoring called');
        
        this.stopPolling();
        this._isMonitoring = false;
        
        // Stop native monitoring
        nativeModule.stopMonitoring();
        console.log('[iohook-macos] JavaScript: Native stopMonitoring completed');
    }

    // Check if monitoring is currently active
    isMonitoring() {
        return this._isMonitoring;
    }

    // Get current queue size
    getQueueSize() {
        return nativeModule.getQueueSize();
    }
    
    // Clear event queue
    clearQueue() {
        return nativeModule.clearQueue();
    }
    
    // Get next event manually (for custom polling)
    getNextEvent() {
        return nativeModule.getNextEvent();
    }

    // Check accessibility permissions
    checkAccessibilityPermissions() {
        console.log('[iohook-macos] JavaScript: Accessibility permissions check:', nativeModule.checkAccessibilityPermissions());
        return nativeModule.checkAccessibilityPermissions();
    }

    // Performance controls
    enablePerformanceMode() {
        console.log('[iohook-macos] JavaScript: Performance mode enabled - Optimized for high-frequency events');
        return nativeModule.enablePerformanceMode();
    }

    disablePerformanceMode() {
        console.log('[iohook-macos] JavaScript: Performance mode disabled - Full logging restored');
        return nativeModule.disablePerformanceMode();
    }

    setMouseMoveThrottling(intervalMs) {
        console.log(`[iohook-macos] JavaScript: Mouse move throttling set to ${intervalMs}ms`);
        return nativeModule.setMouseMoveThrottling(intervalMs);
    }

    setVerboseLogging(enable) {
        console.log(`[iohook-macos] JavaScript: Verbose logging ${enable ? 'enabled' : 'disabled'}`);
        return nativeModule.setVerboseLogging(enable);
    }

    // Event filtering
    setEventFilter(options) {
        return nativeModule.setEventFilter(options);
    }

    clearEventFilter() {
        return nativeModule.clearEventFilter();
    }

    // Event modification
    enableEventModification() {
        return nativeModule.enableEventModification();
    }

    disableEventModification() {
        return nativeModule.disableEventModification();
    }
}

// Create singleton instance
const instance = new MacOSEventHook();
console.log('[iohook-macos] Singleton instance created and ready');

module.exports = instance; 