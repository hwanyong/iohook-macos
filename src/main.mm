#include <napi.h>
#include <iostream>
#include <CoreFoundation/CoreFoundation.h>
#include <Foundation/Foundation.h>
#include <CoreGraphics/CoreGraphics.h>
#include <ApplicationServices/ApplicationServices.h>
#include <pthread.h>
#include <queue>
#include <mutex>

// Simple event data structure for polling
struct SimpleEvent {
    int eventType;  // Changed from eventName(string) to eventType(int) - CGEventType value
    double x, y;
    double timestamp;
    uint32_t processId;
    uint16_t keyCode;
    bool hasKeyCode;
    uint64_t flags;  // Modifier flags for flagsChanged events
    bool hasFlags;
};

// Thread-safe event queue
std::queue<SimpleEvent> eventQueue;
std::mutex queueMutex;
const size_t MAX_QUEUE_SIZE = 1000; // Prevent memory overflow

using namespace Napi;

// Global variables
CFMachPortRef eventTap = NULL;
CFRunLoopSourceRef runLoopSource = NULL;
pthread_t eventThread;
bool isMonitoring = false;
bool shouldStopThread = false;

// Performance configuration
struct PerformanceConfig {
    bool enablePerformanceMode = false;
    bool enableMouseMoveThrottling = false;
    double mouseMoveThrottleInterval = 0.016; // ~60fps
    bool enableVerboseLogging = true;
    double lastMouseMoveTime = 0;
    bool skipMouseMoveInPerformanceMode = false;
} performanceConfig;

// Event filtering configuration  
struct EventFilterConfig {
    bool enabled = false;
    bool filterByProcessId = false;
    bool excludeProcessId = false; // true = exclude, false = include only
    uint32_t targetProcessId = 0;
    
    bool filterByCoordinates = false;
    double minX = 0, maxX = 0, minY = 0, maxY = 0;
    
    bool filterByEventType = false;
    bool allowKeyboard = true;
    bool allowMouse = true;
    bool allowScroll = true;
} eventFilter;

// Event modification settings
bool isModificationEnabled = false;

