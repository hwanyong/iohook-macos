**[AI Prompt Start]**  
This document is the PRD, Planning, and Design document for macos-event-hook-library, which aims to hook and control macOS system events within Electron applications. As an AI, you must thoroughly understand the project's vision, goals, features, technology stack, risks, and the architecture and API design based on this document.  
**Development Capabilities:**

* Able to implement precise hooking, modification, and consumption functionalities for keyboard, mouse, scroll, and gesture events using macOS's CGEventTap API in C++ (Objective-C++).  
* Capable of building efficient data exchange and function call interfaces between JavaScript and C++ using N-API.  
* Able to design and implement an intuitive and extensible JavaScript API using the Node.js EventEmitter pattern.  
* Proficient in using node-gyp and electron-rebuild for optimizing native module builds and managing compatibility within the Electron environment.  
* Understands macOS Accessibility permission requirements and can implement appropriate handling and guidance logic.  
* Capable of designing and applying filtering logic based on event-originating process IDs and window IDs.  
* Able to consider performance optimization and stability measures when handling high-frequency events.

**Development Direction:**

* Strictly adhere to the development phases (MVP, Stabilization & Expansion, Documentation & Deployment) and milestones specified in the document.  
* Provide a safe monitoring mode by default, with event modification/consumption features designed to be explicitly enabled by the developer.  
* Prioritize performance, security, and compatibility throughout the development process.  
* Aim to deliver high-quality code, a clear API, and comprehensive documentation to ensure ease of use for other developers.  
* Maintain a flexible architecture with future expandability in mind, such as advanced hardware control via IOKit.  
* Continuously identify potential risks (permission issues, OS/Electron compatibility) and apply mitigation strategies.

This document serves as the core guideline for all stages of library development.  
**[AI Prompt End]**

# **macOS Event Hook Library Development Document**

## **1. Product Requirements Document (PRD)**

### **1.1. Product Vision and Goals**

* **Vision**: To provide a high-performance library that enables Electron developers to precisely control macOS system keyboard and mouse events, facilitating the implementation of innovative user experiences and advanced functionalities.  
* **Goals**:  
  * Accurately detect and deliver all macOS keyboard (down/up), mouse click (down/up), and mouse pointer movement events.  
  * Offer optional event modification and consumption capabilities to extend developer control.  
  * Ensure stable and compatible operation within the Electron environment.  
  * Maximize developer usability through intuitive APIs and comprehensive documentation.  
  * Provide clear guidance on macOS Accessibility permission requirements.

### **1.2. Target Users**

* Electron application developers  
* macOS desktop app developers requiring system-level input control  
* Developers of productivity tools, games, and accessibility tools

### **1.3. Key Features**

* **Keyboard Event Hooking**:  
  * keyDown (Key Press): Detect key code and modifier key (Shift, Control, Option, Command) information.  
  * keyUp (Key Release): Detect key code and modifier key information.  
* **Mouse Event Hooking**:  
  * leftMouseDown, rightMouseDown, otherMouseDown (Click): Detect mouse button and pointer position information.  
  * leftMouseUp, rightMouseUp, otherMouseUp (Click Release): Detect mouse button and pointer position information.  
  * mouseMoved (Mouse Movement): Detect real-time pointer position (X, Y coordinates).  
  * mouseDragged (Mouse Drag): Detect real-time pointer position information.  
* **Scroll and Gesture Event Hooking**:  
  * scrollWheel (Scroll Wheel): Detect scroll direction and magnitude information.  
  * Trackpad Gestures: Detect relevant information for gestures like pinch-to-zoom and rotation.  
* **Event Filtering**:  
  * Ability to selectively monitor or ignore events based on specific process IDs or window IDs.  
* **Event Data Delivery**:  
  * Real-time delivery of structured event data via JavaScript EventEmitter.  
* **Monitoring Control**:  
  * APIs for activating (startMonitoring) and deactivating (stopMonitoring) library functionalities.  
* **Event Modification and Consumption (Optional Activation)**:  
  * Functionality to modify hooked keyboard and mouse events or prevent their propagation to the system (consume).  
  * Disabled by default, controlled explicitly via dedicated APIs (enableModificationAndConsumption, disableModificationAndConsumption).

### **1.4. Non-Functional Requirements**

