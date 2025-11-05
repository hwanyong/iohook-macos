# AI 사용 가이드: iohook-macos (TypeScript - 한국어)

**[AI 컨텍스트 시작]**  
당신은 개발자들이 TypeScript 환경에서 `iohook-macos` 라이브러리를 사용할 수 있도록 도와주는 AI 어시스턴트입니다. 이 라이브러리는 완전한 타입 안전성을 제공하는 Electron 애플리케이션용 고성능 macOS 시스템 이벤트 후킹 라이브러리입니다. TypeScript 특화 패턴, 타입 정의, 타입 안전한 구현에 집중하세요.
**[AI 컨텍스트 끝]**

## 라이브러리 개요

`iohook-macos`는 **완전한 TypeScript 지원과 타입 정의를 포함한 Electron 애플리케이션용 고성능 macOS 시스템 이벤트 후킹 네이티브 라이브러리**입니다.

### 주요 기능
- **타입 안전한 이벤트 처리**: 완전한 TypeScript 정의 포함
- **실시간 이벤트 모니터링**: 타입 인터페이스가 있는 키보드, 마우스, 스크롤 이벤트
- **시스템 레벨 접근**: 타입 안전성을 갖춘 글로벌 단축키 및 제스처
- **고성능**: 설정 가능한 최적화된 폴링
- **이벤트 필터링**: 타입 옵션을 갖춘 프로세스 ID, 좌표, 이벤트 타입 필터링

## TypeScript 사용 패턴

### 설치 및 설정
```typescript
import * as iohook from 'iohook-macos'
import type { 
    EventData, 
    AccessibilityPermissionsResult, 
    EventFilterOptions,
    CGEventTypeString,
    CGEventTypeNumber
} from 'iohook-macos'

// 타입 안전한 권한 확인
const permissions: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('접근성 권한이 필요합니다:', permissions.message)
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// 타입 안전성을 갖춘 모니터링 시작
iohook.startMonitoring()
```

### 타입 안전한 이벤트 리스너

#### 문자열 기반 이벤트 (권장)
```typescript
// 완전한 타입 안전성을 갖춘 키보드 이벤트
iohook.on('keyDown', (event: EventData) => {
    console.log('키 눌림:', event.keyCode)
    console.log('프로세스 ID:', event.processId)
    console.log('키 코드 있음:', event.hasKeyCode)
    
    // TypeScript가 모든 속성이 올바르게 타입화되도록 보장
    if (event.hasKeyCode && event.keyCode) {
        console.log('유효한 키 코드:', event.keyCode)
    }
})

iohook.on('keyUp', (event: EventData) => {
    console.log('키 떼기:', event.keyCode)
})

// 좌표 타입 안전성을 갖춘 마우스 이벤트
iohook.on('leftMouseDown', (event: EventData) => {
    if (event.x !== undefined && event.y !== undefined) {
        console.log(`좌클릭 위치: (${event.x}, ${event.y})`)
        console.log('타임스탬프:', event.timestamp)
    }
})

iohook.on('mouseMoved', (event: EventData) => {
    if (event.x !== undefined && event.y !== undefined) {
        console.log(`마우스 이동: (${event.x}, ${event.y})`)
    }
})

// 스크롤 이벤트
iohook.on('scrollWheel', (event: EventData) => {
    console.log('스크롤 이벤트 위치:', event.x, event.y)
})
```

#### 숫자 기반 이벤트 (CGEventType)
```typescript
// 타입 안전성을 갖춘 CGEventType 사용
iohook.on(10 as CGEventTypeNumber, (event: EventData) => { // kCGEventKeyDown
    console.log('키 다운 이벤트:', event.keyCode)
})

iohook.on(1 as CGEventTypeNumber, (event: EventData) => { // kCGEventLeftMouseDown
    console.log('좌클릭 다운:', event.x, event.y)
})

// 타입 안전성을 갖춘 범용 이벤트 리스너
iohook.on('event', (event: EventData) => {
    console.log('이벤트 타입:', event.type)
    console.log('이벤트 데이터:', event)
})
```

