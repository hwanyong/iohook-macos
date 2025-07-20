# AI 사용 가이드: iohook-macos (CommonJS - 한국어)

**[AI 컨텍스트 시작]**  
당신은 개발자들이 CommonJS 환경에서 `iohook-macos` 라이브러리를 사용할 수 있도록 도와주는 AI 어시스턴트입니다. 이 라이브러리는 Electron 애플리케이션에서 macOS 시스템 이벤트 후킹을 위한 고성능 네이티브 라이브러리입니다. 실용적인 사용 패턴, 일반적인 구현 방법, 모범 사례에 집중하세요.
**[AI 컨텍스트 끝]**

## 라이브러리 개요

`iohook-macos`는 **CommonJS 문법을 사용하는 Electron 애플리케이션에서 macOS 시스템 이벤트를 후킹하는 고성능 네이티브 라이브러리**입니다.

### 주요 기능
- **실시간 이벤트 모니터링**: 키보드, 마우스, 스크롤 이벤트
- **시스템 레벨 접근**: 글로벌 단축키 및 제스처  
- **고성능**: 설정 가능한 최적화된 폴링
- **이벤트 필터링**: 프로세스 ID, 좌표, 이벤트 타입 필터링
- **접근성 통합**: 내장된 권한 처리

## CommonJS 사용 패턴

### 기본 설정
```javascript
const iohook = require('iohook-macos')

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

### 이벤트 리스너

#### 문자열 기반 이벤트 (권장)
```javascript
// 키보드 이벤트
iohook.on('keyDown', (event) => {
    console.log('키 눌림:', event.keyCode)
    console.log('타임스탬프:', event.timestamp)
})

iohook.on('keyUp', (event) => {
    console.log('키 떼기:', event.keyCode)
})

// 마우스 이벤트
iohook.on('leftMouseDown', (event) => {
    console.log('좌클릭 위치:', event.x, event.y)
})

iohook.on('mouseMoved', (event) => {
    console.log('마우스 이동:', event.x, event.y)
})

// 스크롤 이벤트
iohook.on('scrollWheel', (event) => {
    console.log('스크롤 감지:', event.x, event.y)
})
```

#### 숫자 기반 이벤트 (CGEventType)
```javascript
// CGEventType 정수값 직접 사용
iohook.on(10, (event) => { // kCGEventKeyDown
    console.log('키 다운:', event.keyCode)
})

iohook.on(1, (event) => { // kCGEventLeftMouseDown
    console.log('좌클릭 다운:', event.x, event.y)
})

// 모든 이벤트를 위한 범용 리스너
iohook.on('event', (event) => {
    console.log('모든 이벤트:', event.type, event)
})
```

### 이벤트 데이터 구조
```javascript
// 이벤트 객체 속성들
const eventData = {
    type: 10,              // CGEventType 숫자
    x: 123.45,            // X 좌표 (마우스 이벤트)
    y: 678.90,            // Y 좌표 (마우스 이벤트) 
    timestamp: 1678886400000, // 이벤트 타임스탬프
    processId: 12345,     // 소스 프로세스 ID
    keyCode: 36,          // 키 코드 (키보드 이벤트)
    hasKeyCode: true      // 키 코드 사용 가능 여부
}
```

## 성능 최적화

### 고성능 모드
```javascript
// 고빈도 이벤트를 위한 성능 모드 활성화
iohook.enablePerformanceMode()

// 최적 폴링 주기 설정 (60fps = 16ms)
iohook.setPollingRate(16)

// CPU 사용량 감소를 위한 마우스 이동 이벤트 스로틀링
iohook.setMouseMoveThrottling(16) // 60fps

// 오버플로 방지를 위한 큐 크기 모니터링
setInterval(() => {
    const queueSize = iohook.getQueueSize()
    if (queueSize > 100) {
        console.warn('이벤트 큐가 커지고 있습니다:', queueSize)
        // 폴링 주기를 늘리거나 이벤트 필터링을 고려하세요
    }
}, 1000)
```

### 큐 관리
```javascript
// 수동 큐 제어
const nextEvent = iohook.getNextEvent() // 다음 이벤트 수동 조회
iohook.clearQueue() // 모든 대기 중인 이벤트 삭제

// 모니터링 상태 확인
if (iohook.isMonitoring()) {
    console.log('현재 이벤트 모니터링 중')
}
```

## 이벤트 필터링

### 프로세스 기반 필터링
```javascript
// 특정 프로세스만 모니터링
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 1234,
    excludeProcessId: false // 이 프로세스만 포함
})

// 특정 프로세스 제외  
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 5678,
    excludeProcessId: true // 이 프로세스 제외
})
```

### 좌표 기반 필터링
```javascript
// 특정 화면 영역만 모니터링
iohook.setEventFilter({
    filterByCoordinates: true,
    minX: 0, maxX: 1920,    // 화면 너비 범위
    minY: 0, maxY: 1080     // 화면 높이 범위
})
```

### 이벤트 타입 필터링
```javascript
// 이벤트 카테고리별 필터링
iohook.setEventFilter({
    filterByEventType: true,
    allowKeyboard: true,     // 키보드 이벤트 허용
    allowMouse: false,       // 마우스 이벤트 차단
    allowScroll: true        // 스크롤 이벤트 허용
})

