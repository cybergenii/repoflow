"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommitMessage = generateCommitMessage;
exports.generateVariedCommitMessage = generateVariedCommitMessage;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const COMMIT_TEMPLATES = [
    '🚀 Launch initial project structure',
    '✨ Add core functionality and features',
    '🔧 Implement configuration and setup',
    '📝 Update documentation and README',
    '🎨 Improve UI/UX and styling',
    '🐛 Fix critical bugs and issues',
    '⚡ Optimize performance and speed',
    '🔒 Enhance security measures',
    '📱 Add responsive design elements',
    '🌟 Introduce new innovative features',
    '🧹 Clean up code and refactor',
    '🔍 Add comprehensive testing',
    '📊 Integrate analytics and monitoring',
    '🎯 Improve user experience flow',
    '🛠️ Upgrade dependencies and tools',
    '💡 Add helpful utility functions',
    '🎉 Celebrate milestone achievements',
    '🔄 Refine existing functionality',
    '📈 Boost application metrics',
    '✅ Complete feature implementation'
];
async function generateCommitMessage(directory) {
    try {
        const { stdout } = await execAsync('git status --porcelain', { cwd: directory });
        const lines = stdout.split('\n').filter(line => line.trim());
        const filesAdded = lines.filter(line => line.startsWith('A')).length;
        const filesModified = lines.filter(line => line.startsWith('M')).length;
        const filesDeleted = lines.filter(line => line.startsWith('D')).length;
        const projectName = directory.split('/').pop() || 'project';
        // Check if this is initial commit
        try {
            await execAsync('git log --oneline -1', { cwd: directory });
        }
        catch {
            return `🎉 Initial commit for ${projectName} project`;
        }
        // Generate message based on changes
        if (filesAdded > 0 && filesModified === 0 && filesDeleted === 0) {
            return `✨ Add ${filesAdded} new files to ${projectName}`;
        }
        else if (filesModified > 0 && filesAdded === 0 && filesDeleted === 0) {
            return `🔧 Update ${filesModified} files in ${projectName}`;
        }
        else if (filesDeleted > 0 && filesAdded === 0 && filesModified === 0) {
            return `🗑️ Remove ${filesDeleted} files from ${projectName}`;
        }
        else {
            return `🚀 Update ${projectName} (${filesAdded} added, ${filesModified} modified, ${filesDeleted} deleted)`;
        }
    }
    catch (error) {
        // Fallback to random template
        const randomTemplate = COMMIT_TEMPLATES[Math.floor(Math.random() * COMMIT_TEMPLATES.length)];
        return randomTemplate || 'Update project';
    }
}
function generateVariedCommitMessage(commitNumber, _totalCommits, baseMessage, projectName) {
    if (commitNumber === 1 && baseMessage) {
        return baseMessage;
    }
    const templateIndex = (commitNumber - 1) % COMMIT_TEMPLATES.length;
    const template = COMMIT_TEMPLATES[templateIndex];
    return projectName ? `${template} for ${projectName}` : (template || 'Update project');
}
//# sourceMappingURL=commit-messages.js.map