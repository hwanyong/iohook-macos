/**
 * @iohook/shared - CommonJS Entry Point
 * 
 * Dual Package 지원: CommonJS 환경(Electron 등)을 위한 진입점
 */

const { IOHookEventEmitter } = require('./event-emitter.cjs')
const { Logger } = require('./logger.cjs')
const { CGEventTypes, EventTypeToInt } = require('./event-types.cjs')

module.exports = {
  IOHookEventEmitter,
  Logger,
  CGEventTypes,
  EventTypeToInt
}