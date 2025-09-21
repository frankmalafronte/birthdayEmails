import { test, expect } from '@playwright/test';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { clearTable } from '../helpers/testHelpers';
import { handler as createUser } from '../../src/createUser/index';
import { handler as addBirthday } from '../../src/addBirthday/index';

test.describe('AddBirthday API Integration Tests', () => {

  test.beforeEach(async () => {
    await clearTable(process.env.BIRTHDAYS_TABLE!);
    await clearTable(process.env.USERS_TABLE!);

    // Create test user
    const createUserEvent: APIGatewayProxyEvent = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/auth/register',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: ''
    };

    await createUser(createUserEvent);
  });

  const testBirthday = {
    name: 'John Doe',
    birthDate: '1990-06-15',
    userEmail: 'test@example.com'
  };

  test('should add a birthday successfully', async () => {
    try {

      const event: APIGatewayProxyEvent = {
        body: JSON.stringify(testBirthday),
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'POST',
        isBase64Encoded: false,
        path: `/${process.env.STAGE || 'dev'}/birthdays`,
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: ''
      };

      const response = await addBirthday(event);

      console.log('Response status:', response.statusCode);
      console.log('Response body:', response.body);

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.birthday.name).toBe(testBirthday.name);
      expect(body.birthday.birthDate).toBe(testBirthday.birthDate);
      expect(body.birthday.userEmail).toBe(testBirthday.userEmail);
      expect(body.birthday.id).toBeDefined();
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  test('should reject request with missing fields', async () => {

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'John Doe'
        // Missing birthDate and userEmail
      }),
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: `/${process.env.STAGE || 'dev'}/birthdays`,
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: ''
    };

    const response = await addBirthday(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
  });

});