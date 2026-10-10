import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5050,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shopsmart_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'shopsmart-ai-super-secret-jwt-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  USE_LOCAL_STORAGE: process.env.USE_LOCAL_STORAGE === 'true'
};

