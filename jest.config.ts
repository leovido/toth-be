module.exports = {
  collectCoverage: true,
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  setupFilesAfterEnv: ["./setupTests.ts"],
  testEnvironment: "jest-environment-node",
};
