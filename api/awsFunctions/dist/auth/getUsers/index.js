"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const db_1 = require("../../shared/db");
const handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        console.log('Fetching all users from database');
        const scanParams = {
            TableName: db_1.USERS_TABLE,
            ProjectionExpression: 'id, email, #name, createdAt, updatedAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        };
        const result = await (0, db_1.dbScan)(scanParams);
        const users = (result.Items || []).map(item => ({
            id: item.id,
            email: item.email,
            name: item.name,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));
        console.log(`Successfully retrieved ${users.length} users`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                users,
                count: users.length,
                message: `Retrieved ${users.length} users`
            })
        };
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch users. Please try again later.'
            })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map