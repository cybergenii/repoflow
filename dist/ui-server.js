#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startUIServer = startUIServer;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const git_1 = require("./services/git");
const github_1 = require("./services/github");
const config_1 = require("./utils/config");
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../ui/dist')));
// API Routes
app.get('/api/status', async (req, res) => {
    try {
        const git = new git_1.GitService(req.query['dir'] || process.cwd());
        const status = await git.getStatus();
        res.json({ success: true, data: status });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/commits', async (req, res) => {
    try {
        const git = new git_1.GitService(req.query['dir'] || process.cwd());
        const count = parseInt(req.query['count'] || '10') || 10;
        const commits = await git.getCommits(count);
        res.json({ success: true, data: commits });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/create-repo', async (req, res) => {
    try {
        const config = await (0, config_1.loadConfig)();
        const github = new github_1.GitHubService(config.github);
        const result = await github.createRepository(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/commit', async (req, res) => {
    try {
        const { directory, options } = req.body;
        const git = new git_1.GitService(directory || process.cwd());
        await git.addFiles();
        await git.commit(options);
        res.json({ success: true, message: 'Commit created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/push', async (req, res) => {
    try {
        const { directory, options } = req.body;
        const git = new git_1.GitService(directory || process.cwd());
        await git.push('origin', 'main', options);
        res.json({ success: true, message: 'Push completed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/validate-token', async (req, res) => {
    try {
        const { token } = req.body;
        const github = new github_1.GitHubService({ token });
        const isValid = await github.validateToken();
        res.json({ success: true, valid: isValid });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Serve UI
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../ui/dist/index.html'));
});
async function startUIServer(options = {}) {
    const port = options.port || PORT;
    const host = options.host || 'localhost';
    app.listen(Number(port), host, () => {
        console.log(`🚀 RepoFlow UI server running at http://${host}:${port}`);
        if (options.open) {
            const { exec } = require('child_process');
            const url = `http://${host}:${port}`;
            const start = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
            exec(`${start} ${url}`);
        }
    });
}
if (require.main === module) {
    startUIServer();
}
//# sourceMappingURL=ui-server.js.map