### 이벤트 데이터 인터페이스
```typescript
// 완전한 EventData 인터페이스
interface EventData {
    type: number           // CGEventType 정수값
    x?: number            // X 좌표 (마우스 이벤트)
    y?: number            // Y 좌표 (마우스 이벤트)
    timestamp: number     // 이벤트 타임스탬프
    processId?: number    // 소스 프로세스 ID
    keyCode?: number      // 키 코드 (키보드 이벤트)
    hasKeyCode?: boolean  // 키 코드 사용 가능 여부
}

// 타입 가드와 함께 사용
function isMouseEvent(event: EventData): event is EventData & { x: number; y: number } {
    return event.x !== undefined && event.y !== undefined
}

function isKeyboardEvent(event: EventData): event is EventData & { keyCode: number } {
    return event.hasKeyCode === true && event.keyCode !== undefined
}

// 타입 안전한 이벤트 처리
iohook.on('event', (event: EventData) => {
    if (isMouseEvent(event)) {
        console.log(`마우스 이벤트 위치: (${event.x}, ${event.y})`)
    }
    
    if (isKeyboardEvent(event)) {
        console.log(`키보드 이벤트 키: ${event.keyCode}`)
    }
})
```

## 성능 최적화

### 타입 안전한 성능 설정
```typescript
// 타입 안전한 성능 모드 설정
interface PerformanceConfig {
    pollingRate: number
    mouseThrottling: number
    enablePerformance: boolean
}

const performanceConfig: PerformanceConfig = {
    pollingRate: 16,        // 60fps
    mouseThrottling: 16,    // 60fps
    enablePerformance: true
}

// 타입 안전성을 갖춘 설정 적용
if (performanceConfig.enablePerformance) {
    iohook.enablePerformanceMode()
}

iohook.setPollingRate(performanceConfig.pollingRate)
iohook.setMouseMoveThrottling(performanceConfig.mouseThrottling)

// 타입 안전한 큐 모니터링
function monitorQueue(): void {
    setInterval(() => {
        const queueSize: number = iohook.getQueueSize()
        if (queueSize > 100) {
            console.warn('이벤트 큐가 커지고 있습니다:', queueSize)
        }
    }, 1000)
}

monitorQueue()
```

### 타입을 갖춘 큐 관리
```typescript
// 타입 안전한 큐 작업
const nextEvent: EventData | null = iohook.getNextEvent()
if (nextEvent) {
    console.log('다음 이벤트:', nextEvent.type)
}

// 큐 초기화
iohook.clearQueue()

// 타입 안전성을 갖춘 모니터링 상태 확인
const isMonitoring: boolean = iohook.isMonitoring()
if (isMonitoring) {
    console.log('현재 이벤트 모니터링 중')
}
```

## 타입 안전한 이벤트 필터링

### 필터 설정 인터페이스
```typescript
// 완전한 필터 옵션 인터페이스
const filterOptions: EventFilterOptions = {
    // 프로세스 필터링
    filterByProcessId: true,
    excludeProcessId: false,  // 대상 프로세스만 포함
    targetProcessId: 1234,
    
    // 좌표 필터링
    filterByCoordinates: true,
    minX: 0,
    maxX: 1920,
    minY: 0,
    maxY: 1080,
    
    // 이벤트 타입 필터링
    filterByEventType: true,
    allowKeyboard: true,
    allowMouse: false,
    allowScroll: true
}

// 타입 안전성을 갖춘 필터 적용
iohook.setEventFilter(filterOptions)

// 부분 필터 업데이트
const partialFilter: Partial<EventFilterOptions> = {
    filterByCoordinates: true,
    minX: 100,
    maxX: 800
}

iohook.setEventFilter(partialFilter)
```

### 타입 안전한 필터 함수
```typescript
// 일반적인 필터링 패턴을 위한 헬퍼 함수
function createProcessFilter(processId: number, exclude: boolean = false): EventFilterOptions {
    return {
        filterByProcessId: true,
        targetProcessId: processId,
        excludeProcessId: exclude
    }
}

function createCoordinateFilter(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
): EventFilterOptions {
    return {
        filterByCoordinates: true,
        minX,
        maxX,
        minY,
        maxY
    }
}

function createEventTypeFilter(
    allowKeyboard: boolean = true,
    allowMouse: boolean = true,
    allowScroll: boolean = true
): EventFilterOptions {
    return {
        filterByEventType: true,
        allowKeyboard,
        allowMouse,
        allowScroll
    }
}

// 통합 필터 인터페이스를 사용한 사용법
iohook.setEventFilter(createProcessFilter(1234, false))
iohook.setEventFilter(createCoordinateFilter(0, 1920, 0, 1080))
iohook.setEventFilter(createEventTypeFilter(true, false, true))
```

