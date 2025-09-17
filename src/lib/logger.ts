// Centralized logging utility for the application

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogTransport = 'console' | 'file';

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  transports: LogTransport[];
  file?: {
    path: string;
    maxSize: number; // in bytes
  };
}

import { LOGGING_CONFIG } from '@/lib/config';

// Default configuration
const isServerEnvironment = typeof window === 'undefined';

const defaultConfig: LoggerConfig = {
  level: LOGGING_CONFIG.LEVEL,
  transports: ['console', ...(isServerEnvironment ? ['file'] as LogTransport[] : [])],
  file: isServerEnvironment
    ? {
        path: LOGGING_CONFIG.FILE_PATH,
        maxSize: LOGGING_CONFIG.FILE_MAX_SIZE,
      }
    : undefined,
};

// Log level priorities (higher number = higher priority)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

type FsModule = typeof import('fs');
type PathModule = typeof import('path');

let fsModule: FsModule | null = null;
let pathModule: PathModule | null = null;

async function loadNodeModules() {
  if (!isServerEnvironment) {
    return null;
  }

  if (!fsModule) {
    fsModule = await import('fs');
  }

  if (!pathModule) {
    pathModule = await import('path');
  }

  return { fs: fsModule, path: pathModule };
}

class Logger {
  private config: LoggerConfig;
  private levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    if (!isServerEnvironment) {
      this.config.transports = this.config.transports.filter((transport) => transport !== 'file');
      this.config.file = undefined;
    } else {
      void this.ensureLogDirectory();
    }
  }

  // Check if log level should be logged based on configuration
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.level];
  }

 // Format log entry
 private formatLogEntry(entry: LogEntry): string {
   const baseFields: Record<string, any> = {
     timestamp: entry.timestamp,
     level: entry.level,
     message: entry.message,
     ...entry.context
   };

   if (entry.stack) {
     baseFields['stack'] = entry.stack;
   }

   return JSON.stringify(baseFields);
 }

  private async ensureLogDirectory(): Promise<void> {
    if (!this.config.file) return;

    const modules = await loadNodeModules();
    if (!modules) return;

    const { fs, path } = modules;
    const dir = path.dirname(this.config.file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Write to file with rotation
  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.file) return;

    try {
      const modules = await loadNodeModules();
      if (!modules) return;

      const { fs, path } = modules;
      const logLine = this.formatLogEntry(entry) + '\n';

      if (fs.existsSync(this.config.file.path)) {
        const stats = fs.statSync(this.config.file.path);
        if (stats.size > this.config.file.maxSize) {
          const rotatedPath = `${this.config.file.path}.${new Date().toISOString().replace(/[:.]/g, '-')}`;
          fs.renameSync(this.config.file.path, rotatedPath);
        }
      } else {
        const dir = path.dirname(this.config.file.path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      fs.appendFileSync(this.config.file.path, logLine);
    } catch (error) {
      console.error('Logger file transport error:', error);
    }
  }

  // Write to console
  private writeToConsole(entry: LogEntry): void {
    const formattedMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage, entry.context || '');
        break;
      case 'info':
        console.info(formattedMessage, entry.context || '');
        break;
      case 'warn':
        console.warn(formattedMessage, entry.context || '');
        break;
      case 'error':
        console.error(formattedMessage, entry.context || '');
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  // Log a message
  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack
    };

    // Write to all configured transports
    this.config.transports.forEach(transport => {
      switch (transport) {
        case 'console':
          this.writeToConsole(entry);
          break;
        case 'file':
          void this.writeToFile(entry);
          break;
      }
    });
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log('error', message, context, error?.stack);
  }

  // Specialized method for logging HTTP requests
  http(method: string, url: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    this.info(`HTTP ${message}`, {
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }

  // Specialized method for logging database queries
  database(query: string, duration: number, rowCount?: number, context?: Record<string, any>): void {
    this.debug(`DB Query: ${query}`, {
      duration,
      rowCount,
      ...context
    });
  }

  // Specialized method for logging cache operations
  cache(operation: string, key: string, duration: number, context?: Record<string, any>): void {
    this.debug(`Cache ${operation}: ${key}`, {
      operation,
      key,
      duration,
      ...context
    });
  }
}

// Create and export default logger instance
const logger = new Logger();
export default logger;

// Export types for use in other modules
export { Logger };
