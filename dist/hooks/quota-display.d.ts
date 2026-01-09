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
export declare function createQuotaDisplayHook(): {
    "tool.execute.after": (_input: ToolExecuteInput, output: ToolExecuteOutput) => Promise<void>;
};
export {};
//# sourceMappingURL=quota-display.d.ts.map