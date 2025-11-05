# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ **Modifiers Object**: All events now include a parsed `modifiers` object with automatic modifier key state detection
  - Provides boolean flags for: `shift`, `control`, `option`, `command`, `capsLock`, `fn`
  - Available on all event types (keyboard, mouse, scroll, etc.), not just `flagsChanged`
  - Eliminates need for manual bitwise operations on flags
  - Improves developer experience with cleaner, more intuitive API
  - Example: `event.modifiers.shift` instead of `(event.flags & 0x00020000) !== 0`
- ✨ **Missing API Methods**: Added previously missing methods to JavaScript wrapper
  - `requestAccessibilityPermissions()` - Opens system dialog to request accessibility permissions
  - `setProcessFilter(processId, exclude)` - Direct native process ID filtering
  - `setCoordinateFilter(minX, minY, maxX, maxY)` - Direct native coordinate range filtering
  - `setEventTypeFilter(allowKeyboard, allowMouse, allowScroll)` - Direct native event type filtering
  - `clearFilters()` - Consistent naming with native module
- ✨ **Enhanced Event Filtering**: Improved `setEventFilter()` method now properly delegates to native filter functions
- Initial release of iohook-macos
- macOS system event hook library for Electron applications
- Support for keyboard, mouse, and scroll events
- TypeScript definitions and full type safety
- Accessibility permission handling
- Performance optimization features
- Event filtering and modification capabilities
- Comprehensive documentation and examples

### Changed
- 🔄 **API Consistency**: Renamed `clearEventFilter()` to `clearFilters()` for consistency with native module
  - Old method name retained as deprecated alias for backward compatibility

### Deprecated
- ⚠️ `clearEventFilter()` - Use `clearFilters()` instead (backward compatibility alias maintained)

### Removed
- N/A

### Fixed
- 🐛 **Critical Bug**: Fixed missing `requestAccessibilityPermissions()` method in JavaScript wrapper
  - Method was declared in TypeScript definitions and documented in README, but implementation was missing
  - This caused runtime errors when users tried to call the method as shown in documentation
- 🐛 **API Inconsistency**: Fixed mismatch between JavaScript wrapper and native module method names
  - `clearEventFilter()` now properly delegates to native `clearFilters()`
  - Added direct access to native filter methods that were previously inaccessible
- 🐛 **Event Filtering**: Fixed `setEventFilter()` to properly delegate to native functions
  - Previously attempted to call non-existent native `setEventFilter()`
  - Now correctly calls `setProcessFilter()`, `setCoordinateFilter()`, and `setEventTypeFilter()`

### Security
- N/A

## [0.1.0] - 2024-01-01

### Added
- Initial project structure
- Basic event monitoring functionality
- Native module implementation
- Documentation and examples 