// Event callback function
CGEventRef eventTapCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon) {
    // Skip processing if emit function is not available to prevent crashes
    // if (!emitFunction) { // This line is removed as per the edit hint
    //     return event;
    // }
    
    // Rate limiting for high-frequency events to prevent ThreadSafeFunction overload
    static double lastProcessTime = 0;
    static int eventsSinceLastSecond = 0;
    static double lastSecondMark = 0;
    
    double currentTime = CFAbsoluteTimeGetCurrent();
    
    // Reset counter every second
    if (currentTime - lastSecondMark > 1.0) {
        lastSecondMark = currentTime;
        eventsSinceLastSecond = 0;
    }
    
    eventsSinceLastSecond++;
    
    // Limit to 1000 events per second to prevent ThreadSafeFunction overload
    if (eventsSinceLastSecond > 1000) {
        if (performanceConfig.enableVerboseLogging) {
            std::cout << "[iohook-macos] Rate limit exceeded, dropping event" << std::endl;
        }
        return event;
    }
    
    // Performance optimization and filtering for mouse move events
    if (type == kCGEventMouseMoved) {
        // Throttle mouse move events
        if (performanceConfig.enableMouseMoveThrottling) {
            double currentTime = CFAbsoluteTimeGetCurrent();
            if (currentTime - performanceConfig.lastMouseMoveTime < performanceConfig.mouseMoveThrottleInterval) {
                return event; // Skip this mouse move event due to throttling
            }
            performanceConfig.lastMouseMoveTime = currentTime;
        }
        
        // Performance mode: optionally skip mouse move events entirely
        if (performanceConfig.enablePerformanceMode && performanceConfig.skipMouseMoveInPerformanceMode) {
            return event;
        }
    }
    
    // Check if this is a supported event type
    bool isSupportedEvent = (type == kCGEventKeyDown || type == kCGEventKeyUp ||
                           type == kCGEventFlagsChanged ||
                           type == kCGEventLeftMouseDown || type == kCGEventLeftMouseUp ||
                           type == kCGEventRightMouseDown || type == kCGEventRightMouseUp ||
                           type == kCGEventMouseMoved || type == kCGEventLeftMouseDragged ||
                           type == kCGEventRightMouseDragged || type == kCGEventScrollWheel ||
                           type == kCGEventOtherMouseDown || type == kCGEventOtherMouseUp ||
                           type == kCGEventOtherMouseDragged || type == kCGEventTabletPointer ||
                           type == kCGEventTabletProximity);
    
    if (!isSupportedEvent) {
        return event; // Ignore unsupported events
    }
    
    // Log detected events to console (C++ side) - only if verbose logging is enabled
    if (performanceConfig.enableVerboseLogging) {
        std::cout << "[iohook-macos] Event detected - CGEventType: " << type << std::endl;
    }
    
    // Apply event filtering if enabled
    if (eventFilter.enabled) {
        // Get event data for filtering
        CGPoint location = CGEventGetLocation(event);
        int64_t processId = CGEventGetIntegerValueField(event, kCGEventTargetUnixProcessID);
        
        // Process ID filtering
        if (eventFilter.filterByProcessId) {
            if (eventFilter.excludeProcessId) {
                // Exclude events from target process
                if (processId == eventFilter.targetProcessId) {
                    if (performanceConfig.enableVerboseLogging) {
                        std::cout << "[iohook-macos] Event filtered out (excluded process: " << processId << ")" << std::endl;
                    }
                    return event; // Pass through without processing
                }
            } else {
                // Include only events from target process
                if (processId != eventFilter.targetProcessId) {
                    if (performanceConfig.enableVerboseLogging) {
                        std::cout << "[iohook-macos] Event filtered out (process not matching: " << processId << ")" << std::endl;
                    }
                    return event; // Pass through without processing
                }
            }
        }
        
        // Coordinate filtering
        if (eventFilter.filterByCoordinates) {
            if (location.x < eventFilter.minX || location.x > eventFilter.maxX ||
                location.y < eventFilter.minY || location.y > eventFilter.maxY) {
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Event filtered out (outside coordinate range: " 
                              << location.x << ", " << location.y << ")" << std::endl;
                }
                return event; // Pass through without processing
            }
        }
        
        // Event type filtering
        if (eventFilter.filterByEventType) {
            bool isKeyboard = (type == kCGEventKeyDown || type == kCGEventKeyUp || type == kCGEventFlagsChanged);
            bool isMouse = (type >= kCGEventLeftMouseDown && type <= kCGEventRightMouseDragged);
            bool isScroll = (type == kCGEventScrollWheel);
            
            if ((isKeyboard && !eventFilter.allowKeyboard) ||
                (isMouse && !eventFilter.allowMouse) ||
                (isScroll && !eventFilter.allowScroll)) {
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Event filtered out (event type not allowed: " << type << ")" << std::endl;
                }
                return event; // Pass through without processing
            }
        }
        
        if (performanceConfig.enableVerboseLogging) {
            std::cout << "[iohook-macos] Event passed filtering checks" << std::endl;
        }
    }
    
    // Send event to JavaScript queue (safe polling approach)
    // Extract essential data
    CGPoint location = CGEventGetLocation(event);
    double eventX = location.x;
    double eventY = location.y;
    uint32_t eventProcessId = (uint32_t)CGEventGetIntegerValueField(event, kCGEventTargetUnixProcessID);
    uint16_t eventKeyCode = 0;
    bool hasKeyCode = false;
    uint64_t eventFlags = 0;
    bool hasFlags = false;
    
    // Extract keycode for keyboard events
    if (type == kCGEventKeyDown || type == kCGEventKeyUp) {
        if (event) {
            hasKeyCode = true;
            int64_t rawKeyCode = CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
            eventKeyCode = (rawKeyCode >= 0 && rawKeyCode <= UINT16_MAX) ? (uint16_t)rawKeyCode : 0;
        }
    }
    
    // Extract flags for flagsChanged events
    if (type == kCGEventFlagsChanged) {
        if (event) {
            hasFlags = true;
            eventFlags = (uint64_t)CGEventGetFlags(event);
        }
    }
    
    // Add to queue safely
    std::lock_guard<std::mutex> lock(queueMutex);
    
    // Prevent queue overflow
    if (eventQueue.size() >= MAX_QUEUE_SIZE) {
        eventQueue.pop(); // Remove oldest event
    }
    
    // Add new event
    SimpleEvent newEvent;
    newEvent.eventType = (int)type;  // Use CGEventType int value directly
    newEvent.x = eventX;
    newEvent.y = eventY;
    newEvent.timestamp = CFAbsoluteTimeGetCurrent();
    newEvent.processId = eventProcessId;
    newEvent.keyCode = eventKeyCode;
    newEvent.hasKeyCode = hasKeyCode;
    newEvent.flags = eventFlags;
    newEvent.hasFlags = hasFlags;
    
    eventQueue.push(newEvent);
    
    if (performanceConfig.enableVerboseLogging) {
        std::cout << "[iohook-macos] Event queued: CGEventType " << type 
                  << " (Queue size: " << eventQueue.size() << ")" << std::endl;
    }
    
    // Return the event unmodified (passthrough mode)
    return event;
}

