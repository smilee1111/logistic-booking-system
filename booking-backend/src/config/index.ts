import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config();

// Load config.env from config directory
export const LOCAL_DATABASE_URI: string =
    process.env.LOCAL_DATABASE_URI || 'mongodb://localhost:27017/bookio';
//local MongoDB URI

export const PORT: number =
    process.env.PORT ? parseInt(process.env.PORT) : 5050;
//ensure PORT is a number, and fallback if not found
//avoid exception if env is missing