* **Performance**: Minimize system resource consumption and ensure low-latency event processing even with high-frequency events.  
* **Security**: Adhere to macOS security and privacy policies, and clearly handle Accessibility permission requirements.  
* **Compatibility**:  
  * **OS**: Support macOS 10.15 (Catalina) and later versions.  
  * **Electron**: Compatibility with the latest Electron LTS versions and ensured compatibility through electron-rebuild.  
  * **Architecture**: Support both Intel (x64) and Apple Silicon (arm64) architectures.  
* **Usability**: Provide intuitive JavaScript APIs and comprehensive documentation.  
* **Stability**: Implement robust error handling for exceptional cases such as missing permissions or event tap creation failures.

### **1.5. Success Metrics**

* Increase in monthly npm downloads.  
* Growth in GitHub Stars and Issue/Pull Request activity.  
* Positive feedback from the developer community (usability, stability).  
* Adoption of the library in major Electron applications.

## **2. Planning**

### **2.1. Scope**

* **Included**:  
  * Hooking of keyboard, mouse click, mouse movement, scroll wheel, and trackpad gesture events using macOS Core Graphics (CGEventTap).  
  * Implementation of Node.js Native Addon (N-API).  
  * JavaScript wrapper API for the Electron Main Process (EventEmitter pattern).  
  * Build system setup using node-gyp and electron-rebuild.  
  * Accessibility permission checking and error message handling.  
  * package.json and README.md for npm deployment.  
  * Event modification and consumption functionality (optional activation).  
  * Event filtering based on specific process/window IDs.  
  * Support for scroll wheel and trackpad gestures.  
* **Excluded**:  
  * Support for operating systems other than macOS (Windows, Linux).

### **2.2. Development Phases and Milestones**

* **Phase 1: Core Feature Development (MVP)**  
  * Implement basic keyboard (keyDown/keyUp) and mouse (leftMouseDown/leftMouseUp, mouseMoved) event hooking using CGEventTap.  
  * Connect Node.js wrapper and JavaScript EventEmitter via N-API.  
  * Set up node-gyp build and conduct local Electron app integration testing.  
  * Add Accessibility permission checking logic.  
  * **Milestone**: Confirm accurate delivery of all core events to the Electron Main Process.  
* **Phase 2: Stabilization and Expansion**  
  * Add additional mouse buttons (rightMouseDown/rightMouseUp, otherMouseDown/otherMouseUp) event support.  
  * Standardize event data structure and expand fields (e.g., processId, windowId, timestamp, clickCount, deltaX/Y/Z).  
  * Enhance robustness for error handling and edge cases.  
  * Integrate electron-rebuild and test builds for Intel/Apple Silicon architectures.  
  * **Implement Event Modification and Consumption**:  
    * Create CGEventTap in the C++ layer with kCGEventTapOptionDefault to allow event modification/consumption.  
    * Control event consumption/modification state via JavaScript APIs (enableModificationAndConsumption, disableModificationAndConsumption).  
    * Add preventDefault() method and modifiable properties to the JavaScript event object to pass consumption status to C++.  
    * Implement event modification by changing event object properties.  
  * **Implement Scroll Wheel and Trackpad Gesture Event Hooking.**  
  * **Implement Event Filtering based on specific process/window IDs.**  
  * **Milestone**: Confirm stable operation across various Electron/macOS environments, with all extended functionalities (event modification/consumption, scroll/gestures, filtering) working.  
* **Phase 3: Documentation and Deployment**  
  * Write comprehensive README.md (installation, usage, API, permission guide, troubleshooting).  
  * Finalize package.json settings and prepare for npm deployment.  
  * Deploy to npm registry.  
  * **Milestone**: npm deployment of the library and provision of easily usable documentation for other developers.

### **2.3. Technology Stack**

* **Native Language**: Objective-C++ (.mm files)  
* **Node.js Native Addon Interface**: N-API (npm package: node-addon-api)  
* **Build System**: node-gyp  
* **Electron Compatibility**: electron-rebuild  
* **Node.js Wrapper**: JavaScript (including EventEmitter)  
* **macOS Frameworks**: Core Graphics (CGEventTap), ApplicationServices, Foundation

### **2.4. Risk Assessment**

