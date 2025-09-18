// aws-functions/src/shared/db.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK v3
const isOffline = process.env.IS_OFFLINE;

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isOffline && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    }
  })
});

// Create Document client for easier operations
export const dynamodb = DynamoDBDocumentClient.from(client);

// Table names from environment variables (set by serverless.yml)
export const USERS_TABLE = process.env.USERS_TABLE!;
export const BIRTHDAYS_TABLE = process.env.BIRTHDAYS_TABLE!;
// Helper functions
export const dbGet = async (tableName: string, key: any) => {
  const command = new GetCommand({
    TableName: tableName,
    Key: key
  });
  return dynamodb.send(command);
};

export const dbPut = async (tableName: string, item: any) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: item
  });
  return dynamodb.send(command);
};

export const dbQuery = async (params: any) => {
  const command = new QueryCommand(params);
  return dynamodb.send(command);
};

export const dbScan = async (params: any) => {
  const command = new ScanCommand(params);
  return dynamodb.send(command);
};

export const dbUpdate = async (params: any) => {
  const command = new UpdateCommand(params);
  return dynamodb.send(command);
};

export const dbDelete = async (tableName: string, key: any) => {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key
  });
  return dynamodb.send(command);
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