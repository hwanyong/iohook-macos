/**
 * 간단한 로깅 유틸리티 클래스 (CommonJS)
 * static 메서드로 직접 사용 가능하며, 필요시 인스턴스 생성도 가능
 */
class Logger {
  // Static 메서드 - Logger.log() 형태로 사용
  static log(message, ...args) {
    console.log(`[iohook] ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`[iohook] ERROR: ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.warn(`[iohook] WARN: ${message}`, ...args);
  }

  static info(message, ...args) {
    console.info(`[iohook] INFO: ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG) {
      console.debug(`[iohook] DEBUG: ${message}`, ...args);
    }
  }

  // 인스턴스 생성자 - 커스텀 prefix를 사용하고 싶을 때
  constructor(prefix = 'iohook') {
    this.prefix = prefix;
  }

  log(message, ...args) {
    console.log(`[${this.prefix}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[${this.prefix}] ERROR: ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[${this.prefix}] WARN: ${message}`, ...args);
  }

  info(message, ...args) {
    console.info(`[${this.prefix}] INFO: ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.debug(`[${this.prefix}] DEBUG: ${message}`, ...args);
    }
  }
}

module.exports = { Logger }