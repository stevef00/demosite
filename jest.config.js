module.exports = {
  // Run tests in a browser-like environment
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Load custom jest setup for additional matchers
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
