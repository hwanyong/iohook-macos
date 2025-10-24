const { default: iohook } = await import('@iohook/macos')

console.log('='.repeat(80));
console.log('Modifier Keys Test - iohook-macos');
console.log('='.repeat(80));

// Modifier flag masks (from macOS CGEventFlags)
const ModifierFlags = {
    AlphaShift: 0x00010000,  // Caps Lock
    Shift:      0x00020000,  // ⇧ Shift
    Control:    0x00040000,  // ⌃ Control
    Alternate:  0x00080000,  // ⌥ Option
    Command:    0x00100000,  // ⌘ Command
    NumericPad: 0x00200000,  // Numeric Pad
    Help:       0x00400000,  // Help key
    SecondaryFn:0x00800000   // Fn key
};

// Helper function to decode modifier flags
function decodeModifiers(flags) {
    const active = [];
    if (flags & ModifierFlags.Command) active.push('⌘ Command');
    if (flags & ModifierFlags.Alternate) active.push('⌥ Option');
    if (flags & ModifierFlags.Control) active.push('⌃ Control');
    if (flags & ModifierFlags.Shift) active.push('⇧ Shift');
    if (flags & ModifierFlags.AlphaShift) active.push('⇪ Caps Lock');
    if (flags & ModifierFlags.SecondaryFn) active.push('Fn');
    if (flags & ModifierFlags.NumericPad) active.push('NumPad');
    if (flags & ModifierFlags.Help) active.push('Help');
    
    return active.length > 0 ? active.join(' + ') : 'None';
}

// Check permissions
const permissions = iohook.checkAccessibilityPermissions();
if (!permissions.hasPermissions) {
    console.error('❌ Accessibility permissions required!');
    console.log(permissions.message);
    console.log('\nRequesting permissions...');
    iohook.requestAccessibilityPermissions();
    console.log('Please grant permissions and restart this test.');
    process.exit(1);
}

console.log('✅ Accessibility permissions granted');
console.log('');

// Event counters
let eventCounts = {
    flagsChanged: 0,
    keyDown: 0,
    keyUp: 0,
    total: 0
};

console.log('📋 Test Instructions:');
console.log('   1. Press and release various modifier keys:');
console.log('      - ⌘ Command');
console.log('      - ⌥ Option');
console.log('      - ⌃ Control');
console.log('      - ⇧ Shift');
console.log('      - ⇪ Caps Lock');
console.log('   2. Try combinations (e.g., Command+Shift)');
console.log('   3. Press Ctrl+C to exit');
console.log('');
console.log('🎯 Listening for modifier key events...');
console.log('─'.repeat(80));

// Listen for flagsChanged events (modifier keys)
iohook.on('flagsChanged', (event) => {
    eventCounts.flagsChanged++;
    eventCounts.total++;
    
    const modifiers = event.flags ? decodeModifiers(event.flags) : 'Unknown';
    
    console.log(`[flagsChanged] Modifiers: ${modifiers}`);
    console.log(`               Flags: 0x${event.flags.toString(16).toUpperCase()}`);
    console.log(`               Timestamp: ${event.timestamp.toFixed(3)}`);
    console.log('─'.repeat(80));
});

// Listen for regular key events for comparison
iohook.on('keyDown', (event) => {
    eventCounts.keyDown++;
    eventCounts.total++;
    
    console.log(`[keyDown] KeyCode: ${event.keyCode}`);
});

iohook.on('keyUp', (event) => {
    eventCounts.keyUp++;
    eventCounts.total++;
    
    console.log(`[keyUp] KeyCode: ${event.keyCode}`);
});

// Generic event listener for debugging
iohook.on('event', (event) => {
    const eventTypeName = iohook.CGEventTypes[event.type] || `Unknown(${event.type})`;
    
    // Only log non-keyboard/modifier events
    if (event.type !== 10 && event.type !== 11 && event.type !== 12) {
        console.log(`[${eventTypeName}] Type: ${event.type}`);
    }
});

// Statistics display
setInterval(() => {
    console.log('');
    console.log('📊 Event Statistics:');
    console.log(`   flagsChanged: ${eventCounts.flagsChanged}`);
    console.log(`   keyDown: ${eventCounts.keyDown}`);
    console.log(`   keyUp: ${eventCounts.keyUp}`);
    console.log(`   Total: ${eventCounts.total}`);
    console.log(`   Queue Size: ${iohook.getQueueSize()}`);
    console.log('─'.repeat(80));
}, 10000); // Every 10 seconds

// Start monitoring
try {
    iohook.startMonitoring();
    console.log('✅ Monitoring started successfully');
    console.log('');
} catch (error) {
    console.error('❌ Failed to start monitoring:', error.message);
    process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n');
    console.log('🛑 Shutting down...');
    
    iohook.stopMonitoring();
    
    console.log('');
    console.log('📊 Final Statistics:');
    console.log(`   flagsChanged events: ${eventCounts.flagsChanged}`);
    console.log(`   keyDown events: ${eventCounts.keyDown}`);
    console.log(`   keyUp events: ${eventCounts.keyUp}`);
    console.log(`   Total events: ${eventCounts.total}`);
    console.log('');
    console.log('✅ Test completed');
    
    process.exit(0);
});