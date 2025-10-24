# @iohook/shared

Shared utilities for iohook packages - Event emitters, loggers, and event type definitions used across all iohook platform implementations.

## Overview

This package provides common functionality used by:
- [@iohook/macos](https://www.npmjs.com/package/@iohook/macos)
- [@iohook/windows](https://www.npmjs.com/package/@iohook/windows)
- [@iohook/crossplatform](https://www.npmjs.com/package/@iohook/crossplatform)

## Installation

```bash
npm install @iohook/shared
```

> **Note**: This package is typically installed automatically as a dependency of other @iohook packages. You usually don't need to install it directly unless you're building custom integrations.

## Exports

### Event Emitter
```javascript
import { IOHookEventEmitter } from '@iohook/shared';
```

### Logger
```javascript
import { Logger } from '@iohook/shared';
```

### Event Types
```javascript
import { CGEventTypes, EventTypeToInt } from '@iohook/shared';
```

## Usage Example

```javascript
import { IOHookEventEmitter, Logger } from '@iohook/shared';

const emitter = new IOHookEventEmitter();
const logger = new Logger('MyApp');

emitter.on('event', (data) => {
  logger.info('Event received:', data);
});
```

## API

### IOHookEventEmitter

Event emitter implementation used for handling system events.

### Logger

Logging utility with support for different log levels.

### CGEventTypes

Core Graphics event type constants (macOS).

### EventTypeToInt

Helper function to convert event types to integer values.

## Related Packages

- [@iohook/macos](https://www.npmjs.com/package/@iohook/macos) - macOS native event hooks
- [@iohook/windows](https://www.npmjs.com/package/@iohook/windows) - Windows native event hooks
- [@iohook/crossplatform](https://www.npmjs.com/package/@iohook/crossplatform) - Cross-platform wrapper

## License

MIT

## Repository

[GitHub - iohook-macos](https://github.com/hwanyong/iohook-macos)