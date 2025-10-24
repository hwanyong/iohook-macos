/**
 * @iohook/crossplatform - Cross-platform Event Hook Library
 * 
 * Automatically detects the platform and loads the appropriate implementation.
 * Supports macOS and Windows platforms.
 */

import { Logger } from '@iohook/shared';

const logger = new Logger('CrossPlatform');

/**
 * Detect the current platform and return the appropriate implementation
 * @returns {Promise<Object>} Platform-specific event hook implementation
 */
async function loadPlatformImplementation() {
  const platform = process.platform;
  
  logger.log(`Detected platform: ${platform}`);

  switch (platform) {
    case 'darwin': {
      logger.log('Loading macOS implementation...');
      const macosModule = await import('@iohook/macos');
      return macosModule.default || macosModule;
    }
    
    case 'win32': {
      logger.log('Loading Windows implementation...');
      const windowsModule = await import('@iohook/windows');
      return windowsModule.default || windowsModule;
    }
    
    default:
      logger.error(`Unsupported platform: ${platform}`);
      throw new Error(
        `Platform "${platform}" is not supported. ` +
        `Currently supported platforms: darwin (macOS), win32 (Windows)`
      );
  }
}

/**
 * Create and export the platform-specific event hook instance
 */
const iohook = await loadPlatformImplementation();

// Export the platform-specific instance as default
export default iohook;

// Re-export shared types and utilities for convenience
export { Logger, IOHookEventEmitter, CGEventTypes, EventTypeToInt } from '@iohook/shared';