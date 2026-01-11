import type { PluginInput } from "@opencode-ai/plugin";
interface ToolExecuteInput {
    tool: string;
    sessionID: string;
    callID: string;
}
interface ToolExecuteOutput {
    title: string;
    output: string;
    metadata: unknown;
}
export declare function createQuotaDisplayHook(client: PluginInput["client"]): (input: ToolExecuteInput, _output: ToolExecuteOutput) => Promise<void>;
export {};
//# sourceMappingURL=quota-display.d.ts.map