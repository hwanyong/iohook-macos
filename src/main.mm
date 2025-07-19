#include <napi.h>
#include <iostream>
#include <CoreGraphics/CoreGraphics.h>
#include <ApplicationServices/ApplicationServices.h>
#include <pthread.h>

using namespace Napi;

// Global variables for event tap
CFMachPortRef eventTap = NULL;
CFRunLoopSourceRef runLoopSource = NULL;
CFRunLoopRef eventRunLoop = NULL;
pthread_t eventThread;
bool isMonitoring = false;
bool shouldStopThread = false;
bool isModificationEnabled = false; // New flag for modification/consumption

// Performance optimization settings
struct PerformanceConfig {
    bool enablePerformanceMode = false;
    bool enableVerboseLogging = true;
    
    // Event throttling
    bool enableMouseMoveThrottling = false;
    double mouseMoveThrottleInterval = 0.016; // ~60fps (16ms)
    double lastMouseMoveTime = 0;
    
    // Event filtering for performance
    bool skipMouseMoveInPerformanceMode = false;
    
    // Memory optimization
    bool reuseEventDataObjects = false;
} performanceConfig;

// Event filtering configuration
struct EventFilter {
    bool enabled = false;
    
    // Process filtering
    bool filterByProcessId = false;
    int64_t targetProcessId = 0;
    bool excludeProcessId = false; // If true, exclude the target process; if false, include only the target
    
    // Coordinate filtering
    bool filterByCoordinates = false;
    double minX = 0, minY = 0, maxX = 0, maxY = 0;
    
    // Event type filtering
    bool filterByEventType = false;
    bool allowKeyboard = true;
    bool allowMouse = true;
    bool allowScroll = true;
} eventFilter;

// JavaScript emit function reference
Napi::ThreadSafeFunction emitFunction;

// Event data structure for passing to JavaScript
struct EventData {
    std::string eventName;
    double timestamp;
    double x, y;
    int64_t processId;
    
    // Keyboard data
    uint16_t keyCode;
    bool hasKeyCode;
    bool shiftKey, controlKey, optionKey, commandKey, functionKey;
    
    // Mouse data
    uint32_t button;
    int64_t clickCount;
    double pressure;
    bool hasMouseData;
    
    // Scroll data
    int64_t deltaX, deltaY, deltaZ;
    int64_t fixedPtDeltaY;
    bool hasScrollData;
    
    // Event modification/consumption
    bool isConsumed = false;
    bool isModified = false;
    
    // Modified values (only used if isModified is true)
    uint16_t modifiedKeyCode;
    double modifiedX, modifiedY;
    
    // Additional hardware data
    bool hasOtherMouseData = false;
    uint32_t otherMouseButton; // Button number for additional mouse buttons
    
    // Tablet/stylus data
    bool hasTabletData = false;
    double tabletPressure;
    double tabletTiltX, tabletTiltY;
    double tabletRotation;
    uint32_t tabletDeviceID;
    bool isTabletPointerEvent = false;
    bool isTabletProximityEvent = false;
    
    // Advanced mouse features
    double mouseAcceleration;
    uint32_t mouseSubtype; // For distinguishing different mouse types
};

