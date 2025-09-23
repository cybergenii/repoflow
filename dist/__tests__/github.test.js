"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("../services/github");
describe('GitHubService', () => {
    let githubService;
    beforeEach(() => {
        githubService = new github_1.GitHubService({
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
//# sourceMappingURL=github.test.js.map