* **Accessibility Permission Issues**:  
  * **Risk**: Library functionality may not work if the user does not grant permissions.  
  * **Mitigation**: Provide clear guidance, permission checking API, and user-friendly error messages.  
* **macOS Version Compatibility**:  
  * **Risk**: Compatibility issues due to native API changes with macOS updates.  
  * **Mitigation**: Continuous testing, support for the latest macOS versions, and community feedback integration.  
* **Electron Version Compatibility**:  
  * **Risk**: Native module compatibility issues due to Node.js runtime changes with Electron updates.  
  * **Mitigation**: Recommend electron-rebuild usage, test compatibility with major Electron LTS versions.  
* **Performance Degradation**:  
  * **Risk**: Impact on Electron app performance when handling high-frequency events.  
  * **Mitigation**: Event filtering in the C++ layer, data conversion optimization, consideration of throttling/debouncing options.  
* **Build Complexity**:  
  * **Risk**: Difficulty in setting up the native module build environment.  
  * **Mitigation**: Provide clear documentation for node-gyp and electron-rebuild usage, test in common build environments.

### **2.5. Future Considerations**

* Animations or visual feedback when enabling/disabling event hooks.  
* Advanced hardware event control using lower-level IOKit (increased complexity, e.g., support for fully programmable keyboards like ErgoDox).

## **3. Design**

### **3.1. Architecture Overview**

```  
graph TD  
    A[macOS Core Graphics: System Events] --> B(C++ Native Module: EventHook.mm)  
    B -- Extracts & Modifies Event Data --> C(Node.js Wrapper: index.js)  
    C -- Emits Events via EventEmitter --> D(Electron Main Process: main.js)  
    D -- IPC Communication --> E(Electron Renderer Process: UI)

    subgraph User Interaction  
        E -- User Input --> A  
    end

    subgraph Control Flow  
        E -- Commands (start/stop/enable/disable) --> D  
        D -- Calls Native Module API --> C  
        C -- Controls CGEventTap Options --> B  
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px  
    style B fill:#bbf,stroke:#333,stroke-width:2px  
    style C fill:#bfb,stroke:#333,stroke-width:2px  
    style D fill:#ffb,stroke:#333,stroke-width:2px  
    style E fill:#ccf,stroke:#333,stroke-width:2px  
```

* **macOS Core Graphics**: Manages and generates keyboard and mouse events at the system level.  
* **C++ Native Module (EventHook.mm)**: Hooks events directly from Core Graphics using the CGEventTap API. Extracts event data and calls the JavaScript emit function of Node.js to deliver events. When event modification or consumption is enabled, it implements the logic to modify CGEventRef or return NULL.  
* **Node.js Wrapper (index.js)**: Manages events by inheriting from or creating an instance of Node.js's EventEmitter. Requires the C++ native module and passes the EventEmitter's emit function to it, allowing C++ to emit events directly. Exposes JavaScript APIs such as startMonitoring, stopMonitoring, enableModificationAndConsumption, and disableModificationAndConsumption.  
* **Electron Main Process (main.js)**: Loads the Node.js wrapper and calls startMonitoring to initiate event hooking. Registers listeners on the EventEmitter instance to receive events and forwards them to the Renderer Process via ipcMain if needed.  
* **Electron Renderer Process (UI)**: Receives events from the Main Process via ipcRenderer and updates the UI or provides feedback to the user accordingly.

### **3.2. API Design**