// Event callback function
CGEventRef eventTapCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon) {
    // Log detected events to console (C++ side) - only if verbose logging is enabled
    const char* eventName = nullptr;
    
    switch (type) {
        case kCGEventKeyDown:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Key Down detected!" << std::endl;
            eventName = "keyDown";
            break;
        case kCGEventKeyUp:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Key Up detected!" << std::endl;
            eventName = "keyUp";
            break;
        case kCGEventLeftMouseDown:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Left Mouse Down detected!" << std::endl;
            eventName = "leftMouseDown";
            break;
        case kCGEventLeftMouseUp:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Left Mouse Up detected!" << std::endl;
            eventName = "leftMouseUp";
            break;
        case kCGEventRightMouseDown:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Right Mouse Down detected!" << std::endl;
            eventName = "rightMouseDown";
            break;
        case kCGEventRightMouseUp:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Right Mouse Up detected!" << std::endl;
            eventName = "rightMouseUp";
            break;
        case kCGEventMouseMoved:
            // Performance optimization: throttle mouse move events
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
            
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Mouse Moved detected!" << std::endl;
            eventName = "mouseMoved";
            break;
        case kCGEventLeftMouseDragged:
        case kCGEventRightMouseDragged:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Mouse Dragged detected!" << std::endl;
            eventName = "mouseDragged";
            break;
        case kCGEventScrollWheel:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Scroll Wheel detected!" << std::endl;
            eventName = "scrollWheel";
            break;
        case kCGEventOtherMouseDown:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Other Mouse Down detected!" << std::endl;
            eventName = "otherMouseDown";
            break;
        case kCGEventOtherMouseUp:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Other Mouse Up detected!" << std::endl;
            eventName = "otherMouseUp";
            break;
        case kCGEventOtherMouseDragged:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Other Mouse Dragged detected!" << std::endl;
            eventName = "otherMouseDragged";
            break;
        case kCGEventTabletPointer:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Tablet Pointer detected!" << std::endl;
            eventName = "tabletPointer";
            break;
        case kCGEventTabletProximity:
            if (performanceConfig.enableVerboseLogging) std::cout << "[iohook-macos] Tablet Proximity detected!" << std::endl;
            eventName = "tabletProximity";
            break;
        default:
            // Ignore other events for now
            return event;
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
            bool isKeyboard = (type == kCGEventKeyDown || type == kCGEventKeyUp);
            bool isMouse = (type >= kCGEventLeftMouseDown && type <= kCGEventRightMouseDragged);
            bool isScroll = (type == kCGEventScrollWheel);
            
            if ((isKeyboard && !eventFilter.allowKeyboard) ||
                (isMouse && !eventFilter.allowMouse) ||
                (isScroll && !eventFilter.allowScroll)) {
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Event filtered out (event type not allowed: " << eventName << ")" << std::endl;
                }
                return event; // Pass through without processing
            }
        }
        
        if (performanceConfig.enableVerboseLogging) {
            std::cout << "[iohook-macos] Event passed filtering checks" << std::endl;
        }
    }
    
    // Send event to JavaScript if emit function is available
    if (emitFunction && eventName) {
        // Extract all event data first
        EventData* eventData = new EventData();
        eventData->eventName = eventName;
        eventData->timestamp = CFAbsoluteTimeGetCurrent();
        
        // Get event location
        CGPoint location = CGEventGetLocation(event);
        eventData->x = location.x;
        eventData->y = location.y;
        
        // Get process info
        eventData->processId = CGEventGetIntegerValueField(event, kCGEventTargetUnixProcessID);
        
        CGEventType eventType = CGEventGetType(event);
        
        // Extract keyboard-specific data
        eventData->hasKeyCode = false;
        if (eventType == kCGEventKeyDown || eventType == kCGEventKeyUp) {
            // Safely check if event is valid before extracting data
            if (event) {
                eventData->hasKeyCode = true;
                
                // Safely extract keycode with bounds checking
                int64_t rawKeyCode = CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
                eventData->keyCode = (rawKeyCode >= 0 && rawKeyCode <= UINT16_MAX) ? (uint16_t)rawKeyCode : 0;
                
                // Safely extract flags
                CGEventFlags flags = CGEventGetFlags(event);
                eventData->shiftKey = (flags & kCGEventFlagMaskShift) != 0;
                eventData->controlKey = (flags & kCGEventFlagMaskControl) != 0;
                eventData->optionKey = (flags & kCGEventFlagMaskAlternate) != 0;
                eventData->commandKey = (flags & kCGEventFlagMaskCommand) != 0;
                eventData->functionKey = (flags & kCGEventFlagMaskSecondaryFn) != 0;
                
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Keyboard event - Key: " << eventData->keyCode 
                              << ", Flags: " << flags << std::endl;
                }
            } else {
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Warning: Invalid keyboard event pointer" << std::endl;
                }
            }
        }
        
        // Extract mouse-specific data
        eventData->hasMouseData = false;
        if (eventType >= kCGEventLeftMouseDown && eventType <= kCGEventRightMouseDragged) {
            eventData->hasMouseData = true;
            eventData->button = (uint32_t)CGEventGetIntegerValueField(event, kCGMouseEventButtonNumber);
            eventData->clickCount = CGEventGetIntegerValueField(event, kCGMouseEventClickState);
            eventData->pressure = CGEventGetDoubleValueField(event, kCGMouseEventPressure);
        }
        
        // Extract scroll wheel data
        eventData->hasScrollData = false;
        if (eventType == kCGEventScrollWheel) {
            eventData->hasScrollData = true;
            eventData->deltaX = CGEventGetIntegerValueField(event, kCGScrollWheelEventDeltaAxis2);
            eventData->deltaY = CGEventGetIntegerValueField(event, kCGScrollWheelEventDeltaAxis1);
            eventData->deltaZ = CGEventGetIntegerValueField(event, kCGScrollWheelEventDeltaAxis3);
            eventData->fixedPtDeltaY = CGEventGetIntegerValueField(event, kCGScrollWheelEventFixedPtDeltaAxis1);
        }
        
        // Extract additional mouse button data
        eventData->hasOtherMouseData = false;
        if (eventType == kCGEventOtherMouseDown || eventType == kCGEventOtherMouseUp || eventType == kCGEventOtherMouseDragged) {
            eventData->hasOtherMouseData = true;
            eventData->otherMouseButton = (uint32_t)CGEventGetIntegerValueField(event, kCGMouseEventButtonNumber);
            
            // Extract additional mouse properties
            eventData->mouseSubtype = (uint32_t)CGEventGetIntegerValueField(event, kCGMouseEventSubtype);
            
            if (performanceConfig.enableVerboseLogging) {
                std::cout << "[iohook-macos] Other mouse button: " << eventData->otherMouseButton 
                          << " (Subtype: " << eventData->mouseSubtype << ")" << std::endl;
            }
        }
        
        // Extract tablet/stylus data
        eventData->hasTabletData = false;
        if (eventType == kCGEventTabletPointer || eventType == kCGEventTabletProximity) {
            eventData->hasTabletData = true;
            eventData->isTabletPointerEvent = (eventType == kCGEventTabletPointer);
            eventData->isTabletProximityEvent = (eventType == kCGEventTabletProximity);
            
            if (eventType == kCGEventTabletPointer) {
                // Use basic pressure field that's commonly available
                eventData->tabletPressure = CGEventGetDoubleValueField(event, kCGMouseEventPressure);
                
                // For tilt and rotation, use placeholder values for now
                eventData->tabletTiltX = 0.0;
                eventData->tabletTiltY = 0.0; 
                eventData->tabletRotation = 0.0;
                eventData->tabletDeviceID = 0;
                
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Tablet pointer - Pressure: " << eventData->tabletPressure << std::endl;
                }
            } else if (eventType == kCGEventTabletProximity) {
                eventData->tabletDeviceID = 0; // Placeholder
                
                if (performanceConfig.enableVerboseLogging) {
                    std::cout << "[iohook-macos] Tablet proximity detected" << std::endl;
                }
            }
        }
        
        // Send to JavaScript
        auto callback = [](Napi::Env env, Napi::Function jsCallback, EventData* data) {
            // Create comprehensive event data object
            Napi::Object eventDataObj = Napi::Object::New(env);
            
            // Basic event info
            eventDataObj.Set("type", Napi::String::New(env, data->eventName));
            eventDataObj.Set("timestamp", Napi::Number::New(env, data->timestamp));
            eventDataObj.Set("x", Napi::Number::New(env, data->x));
            eventDataObj.Set("y", Napi::Number::New(env, data->y));
            eventDataObj.Set("processId", Napi::Number::New(env, data->processId));
            eventDataObj.Set("windowId", Napi::Number::New(env, 0)); // Placeholder
            
            // Add preventDefault method
            auto preventDefaultCallback = [data](const Napi::CallbackInfo& info) -> Napi::Value {
                data->isConsumed = true;
                return info.Env().Undefined();
            };
            eventDataObj.Set("preventDefault", Napi::Function::New(env, preventDefaultCallback));
            
            // Keyboard-specific data
            if (data->hasKeyCode) {
                eventDataObj.Set("keyCode", Napi::Number::New(env, data->keyCode));
                eventDataObj.Set("shiftKey", Napi::Boolean::New(env, data->shiftKey));
                eventDataObj.Set("controlKey", Napi::Boolean::New(env, data->controlKey));
                eventDataObj.Set("optionKey", Napi::Boolean::New(env, data->optionKey));
                eventDataObj.Set("commandKey", Napi::Boolean::New(env, data->commandKey));
                eventDataObj.Set("functionKey", Napi::Boolean::New(env, data->functionKey));
                
                // Set modifiers as a combined value for compatibility
                uint32_t modifiers = 0;
                if (data->shiftKey) modifiers |= 1;
                if (data->controlKey) modifiers |= 2;
                if (data->optionKey) modifiers |= 4;
                if (data->commandKey) modifiers |= 8;
                if (data->functionKey) modifiers |= 16;
                eventDataObj.Set("modifiers", Napi::Number::New(env, modifiers));
            }
            
            // Mouse-specific data
            if (data->hasMouseData) {
                eventDataObj.Set("button", Napi::Number::New(env, data->button));
                eventDataObj.Set("clickCount", Napi::Number::New(env, data->clickCount));
                eventDataObj.Set("pressure", Napi::Number::New(env, data->pressure));
            }
            
            // Scroll wheel specific data
            if (data->hasScrollData) {
                eventDataObj.Set("deltaX", Napi::Number::New(env, data->deltaX));
                eventDataObj.Set("deltaY", Napi::Number::New(env, data->deltaY));
                eventDataObj.Set("deltaZ", Napi::Number::New(env, data->deltaZ));
                eventDataObj.Set("fixedPtDeltaY", Napi::Number::New(env, data->fixedPtDeltaY));
            }
            
            // Additional mouse button data
            if (data->hasOtherMouseData) {
                eventDataObj.Set("otherMouseButton", Napi::Number::New(env, data->otherMouseButton));
                eventDataObj.Set("mouseSubtype", Napi::Number::New(env, data->mouseSubtype));
            }
            
            // Tablet/stylus data
            if (data->hasTabletData) {
                Napi::Object tabletData = Napi::Object::New(env);
                tabletData.Set("isPointerEvent", Napi::Boolean::New(env, data->isTabletPointerEvent));
                tabletData.Set("isProximityEvent", Napi::Boolean::New(env, data->isTabletProximityEvent));
                tabletData.Set("deviceID", Napi::Number::New(env, data->tabletDeviceID));
                
                if (data->isTabletPointerEvent) {
                    tabletData.Set("pressure", Napi::Number::New(env, data->tabletPressure));
                    tabletData.Set("tiltX", Napi::Number::New(env, data->tabletTiltX));
                    tabletData.Set("tiltY", Napi::Number::New(env, data->tabletTiltY));
                    tabletData.Set("rotation", Napi::Number::New(env, data->tabletRotation));
                }
                
                eventDataObj.Set("tablet", tabletData);
            }
            
            // Call JavaScript emit function
            jsCallback.Call({
                Napi::String::New(env, data->eventName),
                eventDataObj
            });
            
            if (performanceConfig.enableVerboseLogging) {
                std::cout << "[iohook-macos] Event processed - Consumed: " << (data->isConsumed ? "YES" : "NO") 
                          << ", Modified: " << (data->isModified ? "YES" : "NO") << std::endl;
            }
            
            // Check if event data was modified by JavaScript
            if (data->hasKeyCode) {
                Napi::Value newKeyCode = eventDataObj.Get("keyCode");
                if (newKeyCode.IsNumber() && newKeyCode.As<Napi::Number>().Uint32Value() != data->keyCode) {
                    data->isModified = true;
                    data->modifiedKeyCode = newKeyCode.As<Napi::Number>().Uint32Value();
                }
            }
            
            Napi::Value newX = eventDataObj.Get("x");
            Napi::Value newY = eventDataObj.Get("y");
            if (newX.IsNumber() && newX.As<Napi::Number>().DoubleValue() != data->x) {
                data->isModified = true;
                data->modifiedX = newX.As<Napi::Number>().DoubleValue();
            }
            if (newY.IsNumber() && newY.As<Napi::Number>().DoubleValue() != data->y) {
                data->isModified = true;
                data->modifiedY = newY.As<Napi::Number>().DoubleValue();
            }
            
            // Clean up memory at the end of callback
            delete data;
        };
        
        // Store event data values before callback (since callback will delete eventData)
        bool wasConsumed = false;
        bool wasModified = false;
        uint16_t modifiedKeyCode = 0;
        double modifiedX = 0, modifiedY = 0;
        bool hasKeyCode = eventData->hasKeyCode;
        uint16_t originalKeyCode = eventData->keyCode;
        double originalX = eventData->x;
        double originalY = eventData->y;
        
        // Safely call JavaScript function with error handling
        try {
            emitFunction.BlockingCall(eventData, callback);
            
            // eventData is now deleted by callback, don't access it anymore
            // Instead, we need to get the modified values from somewhere else
            // For now, we'll disable modification/consumption until we fix the architecture
            
        } catch (const std::exception& e) {
            if (performanceConfig.enableVerboseLogging) {
                std::cout << "[iohook-macos] Error in JavaScript callback: " << e.what() << std::endl;
            }
            delete eventData; // Clean up on error
            return event;
        } catch (...) {
            if (performanceConfig.enableVerboseLogging) {
                std::cout << "[iohook-macos] Unknown error in JavaScript callback" << std::endl;
            }
            delete eventData; // Clean up on error
            return event;
        }
        
        // Since eventData is deleted, we can't check modification/consumption status
        // This needs architectural changes to work properly
        // For now, just return the original event
    }
    
    // Return the event unmodified (passthrough mode)
    return event;
}

