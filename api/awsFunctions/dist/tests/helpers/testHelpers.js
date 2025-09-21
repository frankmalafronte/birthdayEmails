"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTable = void 0;
const db_1 = require("../../src/shared/db");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const clearTable = async (tableName) => {
    console.log('Trying to clear table:', tableName);
    const scanCommand = new lib_dynamodb_1.ScanCommand({ TableName: tableName });
    const result = await db_1.dynamodb.send(scanCommand);
    for (const item of result.Items || []) {
        const deleteCommand = new lib_dynamodb_1.DeleteCommand({
            TableName: tableName,
            Key: { id: item.id }
        });
        await db_1.dynamodb.send(deleteCommand);
    }
};
exports.clearTable = clearTable;
