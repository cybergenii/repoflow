import { loadConfig, saveConfig } from '../utils/config';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

// Mock os
jest.mock('os', () => ({
  homedir: () => '/home/test',
}));

describe('Config Utils', () => {
  describe('loadConfig', () => {
    it('should return default config when file does not exist', async () => {
      const { readFile } = require('fs/promises');
      readFile.mockRejectedValueOnce(new Error('File not found'));

      const config = await loadConfig();
      
      expect(config).toEqual({
        github: {
          token: process.env['GITHUB_TOKEN'] || '',
          username: process.env['GITHUB_USERNAME'] || '',
          email: process.env['GITHUB_EMAIL'] || ''
        },
        defaultBranch: 'main',
        defaultAuthor: {
          name: process.env['GIT_USER_NAME'] || '',
          email: process.env['GIT_USER_EMAIL'] || ''
        }
      });
    });
  });

  describe('saveConfig', () => {
    it('should be a function', () => {
      expect(typeof saveConfig).toBe('function');
    });
  });
});
