# AI 사용 가이드: iohook-macos (ESM - 한국어)

**[AI 컨텍스트 시작]**  
당신은 개발자들이 ESM (ECMAScript Modules) 환경에서 `iohook-macos` 라이브러리를 사용할 수 있도록 도와주는 AI 어시스턴트입니다. 이 라이브러리는 최신 ES 모듈 문법을 사용하는 Electron 애플리케이션용 고성능 macOS 시스템 이벤트 후킹 라이브러리입니다. ES 모듈 패턴, import/export 문법, 최신 JavaScript 관례에 집중하세요.
**[AI 컨텍스트 끝]**

## 라이브러리 개요

`iohook-macos`는 **ESM 문법을 사용하는 Electron 애플리케이션에서 macOS 시스템 이벤트를 후킹하는 고성능 네이티브 라이브러리**입니다.

### 주요 기능
- **ESM 호환성**: 네이티브 ES 모듈 지원
- **실시간 이벤트 모니터링**: 키보드, 마우스, 스크롤 이벤트
- **시스템 레벨 접근**: 글로벌 단축키 및 제스처  
- **고성능**: 설정 가능한 최적화된 폴링
- **이벤트 필터링**: 프로세스 ID, 좌표, 이벤트 타입 필터링

## ESM 사용 패턴

### Import 문
```javascript
// Named import (권장)
import { 
    startMonitoring, 
    stopMonitoring, 
    checkAccessibilityPermissions,
    setEventFilter,
    on as addListener 
} from 'iohook-macos'

// Default import
import iohook from 'iohook-macos'

// Dynamic import
const { default: iohook } = await import('iohook-macos')
```

### 기본 설정
```javascript
import iohook from 'iohook-macos'

// 먼저 접근성 권한 확인
const permissions = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('접근성 권한이 필요합니다')
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// 모니터링 시작
iohook.startMonitoring()
```

### ESM을 사용한 이벤트 리스너
```javascript
import iohook from 'iohook-macos'

// 키보드 이벤트
iohook.on('keyDown', (event) => {
    console.log('키 눌림:', event.keyCode)
})

// 마우스 이벤트
iohook.on('leftMouseDown', (event) => {
    console.log('좌클릭 위치:', event.x, event.y)
})

// 범용 이벤트 리스너
iohook.on('event', (event) => {
    console.log('이벤트 타입:', event.type)
})
```

## ESM을 사용한 성능

### 모듈형 성능 설정
```javascript
// performance.mjs
import iohook from 'iohook-macos'

export const setupPerformanceMode = () => {
    iohook.enablePerformanceMode()
    iohook.setPollingRate(16) // 60fps
    iohook.setMouseMoveThrottling(16)
}

export const monitorQueue = () => {
    setInterval(() => {
        const queueSize = iohook.getQueueSize()
        if (queueSize > 100) {
            console.warn('큐 크기:', queueSize)
        }
    }, 1000)
}

// main.mjs
import { setupPerformanceMode, monitorQueue } from './performance.mjs'

setupPerformanceMode()
monitorQueue()
```

## ESM을 사용한 이벤트 필터링

### 필터 모듈
```javascript
// filters.mjs
export const createProcessFilter = (processId, exclude = false) => ({
    filterByProcessId: true,
    targetProcessId: processId,
    excludeProcessId: exclude
})

export const createCoordinateFilter = (minX, maxX, minY, maxY) => ({
    filterByCoordinates: true,
    minX, maxX, minY, maxY
})

// main.mjs
import iohook from 'iohook-macos'
import { createProcessFilter, createCoordinateFilter } from './filters.mjs'

iohook.setEventFilter(createProcessFilter(1234))
iohook.setEventFilter(createCoordinateFilter(0, 1920, 0, 1080))
```

## ESM을 사용한 Electron 통합

### 메인 프로세스 (ESM)
```javascript
// main.mjs
import { app, BrowserWindow } from 'electron'
import iohook from 'iohook-macos'

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // 렌더러로 이벤트 전달
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('globalKeyDown', data)
    })

    // 준비 완료 시 모니터링 시작
    mainWindow.once('ready-to-show', () => {
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
        }
    })
}

app.whenReady().then(createWindow)

// 정리
app.on('window-all-closed', () => {
    iohook.stopMonitoring()
    if (process.platform !== 'darwin') app.quit()
})
```

### Package.json 설정
```json
{
    "type": "module",
    "main": "main.mjs",
    "scripts": {
        "start": "electron main.mjs",
        "dev": "electron main.mjs --enable-logging"
    }
}
```

## ESM을 사용한 일반적인 사용 사례

### 모듈형 글로벌 단축키
```javascript
// shortcuts.mjs
import iohook from 'iohook-macos'

class ShortcutManager {
    constructor() {
        this.modifiers = { cmd: false, shift: false }
        this.setupListeners()
    }

    setupListeners() {
        iohook.on('keyDown', this.handleKeyDown.bind(this))
        iohook.on('keyUp', this.handleKeyUp.bind(this))
    }

    handleKeyDown(event) {
        if (event.keyCode === 55) this.modifiers.cmd = true
        if (event.keyCode === 56) this.modifiers.shift = true
        
        if (event.keyCode === 49 && this.modifiers.cmd && this.modifiers.shift) {
            this.onGlobalShortcut()
        }
    }

    handleKeyUp(event) {
        if (event.keyCode === 55) this.modifiers.cmd = false
        if (event.keyCode === 56) this.modifiers.shift = false
    }

    onGlobalShortcut() {
        console.log('글로벌 단축키 실행!')
    }
}

export default ShortcutManager

// main.mjs
import ShortcutManager from './shortcuts.mjs'
const shortcuts = new ShortcutManager()
```

