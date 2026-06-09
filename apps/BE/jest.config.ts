export default {
  displayName: 'BE',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/constants$': '<rootDir>/../../libs/qu-constants/src/index.ts',
    '^@shared/dtos$': '<rootDir>/../../libs/dtos/src/index.ts',
    '^@quack/mongoose/(.*)$': '<rootDir>/../../mongoose/$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/BE',
  testMatch: [
    '<rootDir>/src/test/**/*.api-spec.ts',
    '<rootDir>/src/test/**/*.util.spec.ts',
  ],
  globalSetup: '<rootDir>/src/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/setup/global-teardown.ts',
  maxWorkers: 1,
};
