import { test, expect } from '@playwright/test';
import { DynamoDBClient, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const BASE_URL = process.env.LAMBDA_ENDPOINT || 'http://localhost:3000/dev';

// Configure DynamoDB for local testing
const dynamodb = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

async function clearBirthdaysTable() {
  const tableName = 'birthday-app-backend-birthdays-dev';

  // Scan all items
  const scanCommand = new ScanCommand({ TableName: tableName });
  const result = await dynamodb.send(scanCommand);

  // Delete each item
  for (const item of result.Items || []) {
    const deleteCommand = new DeleteItemCommand({
      TableName: tableName,
      Key: { id: item.id }
    });
    await dynamodb.send(deleteCommand);
  }
}

test.describe('AddBirthday API Integration Tests', () => {

  test.beforeEach(async () => {
    await clearBirthdaysTable();
  });

  const testBirthday = {
    name: 'John Doe',
    birthDate: '1990-06-15'
  };

  // TODO(human) - Add comprehensive tests for addBirthday endpoint
  // 1. Test successful birthday creation (201 status, correct response structure)
  // 2. Test missing required fields validation (400 status)
  // 3. Test invalid date format validation (400 status)
  // 4. Test response includes birthday data with generated ID
  // Remember: your endpoint is POST /dev/birthdays

});