import { EventEmitter } from 'events'

// CGEventType to String mapping (from index.js)
interface CGEventTypesMap {
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
interface EventTypeToIntMap {
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
interface EventData {
  /** CGEventType integer value */
  type: number
  /** X coordinate (for mouse events) */
  x?: number
  /** Y coordinate (for mouse events) */
  y?: number
  /** Event timestamp */
  timestamp: number
  /** Process ID that generated the event */
  processId?: number
  /** Key code (for keyboard events) */
  keyCode?: number
  /** Whether keyCode property is available */
  hasKeyCode?: boolean
}

// Accessibility permissions check result
interface AccessibilityPermissionsResult {
  /** Whether accessibility permissions are granted */
  hasPermissions: boolean
  /** Descriptive message about permission status */
  message: string
}

// Event filtering options
interface EventFilterOptions {
  /** Enable filtering by process ID */
  filterByProcessId?: boolean
  /** Whether to exclude (true) or include (false) the target process ID */
  excludeProcessId?: boolean
  /** Target process ID for filtering */
  targetProcessId?: number
  /** Enable filtering by screen coordinates */
  filterByCoordinates?: boolean
  /** Minimum X coordinate */
  minX?: number
  /** Maximum X coordinate */
  maxX?: number
  /** Minimum Y coordinate */
  minY?: number
  /** Maximum Y coordinate */
  maxY?: number
  /** Enable filtering by event type */
  filterByEventType?: boolean
  /** Allow keyboard events */
  allowKeyboard?: boolean
  /** Allow mouse events */
  allowMouse?: boolean
  /** Allow scroll events */
  allowScroll?: boolean
}

// Supported event names (string-based)
type EventNames = 
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

type CGEventTypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 26 | 27

// Main MacOSEventHook class interface
interface MacOSEventHook extends Omit<EventEmitter, 'emit' | 'on'> {
  // Custom emit and on methods to support both string and number event names
  emit(eventName: string | number, ...args: any[]): boolean
  on(eventName: string | number | 'event', listener: (data: EventData) => void): this
  
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
   * @returns true if monitoring is active, false otherwise
   */
  isMonitoring(): boolean
  
  // Permission management
  /**
   * Check accessibility permissions status
   * @returns Object with permission status and message
   */
  checkAccessibilityPermissions(): AccessibilityPermissionsResult
  
  /**
   * Request accessibility permissions (opens system dialog)
   * @returns Object with permission status and message
   */
  requestAccessibilityPermissions(): AccessibilityPermissionsResult
  
  // Polling and queue management
  /**
   * Set the polling rate for event checking
   * @param ms Polling interval in milliseconds (minimum 1)
   */
  setPollingRate(ms: number): void
  
  /**
   * Get current event queue size
   * @returns Number of events in queue
   */
  getQueueSize(): number
  
  /**
   * Clear the event queue
   */
  clearQueue(): void
  
  /**
   * Get next event from queue (manual polling)
   * @returns Event data or null if queue is empty
   */
  getNextEvent(): EventData | null
  
  // Performance controls
  /**
   * Enable performance mode (reduced logging)
   */
  enablePerformanceMode(): void
  
  /**
   * Disable performance mode (full logging)
   */
  disablePerformanceMode(): void
  
  /**
   * Set mouse move event throttling
   * @param intervalMs Minimum interval between mouse move events in milliseconds
   */
  setMouseMoveThrottling(intervalMs: number): void
  
  /**
   * Enable or disable verbose logging
   * @param enable Whether to enable verbose logging
   */
  setVerboseLogging(enable: boolean): void
  
  // Event filtering
  /**
   * Set event filtering options
   * @param options Filtering configuration
   */
  setEventFilter(options: EventFilterOptions): void
  
  /**
   * Clear all event filters
   */
  clearEventFilter(): void
  
  // Event modification (advanced)
  /**
   * Enable event modification capabilities
   */
  enableEventModification(): void
  
  /**
   * Disable event modification capabilities
   */
  disableEventModification(): void
}

// Static class interface for MacOSEventHook constructor
interface MacOSEventHookStatic {
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

// Export types for external use
export type {
  EventData,
  AccessibilityPermissionsResult,
  EventFilterOptions,
  CGEventTypesMap,
  EventTypeToIntMap,
  EventNames,
  CGEventTypeNumber,
  MacOSEventHook
}

// Export the singleton instance (as per index.js: module.exports = instance)
declare const iohookMacos: MacOSEventHook
export default iohookMacos 