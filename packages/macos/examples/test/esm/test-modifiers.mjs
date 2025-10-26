/**
 * iohook-macos Modifiers Test (ESM)
 * 
 * Tests the new modifiers object feature
 * 
 * 실행 방법:
 *   node packages/macos/examples/test/esm/test-modifiers.mjs
 */

import iohook from '@iohook/macos'

console.log('🚀 iohook-macos Modifiers Test\n')
console.log('='.repeat(80))
console.log('This test demonstrates the new modifiers object feature')
console.log('Press various modifier keys (Shift, Control, Option, Command, Caps Lock)')
console.log('and observe how they are automatically parsed')
console.log('='.repeat(80))
console.log()

// 1. 권한 확인
const permissions = iohook.checkAccessibilityPermissions()
if (!permissions.hasPermissions) {
  console.error('❌ Accessibility permissions required!')
  console.log(permissions.message)
  console.log('\nRequesting permissions...')
  iohook.requestAccessibilityPermissions()
  console.log('Please grant permissions and restart this test.')
  process.exit(1)
}

console.log('✅ Accessibility permissions granted\n')

// Event counters
let eventCounts = {
  flagsChanged: 0,
  keyDown: 0,
  keyUp: 0,
  total: 0
}

// Helper function to format modifiers
function formatModifiers(modifiers) {
  const active = []
  if (modifiers.command) active.push('⌘ Command')
  if (modifiers.option) active.push('⌥ Option')
  if (modifiers.control) active.push('⌃ Control')
  if (modifiers.shift) active.push('⇧ Shift')
  if (modifiers.capsLock) active.push('⇪ Caps Lock')
  if (modifiers.fn) active.push('Fn')
  return active.length > 0 ? active.join(' + ') : 'None'
}

// Listen for flagsChanged events (modifier keys)
iohook.on('flagsChanged', (event) => {
  eventCounts.flagsChanged++
  eventCounts.total++
  
  const { modifiers } = event
  const modifierString = formatModifiers(modifiers)
  
  console.log('[flagsChanged]')
  console.log(`  Active Modifiers: ${modifierString}`)
  console.log(`  Details:`)
  console.log(`    - Shift:    ${modifiers.shift}`)
  console.log(`    - Control:  ${modifiers.control}`)
  console.log(`    - Option:   ${modifiers.option}`)
  console.log(`    - Command:  ${modifiers.command}`)
  console.log(`    - CapsLock: ${modifiers.capsLock}`)
  console.log(`    - Fn:       ${modifiers.fn}`)
  console.log(`  Raw Flags: 0x${event.flags.toString(16).toUpperCase()}`)
  console.log('─'.repeat(80))
})

// Listen for keyboard events with modifiers
iohook.on('keyDown', (event) => {
  eventCounts.keyDown++
  eventCounts.total++
  
  const { modifiers } = event
  const mods = []
  if (modifiers.command) mods.push('Cmd')
  if (modifiers.option) mods.push('Opt')
  if (modifiers.control) mods.push('Ctrl')
  if (modifiers.shift) mods.push('Shift')
  const modStr = mods.length > 0 ? ` with [${mods.join('+')}]` : ''
  
  console.log(`[keyDown] KeyCode: ${event.keyCode}${modStr}`)
})

iohook.on('keyUp', (event) => {
  eventCounts.keyUp++
  eventCounts.total++
  
  const { modifiers } = event
  const mods = []
  if (modifiers.command) mods.push('Cmd')
  if (modifiers.option) mods.push('Opt')
  if (modifiers.control) mods.push('Ctrl')
  if (modifiers.shift) mods.push('Shift')
  const modStr = mods.length > 0 ? ` with [${mods.join('+')}]` : ''
  
  console.log(`[keyUp] KeyCode: ${event.keyCode}${modStr}`)
})

// Mouse events also have modifiers
iohook.on('leftMouseDown', (event) => {
  const { modifiers } = event
  if (modifiers.command || modifiers.shift || modifiers.option || modifiers.control) {
    const modStr = formatModifiers(modifiers)
    console.log(`[mouseClick] at (${Math.round(event.x)}, ${Math.round(event.y)}) with ${modStr}`)
  }
})

// Statistics display
setInterval(() => {
  console.log('\n📊 Event Statistics:')
  console.log(`   flagsChanged: ${eventCounts.flagsChanged}`)
  console.log(`   keyDown: ${eventCounts.keyDown}`)
  console.log(`   keyUp: ${eventCounts.keyUp}`)
  console.log(`   Total: ${eventCounts.total}`)
  console.log(`   Queue Size: ${iohook.getQueueSize()}`)
  console.log('─'.repeat(80))
}, 10000) // Every 10 seconds

// Start monitoring
try {
  iohook.startMonitoring()
  console.log('✅ Monitoring started successfully')
  console.log('\n📋 Test Instructions:')
  console.log('   1. Press and release various modifier keys:')
  console.log('      - ⌘ Command')
  console.log('      - ⌥ Option')
  console.log('      - ⌃ Control')
  console.log('      - ⇧ Shift')
  console.log('      - ⇪ Caps Lock')
  console.log('   2. Try combinations (e.g., Command+Shift)')
  console.log('   3. Press regular keys with modifiers')
  console.log('   4. Click mouse with modifiers held')
  console.log('   5. Press Ctrl+C to exit\n')
  console.log('🎯 Listening for events...')
  console.log('─'.repeat(80))
} catch (error) {
  console.error('❌ Failed to start monitoring:', error.message)
  process.exit(1)
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...')
  
  iohook.stopMonitoring()
  
  console.log('\n📊 Final Statistics:')
  console.log(`   flagsChanged events: ${eventCounts.flagsChanged}`)
  console.log(`   keyDown events: ${eventCounts.keyDown}`)
  console.log(`   keyUp events: ${eventCounts.keyUp}`)
  console.log(`   Total events: ${eventCounts.total}`)
  console.log('\n✅ Test completed')
  
  process.exit(0)
})