### 직접 네이티브 필터 메서드
```typescript
// 타입 안전한 직접 필터 메서드 (더 효율적)
// 프로세스 필터링
iohook.setProcessFilter(1234, false)  // 프로세스 1234만 포함
iohook.setProcessFilter(5678, true)   // 프로세스 5678 제외

// 좌표 필터링
iohook.setCoordinateFilter(0, 0, 1920, 1080)  // 화면 경계

// 이벤트 타입 필터링
iohook.setEventTypeFilter(true, false, true)  // 키보드 + 스크롤만
iohook.setEventTypeFilter(false, true, false) // 마우스 이벤트만

// 모든 필터 제거 (권장)
iohook.clearFilters()

// DEPRECATED: clearFilters() 사용 권장
iohook.clearEventFilter()  // 하위 호환성을 위해 여전히 작동함
```

### 직접 메서드용 타입 정의
```typescript
// 직접 필터 메서드 시그니처
declare function setProcessFilter(processId: number, exclude: boolean): void
declare function setCoordinateFilter(minX: number, minY: number, maxX: number, maxY: number): void
declare function setEventTypeFilter(allowKeyboard: boolean, allowMouse: boolean, allowScroll: boolean): void
declare function clearFilters(): void
declare function clearEventFilter(): void  // DEPRECATED
```

## TypeScript를 사용한 Electron 통합

### 타입 안전한 메인 프로세스
```typescript
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import * as iohook from 'iohook-macos'
import type { EventData } from 'iohook-macos'

interface ElectronWindow extends BrowserWindow {
    sendEventToRenderer(eventName: string, data: EventData): void
}

function createWindow(): ElectronWindow {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    }) as ElectronWindow

    // 타입 안전한 메서드 추가
    mainWindow.sendEventToRenderer = (eventName: string, data: EventData) => {
        mainWindow.webContents.send(eventName, data)
    }

    // 타입 안전한 이벤트 전달
    iohook.on('keyDown', (data: EventData) => {
        mainWindow.sendEventToRenderer('globalKeyDown', data)
    })

    iohook.on('leftMouseDown', (data: EventData) => {
        mainWindow.sendEventToRenderer('globalMouseClick', data)
    })

    return mainWindow
}

// 타입 안전한 IPC 핸들러
ipcMain.handle('checkPermissions', (): AccessibilityPermissionsResult => {
    return iohook.checkAccessibilityPermissions()
})

ipcMain.handle('startMonitoring', (): boolean => {
    try {
        iohook.startMonitoring()
        return true
    } catch (error) {
        console.error('모니터링 시작 실패:', error)
        return false
    }
})
```

### 타입 안전한 IPC 통신
```typescript
// 렌더러 프로세스 타입
import { ipcRenderer, IpcRendererEvent } from 'electron'
import type { EventData, AccessibilityPermissionsResult } from 'iohook-macos'

// 타입 안전한 이벤트 핸들러
ipcRenderer.on('globalKeyDown', (event: IpcRendererEvent, data: EventData) => {
    console.log('글로벌 키 눌림:', data.keyCode)
    // 키보드 입력에 따른 타입 안전한 UI 업데이트
    if (data.hasKeyCode && data.keyCode) {
        handleGlobalKeyPress(data.keyCode)
    }
})

ipcRenderer.on('globalMouseClick', (event: IpcRendererEvent, data: EventData) => {
    if (data.x !== undefined && data.y !== undefined) {
        console.log(`글로벌 마우스 클릭: (${data.x}, ${data.y})`)
        handleGlobalMouseClick(data.x, data.y)
    }
})

// 타입 안전한 IPC 호출
async function checkPermissions(): Promise<AccessibilityPermissionsResult> {
    return await ipcRenderer.invoke('checkPermissions')
}

async function startMonitoring(): Promise<boolean> {
    return await ipcRenderer.invoke('startMonitoring')
}

// 타입 안전성을 갖춘 UI 함수
function handleGlobalKeyPress(keyCode: number): void {
    // 타입 안전성을 갖춘 구현
}

function handleGlobalMouseClick(x: number, y: number): void {
    // 타입 안전성을 갖춘 구현
}
```

## 타입을 사용한 권한 처리

