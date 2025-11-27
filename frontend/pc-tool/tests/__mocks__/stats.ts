/**
 * Mock for three/examples/jsm/libs/stats.module.js
 * Provides a minimal stats implementation for testing
 */

export default function Stats() {
    return {
        dom: {
            style: {} as CSSStyleDeclaration,
        },
        begin: () => {},
        end: () => {},
        update: () => {},
    };
}
