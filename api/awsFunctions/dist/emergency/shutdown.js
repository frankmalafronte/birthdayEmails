"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event, context) => {
    console.log('🚨 EMERGENCY BILLING ALARM TRIGGERED - SHUTDOWN DISABLED FOR DEVELOPMENT');
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Emergency shutdown disabled for development',
            timestamp: new Date().toISOString()
        })
    };
};
exports.handler = handler;
//# sourceMappingURL=shutdown.js.map