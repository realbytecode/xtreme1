/**
 * Jest setup file
 * Provides global mocks and configuration for tests
 */

// Mock import.meta for Vite environment variables
(global as any).importMeta = {
    env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
    },
};

// Make import.meta available globally
Object.defineProperty(global, 'import', {
    value: {
        meta: (global as any).importMeta,
    },
    writable: true,
    configurable: true,
});
