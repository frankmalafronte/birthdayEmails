"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbDelete = exports.dbUpdate = exports.dbScan = exports.dbQuery = exports.dbPut = exports.dbGet = exports.BIRTHDAYS_TABLE = exports.USERS_TABLE = exports.dynamodb = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});
exports.dynamodb = new aws_sdk_1.default.DynamoDB.DocumentClient();
exports.USERS_TABLE = process.env.USERS_TABLE || 'birthday-app-users';
exports.BIRTHDAYS_TABLE = process.env.BIRTHDAYS_TABLE || 'birthday-app-birthdays';
const dbGet = (tableName, key) => {
    return exports.dynamodb.get({
        TableName: tableName,
        Key: key
    }).promise();
};
exports.dbGet = dbGet;
const dbPut = (tableName, item) => {
    return exports.dynamodb.put({
        TableName: tableName,
        Item: item
    }).promise();
};
exports.dbPut = dbPut;
const dbQuery = (params) => {
    return exports.dynamodb.query(params).promise();
};
exports.dbQuery = dbQuery;
const dbScan = (params) => {
    return exports.dynamodb.scan(params).promise();
};
exports.dbScan = dbScan;
const dbUpdate = (params) => {
    return exports.dynamodb.update(params).promise();
};
exports.dbUpdate = dbUpdate;
const dbDelete = (tableName, key) => {
    return exports.dynamodb.delete({
        TableName: tableName,
        Key: key
    }).promise();
};
exports.dbDelete = dbDelete;
//# sourceMappingURL=db.js.map