The JavaScript API exposed by the library (index.js) is as follows:  
```  
// macos-event-hook-library/index.js (Proposed API)  
const EventEmitter = require('events');  
const nativeEventHook = require('node-gyp-build')(__dirname); // Load C++ module

class MacOSEventHook extends EventEmitter {  
  constructor() {  
    super();  
    this.isMonitoring = false;  
    this.isModificationEnabled = false; // State for event modification/consumption feature

    // Pass this EventEmitter's 'emit' function to the C++ module,  
    // enabling the C++ module to emit events directly.  
    // Configure N-API to allow calling JavaScript functions from C++.  
    nativeEventHook.setEmitFunction((type, eventData) => {  
      // Add a preventDefault method to the JavaScript event object  
      eventData.preventDefault = () => {  
        eventData._isConsumed = true; // Set internal flag  
      };  
      // Add modifiable properties to the JavaScript event object (e.g., keyCode, x, y)  
      // C++ will read these properties to modify the original CGEventRef.

      this.emit(type, eventData); // Emit event via EventEmitter

      // Return whether the event was consumed by JavaScript listeners to C++  
      return eventData._isConsumed === true;  
    });  
  }

  /**  
   * Starts monitoring macOS system events.  
   * By default, events are only observed, and consumption/modification is disabled.  
   * @throws {Error} If Accessibility permission is not granted or event tap creation fails.  
   * @returns {MacOSEventHook} This EventEmitter instance.  
   */  
  startMonitoring() {  
    if (this.isMonitoring) {  
      console.warn('Monitoring is already active.');  
      return this;  
    }  
    try {  
      // Pass the current monitoring mode (listen-only or default) to the C++ layer  
      nativeEventHook.startMonitoring(this.isModificationEnabled);  
      this.isMonitoring = true;  
      console.log('macOS event monitoring started.');  
      return this;  
    } catch (error) {  
      this.isMonitoring = false;  
      console.error('Failed to start macOS event monitoring:', error.message);  
      throw error; // Re-throw error for caller to handle  
    }  
  }

  /**  
   * Stops monitoring macOS system events.  
   */  
  stopMonitoring() {  
    if (!this.isMonitoring) {  
      console.warn('Monitoring is not active.');  
      return;  
    }  
    nativeEventHook.stopMonitoring();  
    this.isMonitoring = false;  
    console.log('macOS event monitoring stopped.');  
  }

  /**  
   * Enables event modification and consumption functionality.  
   * When enabled, the library can modify events or prevent their propagation to the system.  
   * This feature is powerful and should be used with caution.  
   * If monitoring is already active, it must be restarted for changes to apply.  
   */  
  enableModificationAndConsumption() {  
    if (this.isModificationEnabled) {  
      console.warn('Event modification and consumption is already enabled.');  
      return;  
    }  
    this.isModificationEnabled = true;  
    console.log('Event modification and consumption enabled. Restart monitoring to apply.');  
    // Optionally, monitoring could be automatically restarted here,  
    // but allowing the developer explicit control might be safer.  
  }

  /**  
   * Disables event modification and consumption functionality.  
   * The library reverts to an observe-only mode for events.  
   * If monitoring is already active, it must be restarted for changes to apply.  
   */  
  disableModificationAndConsumption() {  
    if (!this.isModificationEnabled) {  
      console.warn('Event modification and consumption is already disabled.');  
      return;  
    }  
    this.isModificationEnabled = false;  
    console.log('Event modification and consumption disabled. Restart monitoring to apply.');  
  }  
}

module.exports = new MacOSEventHook(); // Provide a singleton instance  
```

**C++ Native Module (EventHook.mm) Changes (Conceptual):**

* setEmitFunction receives the JavaScript emit function and passes event data when calling it.  
* startMonitoring function accepts the isModificationEnabled flag from JavaScript as an argument, dynamically selecting kCGEventTapOptionListenOnly or kCGEventTapOptionDefault when calling CGEventTapCreate.  
* myEventTapCallback function, after calling the JavaScript emit function, checks the _isConsumed flag set in the eventData object to decide whether to return NULL for CGEventRef.  
* For event modification, myEventTapCallback reads the modified properties (e.g., keyCode, x, y) from the JavaScript eventData object, uses functions like CGEventSetIntegerValueField, CGEventSetLocation to modify the original CGEventRef, and returns the modified CGEventRef.

**Event Data Structure (Object passed to JavaScript callback):**  
```
{  
  "type": "keyDown", // or "keyUp", "leftMouseDown", "mouseMoved", etc. (Used as event name in EventEmitter)  
  "keyCode": 36,     // For keyboard events (e.g., Enter key)  
  "modifiers": {  
    "shift": false,  
    "control": false,  
    "option": false,  
    "command": false  
  },  
  "button": 0,       // For mouse click events (0: Left, 1: Right, 2: Other)  
  "x": 123.45,       // X coordinate of the mouse pointer  
  "y": 678.90,       // Y coordinate of the mouse pointer  
  "processId": 12345, // ID of the process where the event originated  
  "windowId": 67890,  // ID of the window where the event originated  
  "timestamp": 1678886400000, // Event occurrence time (milliseconds Unix timestamp)  
  "clickCount": 1,   // For mouse click events, number of clicks (single, double, triple click)  
  "deltaX": 0,       // For scroll wheel events, X-axis scroll change  
  "deltaY": 1,       // For scroll wheel events, Y-axis scroll change  
  "deltaZ": 0,       // For scroll wheel events, Z-axis scroll change (e.g., trackpad pinch/zoom)  
  // _isConsumed: boolean (Internal flag, set to true when preventDefault() is called)  
  // preventDefault: function (Method to consume the event)  
}  
```

