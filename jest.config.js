module.exports = {
  // Use the Node environment since jsdom is not available
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Load custom jest setup for additional matchers
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
