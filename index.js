const EventEmitter = require('events');
const path = require('path');

// Load the native module using node-gyp-build for better binary distribution
const loadNativeModule = () => {
    // Try node-gyp-build first
    const nodeGypResult = tryRequireModule(() => require('node-gyp-build')(path.join(__dirname)));
    if (nodeGypResult.success) {
        console.log('[iohook-macos] Native module loaded successfully via node-gyp-build');
        return nodeGypResult;
    }
    
    console.log('[iohook-macos] node-gyp-build failed, trying fallback paths...');
    console.log('[iohook-macos] Error:', nodeGypResult.error);
    
    // Try multiple fallback paths
    const fallbackPaths = [
        './build/Release/iohook-macos.node',
        './prebuilds/darwin-arm64/iohook-macos.node',
        './prebuilds/darwin-x64/iohook-macos.node'
    ];
    
    for (const fallbackPath of fallbackPaths) {
        const fallbackResult = tryRequireModule(() => require(fallbackPath));
        if (fallbackResult.success) {
            console.log(`[iohook-macos] Native module loaded via fallback path: ${fallbackPath}`);
            return fallbackResult;
        }
        console.log(`[iohook-macos] Failed to load from ${fallbackPath}`);
    }
    
    console.error('[iohook-macos] All fallback paths failed');
    console.error('[iohook-macos] Platform:', process.platform);
    console.error('[iohook-macos] Architecture:', process.arch);
    console.error('[iohook-macos] Node version:', process.version);
    
    return {
        success: false,
        error: 'Native module could not be loaded. ' +
               'This package requires macOS (darwin) and may need to be rebuilt. ' +
               'Try running: npm run rebuild',
        module: null
    };
};

const tryRequireModule = (requireFn) => {
    const result = { success: false, error: null, module: null };
    
    const moduleOrError = safeExecute(requireFn);
    if (moduleOrError.error) {
        result.error = moduleOrError.error.message;
        return result;
    }
    
    result.success = true;
    result.module = moduleOrError.value;
    return result;
};

const safeExecute = (fn) => {
    const returnValue = { error: null, value: null };
    
    // Minimal try-catch for require() which can throw
    let hasError = false;
    let errorObj = null;
    let valueObj = null;
    
    try {
        valueObj = fn();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        returnValue.error = errorObj;
        return returnValue;
    }
    
    returnValue.value = valueObj;
    return returnValue;
};

const moduleLoadResult = loadNativeModule();
if (!moduleLoadResult.success) {
    // Instead of throwing, we could return error object, but for module loading we must fail
    // This is acceptable as it's at module initialization time
    const error = new Error(moduleLoadResult.error);
    error.loadAttempt = moduleLoadResult;
    throw error;
}

const nativeModule = moduleLoadResult.module;

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
        
        // Early return if not monitoring
        if (!this._isMonitoring) return;
        
        // Restart polling if already running
        this.stopPolling();
        this.startPolling();
    }
    
    // Start event polling
    startPolling() {
        // Early return if already polling
        if (this.pollingInterval) return;
        
        this.pollingInterval = setInterval(() => {
            this._processEventQueue();
        }, this.pollingRate);
        
        console.log(`[iohook-macos] Polling started at ${this.pollingRate}ms intervals`);
    }
    
    // Process event queue (extracted for clarity)
    _processEventQueue() {
        let event;
        let eventCount = 0;
        const maxEventsPerPoll = 50; // Prevent blocking
        
        while ((event = nativeModule.getNextEvent()) && eventCount < maxEventsPerPoll) {
            this._emitEvent(event);
            eventCount++;
        }
        
        // Log only if we hit the limit
        if (eventCount >= maxEventsPerPoll) {
            console.log(`[iohook-macos] Processed ${eventCount} events in one poll cycle`);
        }
    }
    
    // Emit event with multiple formats (extracted for clarity)
    _emitEvent(event) {
        // event.type is now an int (CGEventType value)
        const eventTypeInt = event.type;
        const eventTypeString = CGEventTypes[eventTypeInt] || "unknown";
        
        // Emit with both int and string for user convenience
        this.emit(eventTypeInt, event);        // For users who want to use int
        this.emit(eventTypeString, event);     // For users who want to use string
        this.emit('event', event);             // Generic event for all types
    }
    
    // Stop event polling
    stopPolling() {
        // Early return if not polling
        if (!this.pollingInterval) return;
        
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
        console.log('[iohook-macos] Polling stopped');
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

    // Request accessibility permissions (opens system dialog)
    requestAccessibilityPermissions() {
        return nativeModule.requestAccessibilityPermissions();
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
        // Early return if no options
        if (!options) return;
        
        // Early return pattern for each filter type
        if (options.filterByProcessId) {
            nativeModule.setProcessFilter(
                options.targetProcessId,
                options.excludeProcessId || false
            );
        }
        
        if (options.filterByCoordinates) {
            nativeModule.setCoordinateFilter(
                options.minX, options.minY,
                options.maxX, options.maxY
            );
        }
        
        if (options.filterByEventType) {
            nativeModule.setEventTypeFilter(
                options.allowKeyboard != false,
                options.allowMouse != false,
                options.allowScroll != false
            );
        }
    }

    // Direct native filter methods
    setProcessFilter(processId, exclude) {
        return nativeModule.setProcessFilter(processId, exclude);
    }

    setCoordinateFilter(minX, minY, maxX, maxY) {
        return nativeModule.setCoordinateFilter(minX, minY, maxX, maxY);
    }

    setEventTypeFilter(allowKeyboard, allowMouse, allowScroll) {
        return nativeModule.setEventTypeFilter(allowKeyboard, allowMouse, allowScroll);
    }

    // Rename for consistency with native module
    clearFilters() {
        return nativeModule.clearFilters();
    }

    // Backward compatibility alias
    clearEventFilter() {
        return this.clearFilters();
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