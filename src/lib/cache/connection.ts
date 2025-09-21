import Redis from 'ioredis';
import { CONNECTION_CONFIG } from '@/lib/config';

type RedisClient = Pick<
  Redis,
  'get' | 'setex' | 'del' | 'keys' | 'quit' | 'connect' | 'on'
> & { status: Redis['status'] };

class NoopRedisClient implements RedisClient {
  status: Redis['status'] = 'end';

  async get(_key: string): Promise<string | null> {
    return null;
  }

  async setex(_key: string, _ttl: number, _value: string): Promise<'OK'> {
    return 'OK';
  }

  async del(..._keys: string[]): Promise<number> {
    return 0;
  }

  async keys(_pattern: string): Promise<string[]> {
    return [];
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }

  async connect(): Promise<void> {
    return;
  }

  on(_event: string, _listener: (...args: any[]) => void): this {
    return this;
  }
}

class RedisConnection {
  private static instance: RedisConnection;
  private client: RedisClient;
  private enabled = false;

  private constructor() {
    const redisUrl = CONNECTION_CONFIG.REDIS_URL;

    if (!redisUrl) {
      console.warn('[Redis] Redis URL not configured - cache disabled');
      this.client = new NoopRedisClient();
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.enabled = true;
    } catch (error) {
      console.error('[Redis] Failed to initialize Redis client:', error);
      this.client = new NoopRedisClient();
      return;
    }

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

  public getClient(): RedisClient {
    return this.client;
  }

  public async connect(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect to Redis:', error);
      this.enabled = false;
      this.client = new NoopRedisClient();
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.client.quit();
    } catch (error) {
      console.error('[Redis] Error disconnecting from Redis:', error);
    }
  }

  public isConnected(): boolean {
    return this.enabled && this.client.status === 'ready';
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export a singleton instance
const redisConnection = RedisConnection.getInstance();
export default redisConnection;
