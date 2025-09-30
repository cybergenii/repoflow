import { GitHubService } from '../services/github';

describe('GitHubService', () => {
  let githubService: GitHubService;

  beforeEach(() => {
    githubService = new GitHubService({
      token: 'test-token',
      username: 'testuser',
      email: 'test@example.com'
    });
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(githubService).toBeDefined();
    });
  });

  describe('validateToken', () => {
    it('should be a function', () => {
      expect(typeof githubService.validateToken).toBe('function');
    });
  });

  describe('createRepository', () => {
    it('should be a function', () => {
      expect(typeof githubService.createRepository).toBe('function');
    });
  });
});
