"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getConfigPath = getConfigPath;
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.repoflow');
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, 'config.json');
async function loadConfig() {
    try {
        await promises_1.default.mkdir(CONFIG_DIR, { recursive: true });
        const data = await promises_1.default.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        // Return default config if file doesn't exist
        return {
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
        };
    }
}
async function saveConfig(config) {
    try {
        await promises_1.default.mkdir(CONFIG_DIR, { recursive: true });
        await promises_1.default.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
    catch (error) {
        throw new Error(`Failed to save configuration: ${error}`);
    }
}
async function getConfigPath() {
    return CONFIG_FILE;
}
//# sourceMappingURL=config.js.map