// 모든 필터 제거
iohook.clearEventFilter()
```

## Electron 통합

### 메인 프로세스 설정
```javascript
const { app, BrowserWindow, ipcMain } = require('electron')
const iohook = require('iohook-macos')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // 렌더러 프로세스로 이벤트 전달
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('globalKeyDown', data)
    })

    iohook.on('leftMouseDown', (data) => {
        mainWindow.webContents.send('globalMouseClick', data)
    })

    // 윈도우 준비 후 모니터링 시작
    mainWindow.once('ready-to-show', () => {
        const permissions = iohook.checkAccessibilityPermissions()
        if (permissions.hasPermissions) {
            iohook.startMonitoring()
        } else {
            console.log('접근성 권한을 허용해 주세요')
        }
    })

    return mainWindow
}

app.whenReady().then(createWindow)

// 앱 정리 처리
app.on('window-all-closed', () => {
    iohook.stopMonitoring()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
```

### IPC 통신
```javascript
// 렌더러 프로세스에서
const { ipcRenderer } = require('electron')

ipcRenderer.on('globalKeyDown', (event, data) => {
    console.log('글로벌 키 눌림:', data.keyCode)
    // 글로벌 키보드 입력에 따른 UI 업데이트
})

ipcRenderer.on('globalMouseClick', (event, data) => {
    console.log('글로벌 마우스 클릭:', data.x, data.y)
    // 글로벌 마우스 이벤트 처리
})
```

## 권한 처리

### 접근성 권한
```javascript
// 권한 확인 및 요청
function ensurePermissions() {
    const result = iohook.checkAccessibilityPermissions()
    
    if (!result.hasPermissions) {
        console.log('상태:', result.message)
        
        // 시스템 권한 다이얼로그 표시
        iohook.requestAccessibilityPermissions()
        
        console.log('접근성 권한을 허용하고 앱을 재시작해 주세요')
        return false
    }
    
    return true
}

// 모니터링 시작 전 사용
if (ensurePermissions()) {
    iohook.startMonitoring()
}
```

## 일반적인 사용 사례

### 글로벌 단축키
```javascript
// Cmd+Shift+Space 단축키 구현
let cmdPressed = false
let shiftPressed = false

iohook.on('keyDown', (event) => {
    if (event.keyCode === 55) cmdPressed = true      // Cmd 키
    if (event.keyCode === 56) shiftPressed = true    // Shift 키
    if (event.keyCode === 49) {                      // Space 키
        if (cmdPressed && shiftPressed) {
            console.log('글로벌 단축키 실행!')
            // 여기에 원하는 동작을 구현하세요
        }
    }
})

iohook.on('keyUp', (event) => {
    if (event.keyCode === 55) cmdPressed = false
    if (event.keyCode === 56) shiftPressed = false
})
```

### 마우스 추적
```javascript
// 스로틀링을 통한 마우스 위치 추적
let lastMouseTime = 0
const MOUSE_THROTTLE = 50 // 50ms = 20fps

iohook.on('mouseMoved', (event) => {
    const now = Date.now()
    if (now - lastMouseTime > MOUSE_THROTTLE) {
        console.log(`마우스 위치: ${event.x}, ${event.y}`)
        lastMouseTime = now
    }
})
```

### 클릭 모니터링
```javascript
// 클릭 패턴 모니터링
let clickCount = 0
let lastClickTime = 0

iohook.on('leftMouseDown', (event) => {
    const now = Date.now()
    
    // 너무 많은 시간이 지나면 카운트 리셋
    if (now - lastClickTime > 500) {
        clickCount = 0
    }
    
    clickCount++
    lastClickTime = now
    
    console.log(`클릭 #${clickCount} 위치: ${event.x}, ${event.y}`)
    
    // 더블클릭 감지
    if (clickCount === 2) {
        console.log('더블클릭 감지!')
    }
})
```

## 에러 처리

### 일반적인 에러 패턴
```javascript
// 견고한 모니터링 설정
function startMonitoringWithErrorHandling() {
    try {
        // 먼저 권한 확인
        const permissions = iohook.checkAccessibilityPermissions()
        if (!permissions.hasPermissions) {
            throw new Error('접근성 권한이 허용되지 않았습니다')
        }
        
        // 모니터링 시작
        iohook.startMonitoring()
        console.log('이벤트 모니터링이 성공적으로 시작되었습니다')
        
    } catch (error) {
        console.error('모니터링 시작 실패:', error.message)
        
        if (error.message.includes('permission')) {
            console.log('시스템 환경설정에서 접근성 권한을 허용해 주세요')
        }
        
        return false
    }
    
    return true
}

// 우아한 종료
process.on('SIGINT', () => {
    console.log('종료 중...')
    if (iohook.isMonitoring()) {
        iohook.stopMonitoring()
    }
    process.exit(0)
})
```

## 이벤트 참조

### 지원되는 이벤트 타입
```javascript
const EVENT_TYPES = {
    // 키보드
    'keyDown': 10,
    'keyUp': 11,
    'flagsChanged': 12,
    
    // 마우스 클릭
    'leftMouseDown': 1,
    'leftMouseUp': 2,
    'rightMouseDown': 3,
    'rightMouseUp': 4,
    'otherMouseDown': 25,
    'otherMouseUp': 26,
    
    // 마우스 이동
    'mouseMoved': 5,
    'leftMouseDragged': 6,
    'rightMouseDragged': 7,
    'otherMouseDragged': 27,
    
    // 스크롤 및 기타
    'scrollWheel': 22,
    'tabletPointer': 23,
    'tabletProximity': 24
}
```

이 가이드는 `iohook-macos`의 포괄적인 CommonJS 사용 패턴을 제공합니다. 실제 애플리케이션을 위한 실용적인 구현과 성능 최적화에 집중하세요. 