import '@testing-library/jest-dom';

// Mock Tauri API
const mockInvoke = jest.fn();
const mockSave = jest.fn();

jest.mock('@tauri-apps/api/tauri', () => ({
  invoke: mockInvoke,
}));

jest.mock('@tauri-apps/api/dialog', () => ({
  save: mockSave,
}));

// Reset mocks before each test
beforeEach(() => {
  mockInvoke.mockReset();
  mockSave.mockReset();
});

// Make mocks available globally for tests
global.mockTauriInvoke = mockInvoke;
global.mockTauriSave = mockSave;
