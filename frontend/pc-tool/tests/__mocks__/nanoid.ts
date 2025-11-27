/**
 * Mock for nanoid library
 * Returns unique IDs for testing
 */

let counter = 0;

export function nanoid(size?: number): string {
    counter++;
    const id = `test-id-${counter}`;
    if (size) {
        return id.padEnd(size, '0').slice(0, size);
    }
    return id;
}

export function customAlphabet(alphabet: string, size: number) {
    return function () {
        return nanoid(size);
    };
}

export default nanoid;
