/**
 * Système de logging professionnel pour Selectif
 * Utilise des niveaux de log et peut être désactivé en production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  includeTimestamp: boolean
  includeEmoji: boolean
}

const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  level: 'debug',
  includeTimestamp: true,
  includeEmoji: true,
}

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const emojiMap: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
}

class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return logLevels[level] >= logLevels[this.config.level]
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    let formatted = ''

    if (this.config.includeEmoji) {
      formatted += `${emojiMap[level]} `
    }

    if (this.config.includeTimestamp) {
      formatted += `[${new Date().toISOString()}] `
    }

    formatted += `[${level.toUpperCase()}] ${message}`

    return formatted
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }

  // Méthodes spécialisées avec emojis
  auth(message: string, ...args: any[]) {
    this.info(`🔐 ${message}`, ...args)
  }

  api(message: string, ...args: any[]) {
    this.info(`🌐 ${message}`, ...args)
  }

  database(message: string, ...args: any[]) {
    this.info(`💾 ${message}`, ...args)
  }

  success(message: string, ...args: any[]) {
    this.info(`✅ ${message}`, ...args)
  }

  fail(message: string, ...args: any[]) {
    this.error(`❌ ${message}`, ...args)
  }

  search(message: string, ...args: any[]) {
    this.info(`🔍 ${message}`, ...args)
  }

  ai(message: string, ...args: any[]) {
    this.info(`🤖 ${message}`, ...args)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for custom instances
export { Logger }
export type { LoggerConfig, LogLevel }
