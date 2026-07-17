// Runs before any test file (and therefore before any app code) is imported.
// dotenv.config() in src/config/index.ts does not override already-set
// process.env values, so setting these here first points the whole test run
// at a separate database — dev data is never touched.
process.env.NODE_ENV = 'test';
process.env.LOCAL_DATABASE_URI =
    process.env.LOCAL_DATABASE_URI ?? 'mongodb://127.0.0.1:27017/bookio_test';