// Background thread function for running CFRunLoop
void* eventThreadFunction(void* arg) {
    std::cout << "[iohook-macos] Event thread started" << std::endl;
    
    // Get the current run loop for this thread
    CFRunLoopRef eventRunLoop = CFRunLoopGetCurrent();
    
    // Add the event tap source to this thread's run loop
    CFRunLoopAddSource(eventRunLoop, runLoopSource, kCFRunLoopCommonModes);
    
    std::cout << "[iohook-macos] CFRunLoop source added to background thread" << std::endl;
    
    // Run the event loop on this background thread
    while (!shouldStopThread) {
        // Run the run loop for a short time to allow for periodic checking
        CFRunLoopRunInMode(kCFRunLoopDefaultMode, 0.1, false);
    }
    
    std::cout << "[iohook-macos] Event thread stopping" << std::endl;
    
    // Clean up
    if (runLoopSource && eventRunLoop) {
        CFRunLoopRemoveSource(eventRunLoop, runLoopSource, kCFRunLoopCommonModes);
    }
    
    return NULL;
}

// Get next event from queue (for JavaScript polling)
Napi::Value GetNextEvent(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    std::lock_guard<std::mutex> lock(queueMutex);
    
    if (eventQueue.empty()) {
        return env.Null();
    }
    
    // Get the oldest event
    SimpleEvent event = eventQueue.front();
    eventQueue.pop();
    
    // Create JavaScript object
    Napi::Object eventObj = Napi::Object::New(env);
    eventObj.Set("type", Napi::Number::New(env, event.eventType));  // Return CGEventType int value
    eventObj.Set("x", Napi::Number::New(env, event.x));
    eventObj.Set("y", Napi::Number::New(env, event.y));
    eventObj.Set("timestamp", Napi::Number::New(env, event.timestamp));
    eventObj.Set("processId", Napi::Number::New(env, event.processId));
    
    if (event.hasKeyCode) {
        eventObj.Set("keyCode", Napi::Number::New(env, event.keyCode));
    }
    
    if (event.hasFlags) {
        eventObj.Set("flags", Napi::Number::New(env, event.flags));
    }
    
    return eventObj;
}

// Get queue size for monitoring
Napi::Value GetQueueSize(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    std::lock_guard<std::mutex> lock(queueMutex);
    return Napi::Number::New(env, eventQueue.size());
}

