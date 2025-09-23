#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        const github = new github_1.GitHubService();
        const repoUrl = await github.createRepository(req.body.name, req.body.private);
        res.json({ success: true, data: { cloneUrl: repoUrl, htmlUrl: repoUrl.replace('.git', '') } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/config', async (_req, res) => {
    try {
        const configService = new (await Promise.resolve().then(() => __importStar(require('./utils/config')))).ConfigService();
        const config = await configService.loadConfig();
        res.json({ success: true, data: config });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/config', async (req, res) => {
    try {
        const configService = new (await Promise.resolve().then(() => __importStar(require('./utils/config')))).ConfigService();
        await configService.saveConfig(req.body);
        res.json({ success: true, message: 'Configuration saved successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/github/repos', async (_req, res) => {
    try {
        // This would need to be implemented in GitHubService
        res.json({ success: true, data: [] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/auto-push', async (_req, res) => {
    try {
        // This would implement the auto-push logic
        res.json({ success: true, message: 'Auto-push completed successfully' });
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