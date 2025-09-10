// aws-functions/src/shared/db.ts
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const dynamodb = new AWS.DynamoDB.DocumentClient();

// Table names from environment variables
export const USERS_TABLE = process.env.USERS_TABLE || 'birthday-app-users';
export const BIRTHDAYS_TABLE = process.env.BIRTHDAYS_TABLE || 'birthday-app-birthdays';

// Helper functions
export const dbGet = (tableName: string, key: any) => {
  return dynamodb.get({
    TableName: tableName,
    Key: key
  }).promise();
};

export const dbPut = (tableName: string, item: any) => {
  return dynamodb.put({
    TableName: tableName,
    Item: item
  }).promise();
};

export const dbQuery = (params: AWS.DynamoDB.DocumentClient.QueryInput) => {
  return dynamodb.query(params).promise();
};

export const dbScan = (params: AWS.DynamoDB.DocumentClient.ScanInput) => {
  return dynamodb.scan(params).promise();
};

export const dbUpdate = (params: AWS.DynamoDB.DocumentClient.UpdateItemInput) => {
  return dynamodb.update(params).promise();
};

export const dbDelete = (tableName: string, key: any) => {
  return dynamodb.delete({
    TableName: tableName,
    Key: key
  }).promise();
};