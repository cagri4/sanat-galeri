import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  // helpers/ yalnizca yardimci kod icerir, test dosyasi degil
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/helpers/'],
  // Sahte ortam degiskenleri — bkz. jest.setup.ts
  setupFiles: ['<rootDir>/jest.setup.ts'],
}

export default config
