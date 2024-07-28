/* eslint-disable @typescript-eslint/no-var-requires */
import { pathsToModuleNameMapper } from 'ts-jest';

module.exports = {
  collectCoverage: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFilesAfterEnv: ['./setupTests.ts'],
  moduleNameMapper: pathsToModuleNameMapper(
    { '@/*': ['src/*'] },
    {
      prefix: '<rootDir>/'
    }
  )
};
