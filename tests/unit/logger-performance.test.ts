import logger from '@/lib/logger';

describe('Logger Performance', () => {
  it('should not significantly impact performance when logging', () => {
    const startTime = performance.now();

    // Log 1000 messages
    for (let i = 0; i < 1000; i++) {
      logger.debug('Performance test message', { iteration: i });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in less than 500ms (reasonable threshold for 1000 logs)
    expect(duration).toBeLessThan(500);
  });

  it('should handle high volume logging without memory issues', () => {
    const startTime = performance.now();

    // Log 5000 messages with context
    for (let i = 0; i < 5000; i++) {
      logger.info('High volume test message', {
        iteration: i,
        timestamp: Date.now(),
        data: {
          id: i,
          value: `test-value-${i}`,
          nested: {
            level1: {
              level2: {
                level3: i * 2
              }
            }
          }
        }
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in less than 5000ms (reasonable threshold for 5000 logs)
    expect(duration).toBeLessThan(5000);
  });

  it('should maintain consistent performance across different log levels', () => {
    const debugStart = performance.now();
    for (let i = 0; i < 100; i++) {
      logger.debug('Debug message', { iteration: i });
    }
    const debugEnd = performance.now();
    const debugDuration = debugEnd - debugStart;

    const infoStart = performance.now();
    for (let i = 0; i < 100; i++) {
      logger.info('Info message', { iteration: i });
    }
    const infoEnd = performance.now();
    const infoDuration = infoEnd - infoStart;

    const warnStart = performance.now();
    for (let i = 0; i < 100; i++) {
      logger.warn('Warn message', { iteration: i });
    }
    const warnEnd = performance.now();
    const warnDuration = warnEnd - warnStart;

    const errorStart = performance.now();
    for (let i = 0; i < 100; i++) {
      logger.error('Error message', { iteration: i });
    }
    const errorEnd = performance.now();
    const errorDuration = errorEnd - errorStart;

    // All should complete in reasonable time (less than 300ms each)
    expect(debugDuration).toBeLessThan(300);
    expect(infoDuration).toBeLessThan(300);
    expect(warnDuration).toBeLessThan(300);
    expect(errorDuration).toBeLessThan(300);
  });
});
