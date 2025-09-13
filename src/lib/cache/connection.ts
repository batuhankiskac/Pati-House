import Redis from 'ioredis';

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis;

  private constructor() {
    // Create Redis client with configuration from environment variables
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Handle connection events
    this.client.on('connect', () => {
      console.log('[Redis] Connected to Redis server');
    });

    this.client.on('ready', () => {
      console.log('[Redis] Redis client is ready');
    });

    this.client.on('error', (err) => {
      console.error('[Redis] Redis connection error:', err);
    });

    this.client.on('close', () => {
      console.log('[Redis] Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('[Redis] Redis client reconnecting');
    });
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('[Redis] Error disconnecting from Redis:', error);
    }
  }

  public isConnected(): boolean {
    return this.client.status === 'ready';
  }
}

// Export a singleton instance
const redisConnection = RedisConnection.getInstance();
export default redisConnection;