// Background thread function for running CFRunLoop
void* eventThreadFunction(void* arg) {
    std::cout << "[iohook-macos] Event thread started" << std::endl;
    
    // Get the current run loop (this will be the run loop for this thread)
    eventRunLoop = CFRunLoopGetCurrent();
    
    // Add the event tap source to this thread's run loop
    CFRunLoopAddSource(eventRunLoop, runLoopSource, kCFRunLoopCommonModes);
    
    std::cout << "[iohook-macos] CFRunLoop source added to background thread" << std::endl;
    
    // Run the event loop
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

// Set JavaScript emit function
Napi::Value SetEmitFunction(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Expected a function as first argument").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    // Create thread-safe function for calling JavaScript from C++
    emitFunction = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(),
        "EventEmitter",
        0,
        1
    );
    
    std::cout << "[iohook-macos] JavaScript emit function set successfully" << std::endl;
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
        eventTap = NULL;
    }
    
    if (runLoopSource) {
        CFRelease(runLoopSource);
        runLoopSource = NULL;
    }
    
    eventRunLoop = NULL;
    
    // Release JavaScript emit function
    if (emitFunction) {
        emitFunction.Release();
    }
    
    isMonitoring = false;
    std::cout << "[iohook-macos] Event monitoring stopped" << std::endl;
    
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
    
    if (info.Length() < 2 || !info[0].IsBoolean() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected arguments: enabled (boolean), intervalMs (number)").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    
    bool enabled = info[0].As<Napi::Boolean>().Value();
    double intervalMs = info[1].As<Napi::Number>().DoubleValue();
    
    performanceConfig.enableMouseMoveThrottling = enabled;
    performanceConfig.mouseMoveThrottleInterval = intervalMs / 1000.0; // Convert ms to seconds
    
    std::cout << "[iohook-macos] Mouse move throttling set - Enabled: " << (enabled ? "YES" : "NO")
              << ", Interval: " << intervalMs << "ms" << std::endl;
    
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
    
    std::cout << "[iohook-macos] Native module initialized successfully" << std::endl;
    return exports;
}

NODE_API_MODULE(addon, Init);
