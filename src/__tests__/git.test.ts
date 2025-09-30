import { GitService } from '../services/git';

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    gitService = new GitService(process.cwd());
  });

  describe('extractRepoName', () => {
    it('should extract repository name from GitHub URL', () => {
      const url = 'https://github.com/cybergenii/repoflow.git';
      const repoName = (gitService as any).extractRepoName(url);
      expect(repoName).toBe('repoflow');
    });

    it('should extract repository name from GitHub URL without .git', () => {
      const url = 'https://github.com/cybergenii/repoflow';
      const repoName = (gitService as any).extractRepoName(url);
      expect(repoName).toBe('repoflow');
    });

    it('should return unknown for invalid URL', () => {
      const url = 'https://example.com/not-github';
      const repoName = (gitService as any).extractRepoName(url);
      expect(repoName).toBe('unknown');
    });
  });
});