* type: CGEventType converted to a string, used as the event name in EventEmitter.  
* keyCode: CGKeyCode value. **(Modifiable)**  
* modifiers: Object representing the boolean state of each modifier key, parsed from CGEventFlags.  
* button: CGMouseButton value.  
* x, y: Screen coordinates of the mouse pointer, extracted from CGPoint. **(Modifiable)**  
* processId: Process ID of the application where the event originated. Obtainable via CGEventGetIntegerValueField(event, kCGEventTargetUnixProcessID).  
* windowId: ID of the window where the event originated. Obtainable via CGEventGetIntegerValueField(event, kCGEventTargetWindowID).  
* timestamp: Time of event occurrence. Obtainable via CGEventGetTimestamp(event), converted to an appropriate timestamp format (e.g., milliseconds Unix timestamp).  
* clickCount: For mouse click events, the number of clicks (e.g., single click, double click). Obtainable via CGEventGetIntegerValueField(event, kCGMouseEventClickState).  
* deltaX, deltaY, deltaZ: For scroll wheel events, the scroll change amount. Obtainable via CGEventGetDoubleValueField. deltaZ can be related to trackpad pinch/zoom gestures.  
* preventDefault(): Calling this method prevents the event from propagating further to the system.

### **3.3. Error Handling Strategy**

* **Accessibility Permission Not Granted**:  
  * When startMonitoring is called, check permissions with AXIsProcessTrustedWithOptions(NULL). If not granted, throw a JavaScript Error to prompt the user to grant permissions.  
  * Include the permission setting path in the error message for user convenience.  
* **CGEventTapCreate Failure**:  
  * If event tap creation fails, throw a JavaScript Error indicating the cause of failure.  
* **Memory Management**:  
  * In the C++ native module, explicitly release Core Foundation objects like CFMachPortRef and CFRunLoopSourceRef using CFRelease(). Handle this in the stopMonitoring function.  
  * Use Napi::Persistent for the JavaScript emit function to prevent garbage collection and Reset() to release it appropriately.

### **3.4. Build Process**

1. **Developer Environment**:  
   * Xcode installation (including macOS SDK, Command Line Tools).  
   * Node.js and npm installation.  
   * Python 3 installation (node-gyp requirement).  
2. **npm install**:  
   * node-gyp will run automatically via the "install": "node-gyp rebuild" script in package.json.  
   * node-gyp reads binding.gyp to compile src/EventHook.mm and generate the .node file.  
3. **Electron App Integration**:  
   * Add macos-event-hook-library as a dependency in the Electron app's package.json.  
   * Before building the Electron app, run electron-rebuild to ensure the native module is recompiled for the Electron Node.js runtime (crucial for distribution).

### **3.5. Deployment Strategy**

* **npm Registry**:  
  * Deploy the library to the npm registry using the npm publish command.  
  * Ensure accurate population of essential fields in package.json such as name, version, description, main, keywords, repository, author, and license.  
* **Documentation**:  
  * Include a detailed README.md in the GitHub repository.  
  * Clearly explain installation, API usage, macOS Accessibility permission setup guide, troubleshooting tips, and contribution guidelines.  
* **Version Control**:  
  * Manage versions following Semantic Versioning (SemVer) rules (MAJOR.MINOR.PATCH).  
  * Update versions based on breaking changes (MAJOR), new features (MINOR), and bug fixes (PATCH).  
* **Continuous Maintenance**:  
  * Test compatibility and update as needed with new macOS and Electron versions.  
  * Integrate community feedback for bug fixes and feature enhancements.

This document provides comprehensive guidelines for the development of the macOS Event Hook Library and can be referenced at each stage of the development process.