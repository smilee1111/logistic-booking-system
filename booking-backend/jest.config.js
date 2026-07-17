/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    // otplib's crypto deps (@scure, @noble) ship as pure ESM — Jest's default
    // pattern skips all of node_modules, so these need to be explicitly
    // un-ignored to get transpiled instead of hitting a raw `export` syntax error.
    transformIgnorePatterns: ['/node_modules/(?!(@scure|@noble|@otplib|otplib)/)'],
    setupFiles: ['<rootDir>/tests/setupEnv.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    clearMocks: true,
    testTimeout: 15000,
};
