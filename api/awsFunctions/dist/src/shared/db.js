"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = exports.dbDelete = exports.dbUpdate = exports.dbScan = exports.dbQuery = exports.dbPut = exports.dbGet = exports.BIRTHDAYS_TABLE = exports.USERS_TABLE = exports.dynamodb = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const isOffline = process.env.IS_OFFLINE;
const client = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(isOffline && {
        endpoint: 'http://localhost:8000',
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        }
    })
});
exports.dynamodb = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.USERS_TABLE = process.env.USERS_TABLE;
exports.BIRTHDAYS_TABLE = process.env.BIRTHDAYS_TABLE;
const dbGet = async (tableName, key) => {
    const command = new lib_dynamodb_1.GetCommand({
        TableName: tableName,
        Key: key
    });
    return exports.dynamodb.send(command);
};
exports.dbGet = dbGet;
const dbPut = async (tableName, item) => {
    const command = new lib_dynamodb_1.PutCommand({
        TableName: tableName,
        Item: item
    });
    return exports.dynamodb.send(command);
};
exports.dbPut = dbPut;
const dbQuery = async (params) => {
    const command = new lib_dynamodb_1.QueryCommand(params);
    return exports.dynamodb.send(command);
};
exports.dbQuery = dbQuery;
const dbScan = async (params) => {
    const command = new lib_dynamodb_1.ScanCommand(params);
    return exports.dynamodb.send(command);
};
exports.dbScan = dbScan;
const dbUpdate = async (params) => {
    const command = new lib_dynamodb_1.UpdateCommand(params);
    return exports.dynamodb.send(command);
};
exports.dbUpdate = dbUpdate;
const dbDelete = async (tableName, key) => {
    const command = new lib_dynamodb_1.DeleteCommand({
        TableName: tableName,
        Key: key
    });
    return exports.dynamodb.send(command);
};
exports.dbDelete = dbDelete;
const getUserByEmail = async (email) => {
    const result = await (0, exports.dbQuery)({
        TableName: exports.USERS_TABLE,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    });
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};
exports.getUserByEmail = getUserByEmail;
