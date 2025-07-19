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
};

// Event callback function
CGEventRef eventTapCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon) {
    // Log detected events to console (C++ side)
    const char* eventName = nullptr;
    
    switch (type) {
        case kCGEventKeyDown:
            std::cout << "[iohook-macos] Key Down detected!" << std::endl;
            eventName = "keyDown";
            break;
        case kCGEventKeyUp:
            std::cout << "[iohook-macos] Key Up detected!" << std::endl;
            eventName = "keyUp";
            break;
        case kCGEventLeftMouseDown:
            std::cout << "[iohook-macos] Left Mouse Down detected!" << std::endl;
            eventName = "leftMouseDown";
            break;
        case kCGEventLeftMouseUp:
            std::cout << "[iohook-macos] Left Mouse Up detected!" << std::endl;
            eventName = "leftMouseUp";
            break;
        case kCGEventRightMouseDown:
            std::cout << "[iohook-macos] Right Mouse Down detected!" << std::endl;
            eventName = "rightMouseDown";
            break;
        case kCGEventRightMouseUp:
            std::cout << "[iohook-macos] Right Mouse Up detected!" << std::endl;
            eventName = "rightMouseUp";
            break;
        case kCGEventMouseMoved:
            std::cout << "[iohook-macos] Mouse Moved detected!" << std::endl;
            eventName = "mouseMoved";
            break;
        case kCGEventLeftMouseDragged:
        case kCGEventRightMouseDragged:
            std::cout << "[iohook-macos] Mouse Dragged detected!" << std::endl;
            eventName = "mouseDragged";
            break;
        case kCGEventScrollWheel:
            std::cout << "[iohook-macos] Scroll Wheel detected!" << std::endl;
            eventName = "scrollWheel";
            break;
        default:
            // Ignore other events for now
            return event;
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
            eventData->hasKeyCode = true;
            eventData->keyCode = (uint16_t)CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
            
            CGEventFlags flags = CGEventGetFlags(event);
            eventData->shiftKey = flags & kCGEventFlagMaskShift;
            eventData->controlKey = flags & kCGEventFlagMaskControl;
            eventData->optionKey = flags & kCGEventFlagMaskAlternate;
            eventData->commandKey = flags & kCGEventFlagMaskCommand;
            eventData->functionKey = flags & kCGEventFlagMaskSecondaryFn;
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
            
            // Keyboard-specific data
            if (data->hasKeyCode) {
                eventDataObj.Set("keyCode", Napi::Number::New(env, data->keyCode));
                
                Napi::Object modifiers = Napi::Object::New(env);
                modifiers.Set("shift", Napi::Boolean::New(env, data->shiftKey));
                modifiers.Set("control", Napi::Boolean::New(env, data->controlKey));
                modifiers.Set("option", Napi::Boolean::New(env, data->optionKey));
                modifiers.Set("command", Napi::Boolean::New(env, data->commandKey));
                modifiers.Set("function", Napi::Boolean::New(env, data->functionKey));
                eventDataObj.Set("modifiers", modifiers);
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
            
            // Call JavaScript emit function
            jsCallback.Call({
                Napi::String::New(env, data->eventName),
                eventDataObj
            });
            
            std::cout << "[iohook-macos] Detailed event sent to JavaScript: " << data->eventName << std::endl;
            
            // Clean up
            delete data;
        };
        
        emitFunction.BlockingCall(eventData, callback);
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
                           CGEventMaskBit(kCGEventScrollWheel);
    
    eventTap = CGEventTapCreate(kCGSessionEventTap,
                               kCGHeadInsertEventTap,
                               kCGEventTapOptionListenOnly,
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
    
    std::cout << "[iohook-macos] Native module initialized successfully" << std::endl;
    return exports;
}

NODE_API_MODULE(addon, Init);