// Clear event queue
Napi::Value ClearQueue(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    std::lock_guard<std::mutex> lock(queueMutex);
    std::queue<SimpleEvent> empty;
    std::swap(eventQueue, empty);
    
    std::cout << "[iohook-macos] Event queue cleared" << std::endl;
    return env.Undefined();
}

// Set JavaScript emit function (legacy placeholder - not needed for polling)
Napi::Value SetEmitFunction(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // For polling approach, this function is not needed
    // Just return success for compatibility
    std::cout << "[iohook-macos] JavaScript emit function set (polling mode - not used)" << std::endl;
    return env.Undefined();
}

// Basic monitoring functions
Napi::Value StartMonitoring(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (isMonitoring) {
        std::cout << "[iohook-macos] Monitoring is already active" << std::endl;
        return env.Undefined();
    }
    
    // Check if accessibility permissions are granted
    if (!AXIsProcessTrusted()) {
        std::cout << "[iohook-macos] ERROR: Accessibility permissions not granted!" << std::endl;
        std::cout << "[iohook-macos] Please enable accessibility permissions in System Preferences" << std::endl;
        Napi::Error::New(env, "Accessibility permissions required").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    // Create event tap for keyboard, mouse, and scroll events
    CGEventMask eventMask = CGEventMaskBit(kCGEventKeyDown) |
                           CGEventMaskBit(kCGEventKeyUp) |
                           CGEventMaskBit(kCGEventFlagsChanged) |
                           CGEventMaskBit(kCGEventLeftMouseDown) |
                           CGEventMaskBit(kCGEventLeftMouseUp) |
                           CGEventMaskBit(kCGEventRightMouseDown) |
                           CGEventMaskBit(kCGEventRightMouseUp) |
                           CGEventMaskBit(kCGEventMouseMoved) |
                           CGEventMaskBit(kCGEventLeftMouseDragged) |
                           CGEventMaskBit(kCGEventRightMouseDragged) |
                           CGEventMaskBit(kCGEventScrollWheel) |
                           CGEventMaskBit(kCGEventOtherMouseDown) |
                           CGEventMaskBit(kCGEventOtherMouseUp) |
                           CGEventMaskBit(kCGEventOtherMouseDragged) |
                           CGEventMaskBit(kCGEventTabletPointer) |
                           CGEventMaskBit(kCGEventTabletProximity);
    
    eventTap = CGEventTapCreate(kCGSessionEventTap,
                               kCGHeadInsertEventTap,
                               isModificationEnabled ? kCGEventTapOptionDefault : kCGEventTapOptionListenOnly,
                               eventMask,
                               eventTapCallback,
                               NULL);
    
    if (!eventTap) {
        std::cout << "[iohook-macos] ERROR: Failed to create event tap!" << std::endl;
        Napi::Error::New(env, "Failed to create event tap").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    // Create run loop source
    runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0);
    CGEventTapEnable(eventTap, true);
    
    // Start background thread for CFRunLoop
    shouldStopThread = false;
    int threadResult = pthread_create(&eventThread, NULL, eventThreadFunction, NULL);
    
    if (threadResult != 0) {
        std::cout << "[iohook-macos] ERROR: Failed to create event thread!" << std::endl;
        
        // Clean up
        CGEventTapEnable(eventTap, false);
        CFRelease(eventTap);
        CFRelease(runLoopSource);
        eventTap = NULL;
        runLoopSource = NULL;
        
        Napi::Error::New(env, "Failed to create event thread").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    isMonitoring = true;
    std::cout << "[iohook-macos] Event monitoring started successfully with background thread!" << std::endl;
    
    return env.Undefined();
}

Napi::Value StopMonitoring(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!isMonitoring) {
        std::cout << "[iohook-macos] Monitoring is not active" << std::endl;
        return env.Undefined();
    }
    
    // Stop the background thread
    shouldStopThread = true;
    
    // Wait for thread to finish
    int joinResult = pthread_join(eventThread, NULL);
    if (joinResult != 0) {
        std::cout << "[iohook-macos] Warning: Thread did not join cleanly" << std::endl;
    }
    
    // Clean up event tap and run loop source
    if (eventTap) {
        CGEventTapEnable(eventTap, false);
        CFRelease(eventTap);
    }
    
    if (runLoopSource) {
        CFRelease(runLoopSource);
    }
    
    eventTap = NULL;
    runLoopSource = NULL;
    
    // Clear event queue
    {
        std::lock_guard<std::mutex> lock(queueMutex);
        std::queue<SimpleEvent> empty;
        std::swap(eventQueue, empty);
    }
    
    isMonitoring = false;
    std::cout << "[iohook-macos] Event monitoring stopped successfully" << std::endl;
    
    return env.Undefined();
}

Napi::Value IsMonitoring(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, isMonitoring);
}

