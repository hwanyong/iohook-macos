import { EventEmitter } from 'events'

// CGEventType to String mapping (from index.js)
export interface CGEventTypesMap {
  readonly 0: "null"
  readonly 1: "leftMouseDown"
  readonly 2: "leftMouseUp"
  readonly 3: "rightMouseDown"
  readonly 4: "rightMouseUp"
  readonly 5: "mouseMoved"
  readonly 6: "leftMouseDragged"
  readonly 7: "rightMouseDragged"
  readonly 10: "keyDown"
  readonly 11: "keyUp"
  readonly 12: "flagsChanged"
  readonly 22: "scrollWheel"
  readonly 23: "tabletPointer"
  readonly 24: "tabletProximity"
  readonly 25: "otherMouseDown"
  readonly 26: "otherMouseUp"
  readonly 27: "otherMouseDragged"
}

// Reverse mapping (string to int)
export interface EventTypeToIntMap {
  readonly null: 0
  readonly leftMouseDown: 1
  readonly leftMouseUp: 2
  readonly rightMouseDown: 3
  readonly rightMouseUp: 4
  readonly mouseMoved: 5
  readonly leftMouseDragged: 6
  readonly rightMouseDragged: 7
  readonly keyDown: 10
  readonly keyUp: 11
  readonly flagsChanged: 12
  readonly scrollWheel: 22
  readonly tabletPointer: 23
  readonly tabletProximity: 24
  readonly otherMouseDown: 25
  readonly otherMouseUp: 26
  readonly otherMouseDragged: 27
}

// Event data structure from native module
export interface EventData {
  /** CGEventType integer value */
  type: number
  /** X coordinate (for mouse events) */
  x?: number
  /** Y coordinate (for mouse events) */
  y?: number
  /** Event timestamp */
  timestamp: number
  /** Process ID of the event source */
  processId?: number
  /** Key code (for keyboard events) */
  keyCode?: number
  /** Whether keyCode is available */
  hasKeyCode?: boolean
}

// Accessibility permissions result
export interface AccessibilityPermissionsResult {
  /** Whether accessibility permissions are granted */
  hasPermissions: boolean
  /** Descriptive message about permission status */
  message: string
}

// Event filter configuration options
export interface EventFilterOptions {
  /** Enable process ID filtering */
  filterByProcessId?: boolean
  /** Exclude (true) or include only (false) the target process */
  excludeProcessId?: boolean
  /** Target process ID for filtering */
  targetProcessId?: number
  /** Enable coordinate range filtering */
  filterByCoordinates?: boolean
  /** Minimum X coordinate */
  minX?: number
  /** Maximum X coordinate */
  maxX?: number
  /** Minimum Y coordinate */
  minY?: number
  /** Maximum Y coordinate */
  maxY?: number
  /** Enable event type filtering */
  filterByEventType?: boolean
  /** Allow keyboard events */
  allowKeyboard?: boolean
  /** Allow mouse events */
  allowMouse?: boolean
  /** Allow scroll events */
  allowScroll?: boolean
}

// Event type literals for better type safety
export type CGEventTypeString = 
  | "null"
  | "leftMouseDown"
  | "leftMouseUp"
  | "rightMouseDown"
  | "rightMouseUp"
  | "mouseMoved"
  | "leftMouseDragged"
  | "rightMouseDragged"
  | "keyDown"
  | "keyUp"
  | "flagsChanged"
  | "scrollWheel"
  | "tabletPointer"
  | "tabletProximity"
  | "otherMouseDown"
  | "otherMouseUp"
  | "otherMouseDragged"

export type CGEventTypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 26 | 27

// Main MacOSEventHook class interface
export interface MacOSEventHook extends EventEmitter {
  // Static getters
  readonly CGEventTypes: CGEventTypesMap
  readonly EventTypeToInt: EventTypeToIntMap
  
  // Core monitoring methods
  /**
   * Start monitoring macOS system events
   * Requires accessibility permissions
   */
  startMonitoring(): void
  
  /**
   * Stop monitoring macOS system events
   */
  stopMonitoring(): void
  
  /**
   * Check if monitoring is currently active
   */
  isMonitoring(): boolean
  
  // Polling control methods
  /**
   * Set polling rate in milliseconds
   * @param ms Polling interval (minimum 1ms)
   */
  setPollingRate(ms: number): void
  
  /**
   * Start event polling manually
   */
  startPolling(): void
  
  /**
   * Stop event polling manually
   */
  stopPolling(): void
  
