import logger from '@/lib/logger';
import fs from 'fs';
import path from 'path';

describe('Logger', () => {
  const testLogPath = path.join(__dirname, '../../logs/test.log');

  beforeEach(() => {
    // Ensure logs directory exists
    const logsDir = path.dirname(testLogPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Clear test log file
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  afterEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  it('should log debug messages', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'debug',
      transports: ['console'],
    });

    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

    testLogger.debug('Test debug message', { test: 'data' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test debug message'),
      expect.objectContaining({ test: 'data' })
    );

    consoleSpy.mockRestore();
  });

  it('should log info messages', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'info',
      transports: ['console'],
    });

    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    testLogger.info('Test info message', { test: 'data' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test info message'),
      expect.objectContaining({ test: 'data' })
    );

    consoleSpy.mockRestore();
  });

  it('should log warn messages', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'warn',
      transports: ['console'],
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    testLogger.warn('Test warn message', { test: 'data' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test warn message'),
      expect.objectContaining({ test: 'data' })
    );

    consoleSpy.mockRestore();
  });

  it('should log error messages', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'error',
      transports: ['console'],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    testLogger.error('Test error message', { test: 'data' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test error message'),
      expect.objectContaining({ test: 'data' })
    );

    consoleSpy.mockRestore();
  });

  it('should respect log level filtering', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'warn',
      transports: ['console'],
    });

    const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
    const infoSpy = jest.spyOn(console, 'info').mockImplementation();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    testLogger.debug('Debug message');
    testLogger.info('Info message');
    testLogger.warn('Warn message');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should handle error logging with stack traces', () => {
    const testLogger = new (logger.constructor as any)({
      level: 'error',
      transports: ['console'],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Test error');

    testLogger.error('Test error with stack', { test: 'data' }, error);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test error with stack'),
      expect.objectContaining({ test: 'data' })
    );

    consoleSpy.mockRestore();
  });
});