### 타입 안전한 권한 관리
```typescript
// 타입화된 결과를 갖춘 권한 확인
async function ensurePermissions(): Promise<boolean> {
    const result: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
    
    if (!result.hasPermissions) {
        console.log('권한 상태:', result.message)
        
        // 타입 안전한 권한 요청
        // 시스템 환경설정 > 개인정보 보호 및 보안 > 손쉬운 사용을 엽니다
        const requestResult: AccessibilityPermissionsResult = iohook.requestAccessibilityPermissions()
        console.log('요청 결과:', requestResult.message)
        // 반환값: { hasPermissions: false, message: "시스템 환경설정을 여는 중..." }
        
        return false
    }
    
    return true
}

// 적절한 에러 처리와 함께 사용
async function initializeMonitoring(): Promise<void> {
    try {
        const hasPermissions = await ensurePermissions()
        
        if (hasPermissions) {
            iohook.startMonitoring()
            console.log('모니터링이 성공적으로 시작되었습니다')
        } else {
            throw new Error('접근성 권한이 허용되지 않았습니다')
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('초기화 실패:', error.message)
        }
    }
}
```

### AccessibilityPermissionsResult 인터페이스
```typescript
// 권한 결과를 위한 타입 정의
interface AccessibilityPermissionsResult {
    hasPermissions: boolean  // 현재 권한 상태
    message: string          // 상태 설명
}

// checkAccessibilityPermissions()와 requestAccessibilityPermissions()
// 모두 같은 구조를 반환합니다
const checkResult: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
const requestResult: AccessibilityPermissionsResult = iohook.requestAccessibilityPermissions()
```

## TypeScript를 사용한 일반적인 사용 사례

### 타입 안전한 글로벌 단축키
```typescript
interface ModifierKeys {
    cmd: boolean
    shift: boolean
    alt: boolean
    ctrl: boolean
}

class GlobalShortcutManager {
    private modifiers: ModifierKeys = {
        cmd: false,
        shift: false,
        alt: false,
        ctrl: false
    }

    private readonly KEY_CODES = {
        CMD: 55,
        SHIFT: 56,
        ALT: 58,
        CTRL: 59,
        SPACE: 49
    } as const

    constructor() {
        this.setupEventListeners()
    }

    private setupEventListeners(): void {
        iohook.on('keyDown', (event: EventData) => {
            this.updateModifiers(event, true)
            this.checkShortcuts(event)
        })

        iohook.on('keyUp', (event: EventData) => {
            this.updateModifiers(event, false)
        })
    }

    private updateModifiers(event: EventData, pressed: boolean): void {
        if (!event.keyCode) return

        switch (event.keyCode) {
            case this.KEY_CODES.CMD:
                this.modifiers.cmd = pressed
                break
            case this.KEY_CODES.SHIFT:
                this.modifiers.shift = pressed
                break
            case this.KEY_CODES.ALT:
                this.modifiers.alt = pressed
                break
            case this.KEY_CODES.CTRL:
                this.modifiers.ctrl = pressed
                break
        }
    }

    private checkShortcuts(event: EventData): void {
        if (!event.keyCode) return

        // Cmd+Shift+Space
        if (event.keyCode === this.KEY_CODES.SPACE && 
            this.modifiers.cmd && 
            this.modifiers.shift) {
            this.onCmdShiftSpace()
        }
    }

    private onCmdShiftSpace(): void {
        console.log('글로벌 단축키 Cmd+Shift+Space 실행!')
        // 타입 안전한 액션 구현
    }
}

// 사용법
const shortcutManager = new GlobalShortcutManager()
```

### 타입 안전한 마우스 추적
```typescript
interface MousePosition {
    x: number
    y: number
    timestamp: number
}

class MouseTracker {
    private positions: MousePosition[] = []
    private lastTrackTime: number = 0
    private readonly THROTTLE_MS = 50 // 20fps

    constructor() {
        this.setupTracking()
    }

    private setupTracking(): void {
        iohook.on('mouseMoved', (event: EventData) => {
            if (this.shouldTrack(event)) {
                this.addPosition(event)
            }
        })
    }

    private shouldTrack(event: EventData): boolean {
        const now = Date.now()
        return (now - this.lastTrackTime > this.THROTTLE_MS) &&
               (event.x !== undefined && event.y !== undefined)
    }

    private addPosition(event: EventData): void {
        if (event.x === undefined || event.y === undefined) return

        const position: MousePosition = {
            x: event.x,
            y: event.y,
            timestamp: event.timestamp
        }

        this.positions.push(position)
        this.lastTrackTime = Date.now()

        // 최근 100개 위치만 유지
        if (this.positions.length > 100) {
            this.positions.shift()
        }

        this.onPositionUpdate(position)
    }

    private onPositionUpdate(position: MousePosition): void {
        console.log(`마우스 위치: (${position.x}, ${position.y})`)
    }

    public getRecentPositions(count: number = 10): MousePosition[] {
        return this.positions.slice(-count)
    }

    public clearHistory(): void {
        this.positions = []
    }
}

// 사용법
const mouseTracker = new MouseTracker()
```

