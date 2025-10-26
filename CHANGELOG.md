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
- New test file `test-modifiers.mjs` demonstrating modifiers usage
- Updated TypeScript definitions with `modifiers` object type

### Changed
- Event data structure now includes parsed modifier states in addition to raw flags
- All events now extract modifier flags from CGEvent, not just `flagsChanged` events
- Updated example test files to showcase modifiers feature

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [0.1.0] - 2024-01-01

### Added
- Initial project structure
- Basic event monitoring functionality
- Native module implementation
- Documentation and examples 