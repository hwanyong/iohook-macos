/**
 * CommonJS wrapper for @iohook/macos
 *
 * ⚠️ 주의: 이 파일은 수동으로 작성되었습니다.
 * esbuild 자동 변환은 import.meta.url 문제로 사용 불가합니다.
 */

const { join } = require('path')
const { IOHookEventEmitter, Logger } = require('@iohook/shared')

// ✅ CommonJS 네이티브 전역 변수 사용
// __dirname은 CommonJS에서 자동 제공됨
let nativeModule
try {
  nativeModule = require('node-gyp-build')(join(__dirname))
  Logger.log('Native module loaded successfully via node-gyp-build')
} catch (buildError) {
  Logger.log('node-gyp-build failed, trying fallback paths...')
  Logger.error('Error:', buildError.message)
  
  const fallbackPaths = [
    './build/Release/iohook-macos.node',
    './prebuilds/darwin-arm64/iohook-macos.node',
    './prebuilds/darwin-x64/iohook-macos.node'
  ]
  
  let loaded = false
  for (const fallbackPath of fallbackPaths) {
    try {
      nativeModule = require(fallbackPath)
      Logger.log(`Native module loaded via fallback path: ${fallbackPath}`)
      loaded = true
      break
    } catch (err) {
      Logger.log(`Failed to load from ${fallbackPath}`)
    }
  }
  
  if (!loaded) {
    Logger.error('All fallback paths failed')
    Logger.error('Platform:', process.platform)
    Logger.error('Architecture:', process.arch)
    Logger.error('Node version:', process.version)
    throw new Error(
      'Native module could not be loaded. ' +
      'This package requires macOS (darwin) and may need to be rebuilt. ' +
      'Try running: npm run rebuild'
    )
  }
}

/**
 * macOS EventHook 클래스
 */
class MacOSEventHook extends IOHookEventEmitter {
  constructor() {
    super()
    Logger.log('MacOSEventHook instance created')
  }

  startMonitoring() {
    Logger.log('startMonitoring called')
    
    // 네이티브 모듈 emit 브리지 설정 (레거시 호환)
    nativeModule.setEmitFunction((eventType, eventData) => {
      // 폴링 모드에서는 사용 안 함
    })
    
    Logger.log('Emit bridge setup completed')
    
    // 네이티브 모니터링 시작
    nativeModule.startMonitoring()
    Logger.log('Native startMonitoring completed')
    
    // JavaScript 폴링 시작
    this.startPolling(nativeModule)
    this.setMonitoring(true)
    
    Logger.log('Listening for events...')
  }

  stopMonitoring() {
    Logger.log('stopMonitoring called')
    
    this.stopPolling()
    this.setMonitoring(false)
    
    nativeModule.stopMonitoring()
    Logger.log('Native stopMonitoring completed')
  }

  // 네이티브 모듈 메서드 위임
  getQueueSize() {
    return nativeModule.getQueueSize()
  }

  clearQueue() {
    return nativeModule.clearQueue()
  }

  getNextEvent() {
    return nativeModule.getNextEvent()
  }

  checkAccessibilityPermissions() {
    const result = nativeModule.checkAccessibilityPermissions()
    Logger.log('Accessibility permissions check:', result)
    return result
  }

  requestAccessibilityPermissions() {
    return nativeModule.requestAccessibilityPermissions()
  }

  enablePerformanceMode() {
    Logger.log('Performance mode enabled - Optimized for high-frequency events')
    return nativeModule.enablePerformanceMode()
  }

  disablePerformanceMode() {
    Logger.log('Performance mode disabled - Full logging restored')
    return nativeModule.disablePerformanceMode()
  }

  setMouseMoveThrottling(intervalMs) {
    Logger.log(`Mouse move throttling set to ${intervalMs}ms`)
    return nativeModule.setMouseMoveThrottling(intervalMs)
  }

  setVerboseLogging(enable) {
    Logger.log(`Verbose logging ${enable ? 'enabled' : 'disabled'}`)
    return nativeModule.setVerboseLogging(enable)
  }

  setEventFilter(options) {
    return nativeModule.setEventFilter(options)
  }

  clearEventFilter() {
    return nativeModule.clearEventFilter()
  }

  enableEventModification() {
    return nativeModule.enableEventModification()
  }

  disableEventModification() {
    return nativeModule.disableEventModification()
  }
}

// 싱글톤 인스턴스 생성 및 export
const instance = new MacOSEventHook()
Logger.log('Singleton instance created and ready')

module.exports = instance
