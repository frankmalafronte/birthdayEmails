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

async function clearUsersTable() {
  const tableName = 'birthday-app-backend-users-dev';

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

test.describe('CreateUser API Integration Tests', () => {

  test.beforeEach(async () => {
    await clearUsersTable();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }

  test('should create user', async ({ request }) => {
    const email = `test-${Date.now()}@example.com`
    const response = await request.post(`${BASE_URL}/auth/register`, {
      data: {
        ...testUser,
        email: email
      }
    })


    let body;
    try {
      body = await response.json();
    } catch (error) {
      const textBody = await response.text();
      throw error;
    }

    expect(response.status()).toBe(201);
    expect(body.user.email).toBe(email);
    expect(body.user.name).toBe('Test User');
    expect(body.user.password).toBeUndefined(); // Password should NOT be in response
  });

  test('should reject duplicate user with 409 status', async ({ request }) => {
    // Create User
     const duplicateUser = {
    email: 'duplicateUser@example.com',
    password: 'password123',
    name: 'Test User'
     }
      const response = await request.post(`${BASE_URL}/auth/register`, {
        data: {
          ...duplicateUser,
        }
      })

      const body = await response.json()
        expect(response.status()).toBe(201);


    // Send the same user again
    const secondResponse = await request.post(`${BASE_URL}/auth/register`, {
      data: {
        ...duplicateUser,
      }
    })
    expect(secondResponse.status()).toBe(409);
  })
});