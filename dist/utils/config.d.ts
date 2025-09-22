import { RepoFlowConfig } from '../types';
export declare class ConfigService {
    loadConfig(): Promise<{
        username: string;
        email: string;
        token: string;
    }>;
    saveConfig(updates: Partial<{
        username: string;
        email: string;
        token: string;
    }>): Promise<void>;
}
export declare function loadConfig(): Promise<RepoFlowConfig>;
export declare function saveConfig(config: RepoFlowConfig): Promise<void>;
export declare function getConfigPath(): Promise<string>;
//# sourceMappingURL=config.d.ts.map