// Enable event modification and consumption
Napi::Value EnableModificationAndConsumption(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (isModificationEnabled) {
        std::cout << "[iohook-macos] Event modification and consumption is already enabled" << std::endl;
        return env.Undefined();
    }
    
    isModificationEnabled = true;
    std::cout << "[iohook-macos] Event modification and consumption enabled" << std::endl;
    
    if (isMonitoring) {
        std::cout << "[iohook-macos] WARNING: Restart monitoring to apply changes" << std::endl;
    }
    
    return env.Undefined();
}

// Disable event modification and consumption
Napi::Value DisableModificationAndConsumption(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (!isModificationEnabled) {
        std::cout << "[iohook-macos] Event modification and consumption is already disabled" << std::endl;
        return env.Undefined();
    }
    
    isModificationEnabled = false;
    std::cout << "[iohook-macos] Event modification and consumption disabled" << std::endl;
    
    if (isMonitoring) {
        std::cout << "[iohook-macos] WARNING: Restart monitoring to apply changes" << std::endl;
    }
    
    return env.Undefined();
}

// Set process ID filter
Napi::Value SetProcessFilter(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsBoolean()) {
        Napi::TypeError::New(env, "Expected arguments: processId (number), exclude (boolean)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    int64_t processId = info[0].As<Napi::Number>().Int64Value();
    bool exclude = info[1].As<Napi::Boolean>().Value();
    
    eventFilter.filterByProcessId = true;
    eventFilter.targetProcessId = processId;
    eventFilter.excludeProcessId = exclude;
    eventFilter.enabled = true;
    
    std::cout << "[iohook-macos] Process filter set - Target: " << processId 
              << " (Mode: " << (exclude ? "EXCLUDE" : "INCLUDE") << ")" << std::endl;
    
    return env.Undefined();
}

// Set coordinate range filter
Napi::Value SetCoordinateFilter(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() || 
        !info[2].IsNumber() || !info[3].IsNumber()) {
        Napi::TypeError::New(env, "Expected arguments: minX, minY, maxX, maxY (all numbers)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    double minX = info[0].As<Napi::Number>().DoubleValue();
    double minY = info[1].As<Napi::Number>().DoubleValue();
    double maxX = info[2].As<Napi::Number>().DoubleValue();
    double maxY = info[3].As<Napi::Number>().DoubleValue();
    
    eventFilter.filterByCoordinates = true;
    eventFilter.minX = minX;
    eventFilter.minY = minY;
    eventFilter.maxX = maxX;
    eventFilter.maxY = maxY;
    eventFilter.enabled = true;
    
    std::cout << "[iohook-macos] Coordinate filter set - Range: (" << minX << ", " << minY 
              << ") to (" << maxX << ", " << maxY << ")" << std::endl;
    
    return env.Undefined();
}

// Set event type filter
Napi::Value SetEventTypeFilter(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 3 || !info[0].IsBoolean() || !info[1].IsBoolean() || !info[2].IsBoolean()) {
        Napi::TypeError::New(env, "Expected arguments: allowKeyboard, allowMouse, allowScroll (all booleans)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    bool allowKeyboard = info[0].As<Napi::Boolean>().Value();
    bool allowMouse = info[1].As<Napi::Boolean>().Value();
    bool allowScroll = info[2].As<Napi::Boolean>().Value();
    
    eventFilter.filterByEventType = true;
    eventFilter.allowKeyboard = allowKeyboard;
    eventFilter.allowMouse = allowMouse;
    eventFilter.allowScroll = allowScroll;
    eventFilter.enabled = true;
    
    std::cout << "[iohook-macos] Event type filter set - Keyboard: " << (allowKeyboard ? "YES" : "NO")
              << ", Mouse: " << (allowMouse ? "YES" : "NO") 
              << ", Scroll: " << (allowScroll ? "YES" : "NO") << std::endl;
    
    return env.Undefined();
}

// Clear all filters
Napi::Value ClearFilters(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    eventFilter.enabled = false;
    eventFilter.filterByProcessId = false;
    eventFilter.filterByCoordinates = false;
    eventFilter.filterByEventType = false;
    
    std::cout << "[iohook-macos] All event filters cleared" << std::endl;
    
    return env.Undefined();
}

// Enable performance mode
Napi::Value EnablePerformanceMode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    performanceConfig.enablePerformanceMode = true;
    performanceConfig.enableVerboseLogging = false; // Disable verbose logging in performance mode
    performanceConfig.enableMouseMoveThrottling = true; // Enable mouse move throttling
    performanceConfig.skipMouseMoveInPerformanceMode = false; // Don't skip, just throttle
    
    std::cout << "[iohook-macos] Performance mode enabled - Reduced logging, mouse move throttling active" << std::endl;
    
    return env.Undefined();
}

// Disable performance mode
Napi::Value DisablePerformanceMode(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    performanceConfig.enablePerformanceMode = false;
    performanceConfig.enableVerboseLogging = true; // Re-enable verbose logging
    performanceConfig.enableMouseMoveThrottling = false; // Disable throttling
    performanceConfig.skipMouseMoveInPerformanceMode = false;
    
    std::cout << "[iohook-macos] Performance mode disabled - Full logging and events restored" << std::endl;
    
    return env.Undefined();
}

// Set mouse move throttling
Napi::Value SetMouseMoveThrottling(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected argument: intervalMs (number)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    double intervalMs = info[0].As<Napi::Number>().DoubleValue();
    
    performanceConfig.enableMouseMoveThrottling = true;
    performanceConfig.mouseMoveThrottleInterval = intervalMs / 1000.0; // Convert ms to seconds
    
    std::cout << "[iohook-macos] Mouse move throttling enabled with interval: " << intervalMs << "ms" << std::endl;
    
    return env.Undefined();
}

// Set verbose logging
Napi::Value SetVerboseLogging(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Expected argument: enabled (boolean)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    bool enabled = info[0].As<Napi::Boolean>().Value();
    performanceConfig.enableVerboseLogging = enabled;
    
    std::cout << "[iohook-macos] Verbose logging " << (enabled ? "enabled" : "disabled") << std::endl;
    
    return env.Undefined();
}

// Check accessibility permissions
Napi::Value CheckAccessibilityPermissions(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    bool hasPermissions = AXIsProcessTrusted();
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("hasPermissions", Napi::Boolean::New(env, hasPermissions));
    
    if (!hasPermissions) {
        result.Set("message", Napi::String::New(env, 
            "Accessibility permissions required. Please go to System Preferences > Security & Privacy > Privacy > Accessibility and enable this application."));
    } else {
        result.Set("message", Napi::String::New(env, "Accessibility permissions are granted."));
    }
    
    std::cout << "[iohook-macos] Accessibility permissions check: " << (hasPermissions ? "GRANTED" : "DENIED") << std::endl;
    
    return result;
}

// Request accessibility permissions with dialog
Napi::Value RequestAccessibilityPermissions(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // Create options dictionary to prompt user
    CFStringRef keys[] = { kAXTrustedCheckOptionPrompt };
    CFBooleanRef values[] = { kCFBooleanTrue };
    CFDictionaryRef options = CFDictionaryCreate(
        kCFAllocatorDefault,
        (const void**)keys,
        (const void**)values,
        1,
        &kCFTypeDictionaryKeyCallBacks,
        &kCFTypeDictionaryValueCallBacks
    );
    
    bool hasPermissions = AXIsProcessTrustedWithOptions(options);
    CFRelease(options);
    
    Napi::Object result = Napi::Object::New(env);
    result.Set("hasPermissions", Napi::Boolean::New(env, hasPermissions));
    
    if (!hasPermissions) {
        result.Set("message", Napi::String::New(env, 
            "Permission dialog displayed. Please grant accessibility permissions and try again."));
        std::cout << "[iohook-macos] Accessibility permission dialog displayed" << std::endl;
    } else {
        result.Set("message", Napi::String::New(env, "Accessibility permissions are already granted."));
        std::cout << "[iohook-macos] Accessibility permissions already granted" << std::endl;
    }
    
    return result;
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    std::cout << "[iohook-macos] Native module initializing..." << std::endl;
    
    exports.Set(Napi::String::New(env, "startMonitoring"), 
                Napi::Function::New(env, StartMonitoring));
    exports.Set(Napi::String::New(env, "stopMonitoring"), 
                Napi::Function::New(env, StopMonitoring));
    exports.Set(Napi::String::New(env, "isMonitoring"), 
                Napi::Function::New(env, IsMonitoring));
    exports.Set(Napi::String::New(env, "setEmitFunction"), 
                Napi::Function::New(env, SetEmitFunction));
    exports.Set(Napi::String::New(env, "checkAccessibilityPermissions"), 
                Napi::Function::New(env, CheckAccessibilityPermissions));
    exports.Set(Napi::String::New(env, "requestAccessibilityPermissions"), 
                Napi::Function::New(env, RequestAccessibilityPermissions));
    exports.Set(Napi::String::New(env, "enableModificationAndConsumption"), 
                Napi::Function::New(env, EnableModificationAndConsumption));
    exports.Set(Napi::String::New(env, "disableModificationAndConsumption"), 
                Napi::Function::New(env, DisableModificationAndConsumption));
    exports.Set(Napi::String::New(env, "setProcessFilter"), 
                Napi::Function::New(env, SetProcessFilter));
    exports.Set(Napi::String::New(env, "setCoordinateFilter"), 
                Napi::Function::New(env, SetCoordinateFilter));
    exports.Set(Napi::String::New(env, "setEventTypeFilter"), 
                Napi::Function::New(env, SetEventTypeFilter));
    exports.Set(Napi::String::New(env, "clearFilters"), 
                Napi::Function::New(env, ClearFilters));
    exports.Set(Napi::String::New(env, "enablePerformanceMode"), 
                Napi::Function::New(env, EnablePerformanceMode));
    exports.Set(Napi::String::New(env, "disablePerformanceMode"), 
                Napi::Function::New(env, DisablePerformanceMode));
    exports.Set(Napi::String::New(env, "setMouseMoveThrottling"), 
                Napi::Function::New(env, SetMouseMoveThrottling));
    exports.Set(Napi::String::New(env, "setVerboseLogging"), 
                Napi::Function::New(env, SetVerboseLogging));
    exports.Set(Napi::String::New(env, "getNextEvent"), 
                Napi::Function::New(env, GetNextEvent));
    exports.Set(Napi::String::New(env, "getQueueSize"), 
                Napi::Function::New(env, GetQueueSize));
    exports.Set(Napi::String::New(env, "clearQueue"), 
                Napi::Function::New(env, ClearQueue));
    
    std::cout << "[iohook-macos] Native module initialized successfully" << std::endl;
    return exports;
}

NODE_API_MODULE(addon, Init);
