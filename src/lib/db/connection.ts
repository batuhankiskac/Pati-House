import { Pool } from 'pg';
import { types } from 'pg';
import { CONNECTION_CONFIG } from '@/lib/config';
import logger from '@/lib/logger';

// Parse numeric types as floats instead of strings
types.setTypeParser(types.builtins.NUMERIC, (value: string) => parseFloat(value));
types.setTypeParser(types.builtins.INT8, (value: string) => parseInt(value, 10));

// Parse date types as Date objects instead of strings
types.setTypeParser(types.builtins.DATE, (value: string) => new Date(value));

class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    // Create a connection pool
    this.pool = new Pool({
      // connectionString: process.env.DATABASE_URL,
      connectionString: CONNECTION_CONFIG.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      min: 5,  // Minimum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.database(text, duration, res.rowCount ?? undefined);
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Database query failed', {
        query: text,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public async close() {
    await this.pool.end();
  }
}

// Export a singleton instance
const db = DatabaseConnection.getInstance();
export default db;