  // Queue management
  /**
   * Get current event queue size
   */
  getQueueSize(): number
  
  /**
   * Clear all events from the queue
   */
  clearQueue(): void
  
  /**
   * Get next event from queue manually
   * @returns Event data or null if queue is empty
   */
  getNextEvent(): EventData | null
  
  // Permission methods
  /**
   * Check accessibility permissions status
   */
  checkAccessibilityPermissions(): AccessibilityPermissionsResult
  
  /**
   * Request accessibility permissions (shows system dialog)
   */
  requestAccessibilityPermissions(): AccessibilityPermissionsResult
  
  // Performance control
  /**
   * Enable performance mode for high-frequency events
   */
  enablePerformanceMode(): void
  
  /**
   * Disable performance mode
   */
  disablePerformanceMode(): void
  
  /**
   * Set mouse move throttling interval
   * @param intervalMs Throttling interval in milliseconds
   */
  setMouseMoveThrottling(intervalMs: number): void
  
  /**
   * Enable or disable verbose logging
   * @param enable Whether to enable verbose logging
   */
  setVerboseLogging(enable: boolean): void
  
  // Event filtering
  /**
   * Set event filter options
   * @param options Filter configuration
   */
  setEventFilter(options: EventFilterOptions): void
  
  /**
   * Clear all event filters
   */
  clearEventFilter(): void
  
  // Event modification (optional feature)
  /**
   * Enable event modification and consumption
   */
  enableEventModification(): void
  
  /**
   * Disable event modification and consumption
   */
  disableEventModification(): void
  
  // Native module compatibility methods
  /**
   * Set process filter (legacy method)
   * @param processId Target process ID
   * @param exclude Whether to exclude or include only this process
   */
  setProcessFilter(processId: number, exclude: boolean): void
  
  /**
   * Set coordinate range filter (legacy method)
   * @param minX Minimum X coordinate
   * @param maxX Maximum X coordinate
   * @param minY Minimum Y coordinate
   * @param maxY Maximum Y coordinate
   */
  setCoordinateFilter(minX: number, maxX: number, minY: number, maxY: number): void
  
  /**
   * Set event type filter (legacy method)
   * @param allowKeyboard Allow keyboard events
   * @param allowMouse Allow mouse events
   * @param allowScroll Allow scroll events
   */
  setEventTypeFilter(allowKeyboard: boolean, allowMouse: boolean, allowScroll: boolean): void
  
  /**
   * Clear all filters (legacy method)
   */
  clearFilters(): void
  
  // EventEmitter method overrides for better typing
  /**
   * Add event listener for specific event type
   * @param eventName Event name (string) or CGEventType (number)
   * @param listener Event handler function
   */
  on(eventName: CGEventTypeString, listener: (data: EventData) => void): this
  on(eventName: CGEventTypeNumber, listener: (data: EventData) => void): this
  on(eventName: 'event', listener: (data: EventData) => void): this
  on(eventName: string | number, listener: (...args: any[]) => void): this
  
  /**
   * Add one-time event listener
   * @param eventName Event name (string) or CGEventType (number)
   * @param listener Event handler function
   */
  once(eventName: CGEventTypeString, listener: (data: EventData) => void): this
  once(eventName: CGEventTypeNumber, listener: (data: EventData) => void): this
  once(eventName: 'event', listener: (data: EventData) => void): this
  once(eventName: string | number, listener: (...args: any[]) => void): this
  
  /**
   * Remove event listener
   * @param eventName Event name (string) or CGEventType (number)
   * @param listener Event handler function to remove
   */
  off(eventName: CGEventTypeString, listener: (data: EventData) => void): this
  off(eventName: CGEventTypeNumber, listener: (data: EventData) => void): this
  off(eventName: 'event', listener: (data: EventData) => void): this
  off(eventName: string | number, listener: (...args: any[]) => void): this
  
  /**
   * Emit event (internal use)
   * @param eventName Event name
   * @param args Event arguments
   */
  emit(eventName: string | number, ...args: any[]): boolean
}

// Static class interface for accessing static members
export interface MacOSEventHookStatic {
  /**
   * CGEventType to string mapping
   */
  readonly CGEventTypes: CGEventTypesMap
  
  /**
   * String to CGEventType mapping
   */
  readonly EventTypeToInt: EventTypeToIntMap
  
  new(): MacOSEventHook
}

// Export the singleton instance (as per index.js: module.exports = instance)
declare const iohookMacos: MacOSEventHook

export = iohookMacos 