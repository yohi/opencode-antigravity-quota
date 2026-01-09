"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quota_display_js_1 = require("./hooks/quota-display.js");
const AntigravityQuotaPlugin = async () => {
    const quotaDisplay = (0, quota_display_js_1.createQuotaDisplayHook)();
    return {
        "tool.execute.after": quotaDisplay["tool.execute.after"],
    };
};
exports.default = AntigravityQuotaPlugin;
//# sourceMappingURL=index.js.map