### 마우스 추적 모듈
```javascript
// mouse-tracker.mjs
import iohook from 'iohook-macos'

export class MouseTracker {
    constructor(throttleMs = 50) {
        this.positions = []
        this.lastTime = 0
        this.throttle = throttleMs
        this.setup()
    }

    setup() {
        iohook.on('mouseMoved', (event) => {
            this.trackPosition(event)
        })
    }

    trackPosition(event) {
        const now = Date.now()
        if (now - this.lastTime > this.throttle) {
            this.positions.push({
                x: event.x,
                y: event.y,
                timestamp: event.timestamp
            })
            this.lastTime = now
        }
    }

    getRecentPositions(count = 10) {
        return this.positions.slice(-count)
    }
}

// 사용법
import { MouseTracker } from './mouse-tracker.mjs'
const tracker = new MouseTracker(50)
```

## ESM을 사용한 에러 처리

### 에러 관리 모듈
```javascript
// error-handler.mjs
export class PermissionError extends Error {
    constructor(message) {
        super(message)
        this.name = 'PermissionError'
    }
}

export class MonitoringError extends Error {
    constructor(message) {
        super(message)
        this.name = 'MonitoringError'
    }
}

export const handleError = (error) => {
    if (error instanceof PermissionError) {
        console.error('권한 오류:', error.message)
    } else if (error instanceof MonitoringError) {
        console.error('모니터링 오류:', error.message)
    } else {
        console.error('알 수 없는 오류:', error)
    }
}

// main.mjs
import iohook from 'iohook-macos'
import { PermissionError, MonitoringError, handleError } from './error-handler.mjs'

const startMonitoring = async () => {
    try {
        const permissions = iohook.checkAccessibilityPermissions()
        if (!permissions.hasPermissions) {
            throw new PermissionError('접근성 권한이 허용되지 않았습니다')
        }
        
        iohook.startMonitoring()
    } catch (error) {
        handleError(error)
    }
}
```

## ESM용 이벤트 참조

### 이벤트 타입 모듈
```javascript
// event-types.mjs
export const EVENT_TYPES = {
    // 키보드
    keyDown: 10,
    keyUp: 11,
    flagsChanged: 12,
    
    // 마우스
    leftMouseDown: 1,
    leftMouseUp: 2,
    rightMouseDown: 3,
    rightMouseUp: 4,
    mouseMoved: 5,
    
    // 스크롤
    scrollWheel: 22
}

export const isKeyboardEvent = (type) => 
    [EVENT_TYPES.keyDown, EVENT_TYPES.keyUp, EVENT_TYPES.flagsChanged].includes(type)

export const isMouseEvent = (type) => 
    [EVENT_TYPES.leftMouseDown, EVENT_TYPES.leftMouseUp, 
     EVENT_TYPES.rightMouseDown, EVENT_TYPES.rightMouseUp, 
     EVENT_TYPES.mouseMoved].includes(type)

// 사용법
import { EVENT_TYPES, isKeyboardEvent } from './event-types.mjs'
import iohook from 'iohook-macos'

iohook.on('event', (event) => {
    if (isKeyboardEvent(event.type)) {
        console.log('키보드 이벤트 감지')
    }
})
```

## 동적 Import

### 조건부 로딩
```javascript
// main.mjs
const initializeEventHook = async () => {
    try {
        // 조건부 로딩을 위한 동적 import
        const { default: iohook } = await import('iohook-macos')
        
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
            return iohook
        } else {
            throw new Error('권한이 필요합니다')
        }
    } catch (error) {
        console.error('초기화 실패:', error.message)
        return null
    }
}

// Top-level await 사용 (Node.js 14+)
const iohook = await initializeEventHook()
if (iohook) {
    console.log('이벤트 모니터링이 시작되었습니다')
}
```

### 기능 감지
```javascript
// feature-detection.mjs
export const checkPlatformSupport = async () => {
    if (process.platform !== 'darwin') {
        throw new Error('iohook-macos는 macOS만 지원합니다')
    }
    
    try {
        const { default: iohook } = await import('iohook-macos')
        return iohook.checkAccessibilityPermissions()
    } catch (error) {
        throw new Error('iohook-macos 로드 실패: ' + error.message)
    }
}

// main.mjs
import { checkPlatformSupport } from './feature-detection.mjs'

try {
    const permissions = await checkPlatformSupport()
    if (permissions.hasPermissions) {
        const { default: iohook } = await import('iohook-macos')
        iohook.startMonitoring()
    }
} catch (error) {
    console.error('플랫폼 확인 실패:', error.message)
}
```

이 가이드는 `iohook-macos`의 포괄적인 ESM 사용 패턴을 제공합니다. 최신 ES 모듈 문법, 모듈형 아키텍처, 동적 import를 통한 최적의 개발 경험에 집중하세요. 