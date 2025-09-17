// Centralized configuration file for environment variables
// This file exports all configuration values used throughout the application

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  CATS_LIST: parseInt(process.env.CACHE_TTL_CATS_LIST || '300', 10),
  CATS_ITEM: parseInt(process.env.CACHE_TTL_CATS_ITEM || '600', 10),
  REQUESTS_LIST: parseInt(process.env.CACHE_TTL_REQUESTS_LIST || '300', 10),
  REQUESTS_ITEM: parseInt(process.env.CACHE_TTL_REQUESTS_ITEM || '600', 10),
};

// Authentication settings
export const AUTH_CONFIG = {
  SALT_ROUNDS: parseInt(process.env.AUTH_SALT_ROUNDS || '10', 10),
  SECRET_KEY: process.env.SECRET_KEY || 'fallback-secret-key',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret',
  COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'auth-token',
  COOKIE_MAX_AGE: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800', 10), // 7 days default
};

// API endpoints
export const API_ENDPOINTS = {
 CATS: process.env.NEXT_PUBLIC_API_CATS_BASE || '/api/cats',
  REQUESTS: process.env.NEXT_PUBLIC_API_REQUESTS_BASE || '/api/requests',
};

// Application URLs
export const APP_URLS = {
  BASE: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Database and cache connections
export const CONNECTION_CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/pati_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Standardized error messages
export const ERROR_MESSAGES = {
  UNEXPECTED_ERROR: 'Unexpected error occurred',
};

// Logging configuration
export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' || 'info',
  FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
  FILE_MAX_SIZE: parseInt(process.env.LOG_FILE_MAX_SIZE || '10485760', 10), // 10MB default
};
