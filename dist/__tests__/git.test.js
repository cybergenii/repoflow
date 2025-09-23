"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("../services/git");
describe('GitService', () => {
    let gitService;
    beforeEach(() => {
        gitService = new git_1.GitService(process.cwd());
    });
    describe('extractRepoName', () => {
        it('should extract repository name from GitHub URL', () => {
            const url = 'https://github.com/cybergenii/repoflow.git';
            const repoName = gitService.extractRepoName(url);
            expect(repoName).toBe('repoflow');
        });
        it('should extract repository name from GitHub URL without .git', () => {
            const url = 'https://github.com/cybergenii/repoflow';
            const repoName = gitService.extractRepoName(url);
            expect(repoName).toBe('repoflow');
        });
        it('should return unknown for invalid URL', () => {
            const url = 'https://example.com/not-github';
            const repoName = gitService.extractRepoName(url);
            expect(repoName).toBe('unknown');
        });
    });
});
//# sourceMappingURL=git.test.js.map