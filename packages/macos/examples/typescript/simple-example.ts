/**
 * iohook-macos Simple CLI Example (TypeScript)
 * 
 * 실행 방법:
 *   npx ts-node packages/macos/examples/typescript/simple-example.ts
 */

import iohook from '@iohook/macos'
import type { EventData, AccessibilityPermissionsResult } from '@iohook/macos'

console.log('🚀 iohook-macos Simple CLI Example (TypeScript)\n')

// 1. 권한 확인 (타입 안전)
console.log('📋 1. 접근성 권한 확인 중...')
const permissions: AccessibilityPermissionsResult = iohook.checkAccessibilityPermissions()
console.log(`   권한 상태: ${permissions.hasPermissions ? '✅ 허용됨' : '❌ 거부됨'}`)
console.log(`   메시지: ${permissions.message}\n`)

if (!permissions.hasPermissions) {
  console.log('🔐 2. 접근성 권한을 요청합니다...')
  console.log('   시스템 환경설정 → 보안 및 개인정보 보호 → 개인정보 보호 → 손쉬운 사용')
  console.log('   에서 이 앱을 추가해주세요.\n')
  iohook.requestAccessibilityPermissions()
  process.exit(1)
}

// 2. 이벤트 리스너 설정 (타입 안전 + 상세 로그)
console.log('📡 2. 이벤트 리스너 등록 중...')

// 키보드 이벤트 (타입 체크)
iohook.on('keyDown', (event: EventData) => {
  const timestamp = new Date(event.timestamp / 1000000).toISOString()
  console.log('⌨️  키 입력:', {
    keyCode: event.keyCode,
    timestamp,
    processId: event.processId,
    type: event.type,
    hasKeyCode: event.hasKeyCode
  })
})

// 마우스 클릭 이벤트 (타입 체크)
iohook.on('leftMouseDown', (event: EventData) => {
  const timestamp = new Date(event.timestamp / 1000000).toISOString()
  console.log('🖱️  마우스 클릭:', {
    x: event.x,
    y: event.y,
    timestamp,
    processId: event.processId,
    type: event.type
  })
})

// 스크롤 이벤트 (타입 체크)
iohook.on('scrollWheel', (event: EventData) => {
  const timestamp = new Date(event.timestamp / 1000000).toISOString()
  console.log('🌀 스크롤:', {
    x: event.x,
    y: event.y,
    timestamp,
    processId: event.processId,
    type: event.type
  })
})

// 범용 이벤트 리스너 (모든 이벤트)
iohook.on('event', (event: EventData) => {
  const timestamp = new Date(event.timestamp / 1000000).toISOString()
  console.log('📢 범용 이벤트:', {
    type: event.type,
    timestamp,
    processId: event.processId,
    ...(event.x !== undefined && { x: event.x }),
    ...(event.y !== undefined && { y: event.y }),
    ...(event.keyCode !== undefined && { keyCode: event.keyCode })
  })
})

console.log('   ✅ 이벤트 리스너 등록 완료\n')

// 3. 모니터링 시작
console.log('🎬 3. 이벤트 모니터링 시작...')
iohook.startMonitoring()
console.log('   ✅ 모니터링 중... (Ctrl+C로 종료)\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// 4. 종료 처리
process.on('SIGINT', () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🛑 모니터링 중지 중...')
  iohook.stopMonitoring()
  console.log('✅ 종료 완료')
  process.exit(0)
})