## TypeScript를 사용한 에러 처리

### 타입 안전한 에러 관리
```typescript
// 사용자 정의 에러 타입
class PermissionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PermissionError'
    }
}

class MonitoringError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MonitoringError'
    }
}

// 타입 안전한 모니터링 설정
class EventMonitor {
    private isActive: boolean = false

    public async start(): Promise<void> {
        try {
            await this.checkPermissions()
            this.startMonitoring()
            this.isActive = true
            console.log('이벤트 모니터링이 성공적으로 시작되었습니다')
        } catch (error) {
            this.handleError(error)
        }
    }

    private async checkPermissions(): Promise<void> {
        const result: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
        
        if (!result.hasPermissions) {
            throw new PermissionError(`접근성 권한이 허용되지 않았습니다: ${result.message}`)
        }
    }

    private startMonitoring(): void {
        try {
            iohook.startMonitoring()
        } catch (error) {
            throw new MonitoringError('시스템 이벤트 모니터링 시작에 실패했습니다')
        }
    }

    private handleError(error: unknown): void {
        if (error instanceof PermissionError) {
            console.error('권한 오류:', error.message)
            console.log('시스템 환경설정에서 접근성 권한을 허용해 주세요')
        } else if (error instanceof MonitoringError) {
            console.error('모니터링 오류:', error.message)
        } else if (error instanceof Error) {
            console.error('알 수 없는 오류:', error.message)
        } else {
            console.error('예상치 못한 오류:', error)
        }
    }

    public stop(): void {
        if (this.isActive) {
            iohook.stopMonitoring()
            this.isActive = false
            console.log('이벤트 모니터링이 중지되었습니다')
        }
    }

    public get isMonitoring(): boolean {
        return this.isActive && iohook.isMonitoring()
    }
}

// 적절한 정리와 함께 사용
const monitor = new EventMonitor()

process.on('SIGINT', () => {
    console.log('종료 중...')
    monitor.stop()
    process.exit(0)
})

monitor.start()
```

## 이벤트 타입 참조

### 타입 정의
```typescript
// 완전한 이벤트 타입 매핑
type CGEventTypeString = 
    | "null"
    | "leftMouseDown" | "leftMouseUp"
    | "rightMouseDown" | "rightMouseUp"
    | "mouseMoved"
    | "leftMouseDragged" | "rightMouseDragged"
    | "keyDown" | "keyUp" | "flagsChanged"
    | "scrollWheel"
    | "tabletPointer" | "tabletProximity"
    | "otherMouseDown" | "otherMouseUp" | "otherMouseDragged"

type CGEventTypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 | 22 | 23 | 24 | 25 | 26 | 27

// 이벤트 타입 유틸리티 함수
function isKeyboardEventType(type: number): boolean {
    return type === 10 || type === 11 || type === 12 // keyDown, keyUp, flagsChanged
}

function isMouseEventType(type: number): boolean {
    return [1, 2, 3, 4, 5, 6, 7, 25, 26, 27].includes(type)
}

function isScrollEventType(type: number): boolean {
    return type === 22 // scrollWheel
}

// 타입 안전한 이벤트 분류
function categorizeEvent(event: EventData): 'keyboard' | 'mouse' | 'scroll' | 'other' {
    if (isKeyboardEventType(event.type)) return 'keyboard'
    if (isMouseEventType(event.type)) return 'mouse'
    if (isScrollEventType(event.type)) return 'scroll'
    return 'other'
}
```

이 가이드는 완전한 타입 안전성을 갖춘 `iohook-macos`의 포괄적인 TypeScript 사용 패턴을 제공합니다. 견고하고 유지보수 가능한 이벤트 처리 구현을 위해 TypeScript의 타입 시스템을 활용하는 데 집중하세요. 