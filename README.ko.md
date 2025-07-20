# iohook-macos

## 📖 문서
**[English](README.md)** | **[한국어](README.ko.md)**

[![npm version](https://badge.fury.io/js/iohook-macos.svg)](https://badge.fury.io/js/iohook-macos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![macOS](https://img.shields.io/badge/macOS-10.15+-green.svg)](https://www.apple.com/macos/)
[![Electron](https://img.shields.io/badge/Electron-Compatible-lightblue.svg)](https://www.electronjs.org/)

**완전한 TypeScript 지원**을 제공하는 Electron 애플리케이션용 고성능 macOS 시스템 이벤트 후킹 라이브러리입니다.

## 🤖 AI 지원 문서

이 라이브러리는 AI 어시스턴트가 라이브러리를 효과적으로 이해하고 구현할 수 있도록 돕는 포괄적인 AI 최적화 문서를 포함하고 있습니다. 이러한 전문 가이드는 AI에게 맥락적 사용 패턴과 모범 사례를 제공하도록 설계되었습니다.

### 사용 가능한 AI 사용 가이드

- **[CommonJS 가이드 (English)](docs/ai-usage-guide.commonjs.en.prompt.md)** - 완전한 CommonJS 패턴 및 구현
- **[CommonJS 가이드 (한국어)](docs/ai-usage-guide.commonjs.ko.prompt.md)** - CommonJS 패턴 및 구현 가이드
- **[ESM 가이드 (English)](docs/ai-usage-guide.esm.en.prompt.md)** - 최신 ES 모듈 문법 및 패턴
- **[ESM 가이드 (한국어)](docs/ai-usage-guide.esm.ko.prompt.md)** - 최신 ES 모듈 문법 및 패턴
- **[TypeScript 가이드 (English)](docs/ai-usage-guide.typescript.en.prompt.md)** - 타입 안전한 구현 및 패턴
- **[TypeScript 가이드 (한국어)](docs/ai-usage-guide.typescript.ko.prompt.md)** - 타입 안전한 구현 및 패턴
- **[개발 문서](docs/prd/macos_event_hook_library_dev_document.md)** - 기술 명세 및 아키텍처

이러한 가이드는 AI 어시스턴트가 macOS 애플리케이션에서 시스템 이벤트 후킹을 구현하는 데 정확하고 맥락적인 지원을 제공할 수 있게 합니다.

## 🎯 왜 iohook-macos인가?

기존의 macOS 이벤트 후킹 솔루션들은 종종 분산화와 복잡성 문제로 어려움을 겪고 있습니다. 개발자들은 여러 개의 서로 다른 라이브러리를 통합하고, 복잡한 네이티브 의존성을 관리하며, 이벤트 타입별로 일관성 없는 API를 다뤄야 했습니다. 이러한 분산된 생태계는 개발 오버헤드 증가, 유지보수 부담, 그리고 잠재적인 호환성 문제로 이어집니다.

**iohook-macos**는 이러한 문제들을 **통합되고 포괄적인 솔루션**을 제공함으로써 해결합니다. 모든 시스템 레벨 이벤트 모니터링 기능을 하나의 잘 설계된 라이브러리로 통합하여, 여러 의존성의 필요성을 제거하면서도 엔터프라이즈급 성능, 완전한 TypeScript 통합, 그리고 macOS Core Graphics Event Services의 근본적인 복잡성을 추상화하는 직관적인 API를 제공합니다.

키보드, 마우스, 스크롤 이벤트 처리에서 일관된 패턴을 제공하는 통합된 개발 경험을 통해, 개발자들은 인프라 구조적 문제와 씨름하는 대신 기능 구축에 집중할 수 있습니다.

## 🎯 기능

- **🎹 키보드 이벤트**: `keyDown`, `keyUp`, `flagsChanged`
- **🖱️ 마우스 이벤트**: 클릭, 이동, 드래그 (좌/우/기타 버튼)
- **🌀 스크롤 이벤트**: 마우스 휠 및 트랙패드 제스처
- **🔒 보안**: 내장된 접근성 권한 처리
- **⚡ 성능**: 설정 가능한 최적화된 폴링 모드
- **🎛️ 필터링**: 프로세스 ID, 좌표 범위, 이벤트 타입 필터
- **🛡️ 타입 안전성**: 완전한 TypeScript 정의 포함
- **📊 모니터링**: 실시간 큐 모니터링 및 통계

## 📦 설치

```bash
npm install iohook-macos
```

### 사전 요구사항

- **macOS 10.15+** (Catalina 이상)
- **Node.js 14+**
- **Electron** (Electron 앱과 함께 사용하는 경우)
- **Xcode Command Line Tools**

## 🚀 빠른 시작

### JavaScript

```javascript
const iohook = require('iohook-macos')

// 접근성 권한 확인
const permissions = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
    console.log('접근성 권한을 허용해주세요')
    iohook.requestAccessibilityPermissions()
    process.exit(1)
}

// 이벤트 리스너 설정
iohook.on('keyDown', (event) => {
    console.log('키 눌림:', event.keyCode)
})

iohook.on('leftMouseDown', (event) => {
    console.log('마우스 클릭 위치:', event.x, event.y)
})

// 모니터링 시작
iohook.startMonitoring()
```

### TypeScript 🎉

```typescript
import * as iohook from 'iohook-macos'
import type { EventData, AccessibilityPermissionsResult } from 'iohook-macos'

// 타입 안전한 권한 확인
const permissions: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()

// 타입 안전한 이벤트 처리
iohook.on('keyDown', (event: EventData) => {
    console.log('키 눌림:', event.keyCode)
    console.log('이벤트 타입:', event.type) // CGEventType 숫자
})

// 숫자 기반 이벤트 리스너 (CGEventType)
iohook.on(1, (event: EventData) => { // kCGEventLeftMouseDown
    console.log('왼쪽 마우스 다운:', event.x, event.y)
})

// 완전한 타입 안전성으로 모니터링 시작
iohook.startMonitoring()
```

## 📚 TypeScript 지원

이 라이브러리는 완전한 타입 안전성과 IntelliSense 지원을 위한 포괄적인 TypeScript 정의를 포함합니다.

### 주요 타입들

```typescript
interface EventData {
    type: number           // CGEventType 정수값
    x?: number            // X 좌표 (마우스 이벤트)
    y?: number            // Y 좌표 (마우스 이벤트)
    timestamp: number     // 이벤트 타임스탬프
    processId?: number    // 소스 프로세스 ID
    keyCode?: number      // 키 코드 (키보드 이벤트)
    hasKeyCode?: boolean  // keyCode 사용 가능 여부
}

interface AccessibilityPermissionsResult {
    hasPermissions: boolean
    message: string
}

interface EventFilterOptions {
    filterByProcessId?: boolean
    excludeProcessId?: boolean
    targetProcessId?: number
    filterByCoordinates?: boolean
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
    filterByEventType?: boolean
    allowKeyboard?: boolean
    allowMouse?: boolean
    allowScroll?: boolean
}
```

### 이벤트 타입

문자열과 숫자 이벤트 타입 모두 완전 지원:

```typescript
// 문자열 기반 (가독성을 위해 권장)
iohook.on('keyDown', handler)
iohook.on('leftMouseDown', handler)
iohook.on('scrollWheel', handler)

// 숫자 기반 (CGEventType 정수)
iohook.on(10, handler)  // kCGEventKeyDown
iohook.on(1, handler)   // kCGEventLeftMouseDown
iohook.on(22, handler)  // kCGEventScrollWheel
```

### TypeScript 예제 실행

```bash
# TypeScript 의존성 설치
npm install

# TypeScript 예제 실행
npm run typescript-example

# TypeScript 예제 컴파일
npm run typescript-compile
```

## 🎛️ API 레퍼런스

### 핵심 메서드

| 메서드 | 설명 | 반환값 |
|--------|-----|-------|
| `startMonitoring()` | 이벤트 모니터링 시작 | `void` |
| `stopMonitoring()` | 이벤트 모니터링 중지 | `void` |
| `isMonitoring()` | 모니터링 상태 확인 | `boolean` |

### 폴링 제어

| 메서드 | 설명 | 매개변수 |
|--------|-----|---------|
| `setPollingRate(ms)` | 폴링 간격 설정 | `ms: number` |
| `getQueueSize()` | 이벤트 큐 크기 조회 | - |
| `clearQueue()` | 이벤트 큐 비우기 | - |
| `getNextEvent()` | 다음 이벤트 수동 조회 | - |

### 성능

| 메서드 | 설명 | 매개변수 |
|--------|-----|---------|
| `enablePerformanceMode()` | 고성능 모드 활성화 | - |
| `disablePerformanceMode()` | 성능 모드 비활성화 | - |
| `setMouseMoveThrottling(ms)` | 마우스 이동 이벤트 제한 | `ms: number` |
| `setVerboseLogging(enable)` | 상세 로깅 제어 | `enable: boolean` |

### 필터링

| 메서드 | 설명 | 매개변수 |
|--------|-----|---------|
| `setEventFilter(options)` | 이벤트 필터 설정 | `options: EventFilterOptions` |
| `clearEventFilter()` | 모든 필터 해제 | - |

## 🔒 접근성 권한

macOS는 시스템 이벤트 모니터링을 위해 접근성 권한을 요구합니다:

```javascript
// 권한 확인
const result = iohook.checkAccessibilityPermissions()
console.log(result.hasPermissions) // boolean
console.log(result.message)        // 설명 메시지

// 권한 요청 (시스템 다이얼로그 표시)
if (!result.hasPermissions) {
    iohook.requestAccessibilityPermissions()
}
```

**수동 설정:**
1. **시스템 환경설정** → **보안 및 개인정보 보호** → **개인정보 보호** 열기
2. 왼쪽 패널에서 **손쉬운 사용** 선택
3. 자물쇠 아이콘을 클릭하고 비밀번호 입력
4. 목록에 애플리케이션 추가

## 📊 이벤트 모니터링

### 기본 이벤트 처리

```javascript
// 특정 이벤트 수신
iohook.on('keyDown', (event) => {
    console.log(`키 ${event.keyCode} 눌림`)
})

iohook.on('mouseMoved', (event) => {
    console.log(`마우스 위치 (${event.x}, ${event.y})`)
})

// 범용 이벤트 리스너
iohook.on('event', (event) => {
    console.log(`이벤트 타입: ${event.type}`)
})
```

### 이벤트 필터링

```javascript
// 프로세스 ID로 필터링
iohook.setEventFilter({
    filterByProcessId: true,
    targetProcessId: 1234,
    excludeProcessId: false // 이 프로세스만 포함
})

// 화면 좌표로 필터링
iohook.setEventFilter({
    filterByCoordinates: true,
    minX: 0, maxX: 1920,
    minY: 0, maxY: 1080
})

// 이벤트 타입으로 필터링
iohook.setEventFilter({
    filterByEventType: true,
    allowKeyboard: true,
    allowMouse: true,
    allowScroll: false
})
```

## 🎮 Electron 통합

```javascript
// 메인 프로세스 (main.js)
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

    // 이벤트 전달 설정
    iohook.on('keyDown', (data) => {
        mainWindow.webContents.send('keyDown', data)
    })

    iohook.startMonitoring()
}

app.whenReady().then(createWindow)
```

## 🧪 예제

저장소에는 포괄적인 예제들이 포함되어 있습니다:

- **JavaScript**: `examples/test/`
- **TypeScript**: `examples/typescript/`
- **Electron**: `examples/electron/`

```bash
# 기본 테스트 실행
npm test

# 포괄적인 테스트 실행
npm run test-comprehensive

# Electron 예제 실행
npm run electron-test

# TypeScript 예제 실행
npm run typescript-example
```

## ⚡ 성능 최적화

```javascript
// 성능 모드 활성화
iohook.enablePerformanceMode()

// 최적 폴링 속도 설정 (60fps)
iohook.setPollingRate(16)

// 고빈도 마우스 이벤트 제한
iohook.setMouseMoveThrottling(16)

// 큐 크기 모니터링
setInterval(() => {
    const queueSize = iohook.getQueueSize()
    if (queueSize > 100) {
        console.warn('큐가 커지고 있습니다:', queueSize)
    }
}, 1000)
```

## 🛠️ 개발

### 소스에서 빌드

```bash
# 의존성 설치
npm install

# 네이티브 모듈 재빌드
npm run rebuild

# Electron용
npm run electron-rebuild
```

### 요구사항

- **Xcode** Command Line Tools 포함
- **Python 3** (node-gyp용)
- **Node.js 14+**

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 작성
4. 해당하는 경우 테스트 추가
5. 풀 리퀘스트 제출

## 📄 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Node.js N-API](https://nodejs.org/api/n-api.html)로 구축
- macOS [Core Graphics Event Services](https://developer.apple.com/documentation/coregraphics/core_graphics_event_services) 사용
- 크로스 플랫폼 [iohook](https://github.com/wilix-team/iohook) 라이브러리에서 영감을 받음

---

**macOS 개발자들을 위해 ❤️로 만들어졌습니다** 