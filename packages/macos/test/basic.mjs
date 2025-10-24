/**
 * Basic module loading test for @iohook/macos
 */

console.log('Testing @iohook/macos package...');

try {
  // Test importing the module
  const { default: iohook } = await import('../index.mjs');
  
  console.log('✓ Module loaded successfully');
  console.log('✓ iohook instance:', typeof iohook);
  
  // Test shared module
  const shared = await import('@iohook/shared');
  console.log('✓ @iohook/shared loaded successfully');
  console.log('✓ CGEventTypes available:', typeof shared.CGEventTypes);
  console.log('✓ Logger available:', typeof shared.Logger);
  
  console.log('\nAll basic tests passed!');
  process.exit(0);
} catch (error) {
  console.error('✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}