"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommitMessage = generateCommitMessage;
exports.generateVariedCommitMessage = generateVariedCommitMessage;
exports.generateRandomCommitMessage = generateRandomCommitMessage;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const COMMIT_TEMPLATES = [
    'Initial project setup and configuration',
    'Add core features and functionality',
    'Implement user authentication system',
    'Update documentation and README',
    'Improve UI/UX and overall design',
    'Fix bugs and resolve issues',
    'Optimize performance and loading speed',
    'Enhance security and data protection',
    'Add responsive design for mobile',
    'Introduce new features and improvements',
    'Refactor code for better maintainability',
    'Add comprehensive test coverage',
    'Integrate analytics and tracking',
    'Improve user experience and flow',
    'Update dependencies and packages',
    'Add utility functions and helpers',
    'Implement API endpoints',
    'Enhance error handling and logging',
    'Update styles and themes',
    'Add database models and schemas',
    'Implement data validation',
    'Add file upload functionality',
    'Integrate third-party services',
    'Improve code organization',
    'Add environment configuration',
    'Implement caching mechanism',
    'Update build and deployment scripts',
    'Add user profile features',
    'Implement search functionality',
    'Enhance notification system',
    'Add pagination and filtering',
    'Implement real-time updates',
    'Update navigation and routing',
    'Add form validation',
    'Implement admin dashboard',
    'Enhance API documentation',
    'Add loading states and animations',
    'Implement data export features',
    'Update error pages and handling',
    'Add social media integration',
    'Implement email notifications',
    'Enhance accessibility features',
    'Add dark mode support',
    'Implement user settings page',
    'Update landing page design',
    'Add interactive components',
    'Implement dashboard analytics',
    'Enhance data visualization',
    'Add multi-language support',
    'Implement role-based access control'
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
    // First commit uses the base message or a default
    if (commitNumber === 1) {
        if (baseMessage && baseMessage !== 'Update project') {
            return baseMessage;
        }
        return 'Initial commit';
    }
    // Use different templates for different commits to make it look natural
    // Add some randomization based on commit number
    const seed = commitNumber * 7; // Simple deterministic "randomization"
    const templateIndex = seed % COMMIT_TEMPLATES.length;
    const template = COMMIT_TEMPLATES[templateIndex] || 'Update project';
    // Only 20% of commits mention project name to keep it natural
    const shouldMentionProject = projectName && (commitNumber % 5 === 0);
    if (shouldMentionProject) {
        return `${template} for ${projectName}`;
    }
    return template;
}
// Generate a random human-like commit message
function generateRandomCommitMessage() {
    const randomIndex = Math.floor(Math.random() * COMMIT_TEMPLATES.length);
    return COMMIT_TEMPLATES[randomIndex] || 'Update project';
}
//# sourceMappingURL=commit-messages.js.map