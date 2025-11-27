export default {
  preset: 'ts-jest',
  roots: ['<rootDir>/tests/'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'ts', 'vue', 'tsx', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>/src', '<rootDir>/node_modules'],
  testMatch: [
    '**/tests/unit/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/setup\\.ts$',
  ],
  globals: {
    'import.meta': {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'esnext',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
    '^.+\\.m?jsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(vs|fs|vert|frag|glsl|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.ts',
    '\\.(sass|s?css|less)$': '<rootDir>/tests/__mocks__/styleMock.ts',
    '^three/examples/jsm/controls/OrbitControls$': '<rootDir>/tests/__mocks__/three.ts',
    '^three/examples/jsm/math/Lut$': '<rootDir>/tests/__mocks__/three.ts',
    '^three/examples/jsm/libs/stats\\.module\\.js$': '<rootDir>/tests/__mocks__/stats.ts',
    '^three$': '<rootDir>/tests/__mocks__/three.ts',
    '^nanoid$': '<rootDir>/tests/__mocks__/nanoid.ts',
    '^pc-render$': '<rootDir>/src/packages/pc-render',
    '^pc-editor$': '<rootDir>/src/packages/pc-editor',
    '^/@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{js,ts,vue}'],
  coveragePathIgnorePatterns: ['^.+\\.d\\.ts$'],
};
