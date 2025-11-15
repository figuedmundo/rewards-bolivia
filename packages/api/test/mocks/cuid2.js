module.exports = {
  __esModule: true,
  default: jest.fn(() => 'mocked_cuid_global'),
  cuid: jest.fn(() => 'mocked_cuid_global'), // Also mock the named export just in case
};