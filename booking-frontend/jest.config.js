// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest loads this config via Node's CommonJS loader.
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    testMatch: ['<rootDir>/tests/**/*.test.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
};

module.exports = createJestConfig(customJestConfig);
