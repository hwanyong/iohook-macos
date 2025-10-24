import EventEmitter from 'events'
import { CGEventTypes, EventTypeToInt } from './event-types.mjs'

/**
 * IOHook 공통 EventEmitter 클래스
 */
export class IOHookEventEmitter extends EventEmitter {
  constructor() {
    super()
    this._isMonitoring = false
    this.pollingInterval = null
    this.pollingRate = 16 // ~60fps
  }

  static get CGEventTypes() {
    return CGEventTypes
  }

  static get EventTypeToInt() {
    return EventTypeToInt
  }

  get CGEventTypes() {
    return CGEventTypes
  }

  get EventTypeToInt() {
    return EventTypeToInt
  }

  setPollingRate(ms) {
    this.pollingRate = Math.max(1, ms)
    console.log(`[iohook] Polling rate set to ${this.pollingRate}ms`)
    
    if (this._isMonitoring) {
      this.stopPolling()
      this.startPolling()
    }
  }

  startPolling(nativeModule) {
    if (this.pollingInterval) return
    
    this.pollingInterval = setInterval(() => {
      try {
        let event
        let eventCount = 0
        const maxEventsPerPoll = 50
        
        while ((event = nativeModule.getNextEvent()) && eventCount < maxEventsPerPoll) {
          const eventTypeInt = event.type
          const eventTypeString = CGEventTypes[eventTypeInt] || "unknown"
          
          this.emit(eventTypeInt, event)
          this.emit(eventTypeString, event)
          this.emit('event', event)
          
          eventCount++
        }
        
        if (eventCount >= maxEventsPerPoll) {
          console.log(`[iohook] Processed ${eventCount} events in one poll cycle`)
        }
      } catch (error) {
        console.error('[iohook] Error during polling:', error)
      }
    }, this.pollingRate)
    
    console.log(`[iohook] Polling started at ${this.pollingRate}ms intervals`)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log('[iohook] Polling stopped')
    }
  }

  isMonitoring() {
    return this._isMonitoring
  }

  setMonitoring(status) {
    this._isMonitoring = status
  }
}