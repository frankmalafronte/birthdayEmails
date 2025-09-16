// aws-functions/src/shared/db.ts
import AWS from 'aws-sdk';

// Configure AWS SDK
const isOffline = process.env.IS_OFFLINE;

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Use local DynamoDB when running offline
const dynamoDbOptions = isOffline ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : {};

export const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoDbOptions);

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

export const getUserByEmail = async (email: string) => {
    const result = await dbQuery({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  };