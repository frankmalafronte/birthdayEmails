import { test, expect } from '@playwright/test';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as createUser}  from '../../src/createUser/index';
import { clearTable } from '../helpers/testHelpers';

test.describe('CreateUser API Integration Tests', () => {

  test.beforeEach(async () => {
    await clearTable(process.env.USERS_TABLE!);
  });

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  test('should create user', async () => {

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        ...testUser,
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

    const response = await createUser(event);

    // Debug: Log response if not 201
    if (response.statusCode !== 201) {
      console.log('Response status:', response.statusCode);
      console.log('Response body:', response.body);
    }

    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.name).toBe(testUser.name);
    expect(body.user.password).toBeUndefined(); // Password should NOT be in response
  });

  test('should reject duplicate user with 409 status', async () => {
    const duplicateUser = {
      email: 'duplicateUser@example.com',
      password: 'password123',
      name: 'Test User'
    };

    // Create user first
    const firstEvent: APIGatewayProxyEvent = {
      body: JSON.stringify(duplicateUser),
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

    const response = await createUser(firstEvent);
    expect(response.statusCode).toBe(201);

    // Try to create same user again
    const secondEvent: APIGatewayProxyEvent = {
      body: JSON.stringify(duplicateUser),
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

    const secondResponse = await createUser(secondEvent);
    expect(secondResponse.statusCode).toBe(409);
  });
  test('should reject a request with no body', async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
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

    const response = await createUser(event);
    expect(response.statusCode).toBe(400);
  });
  test('should reject a request lacking an email', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        password: '123456789',
        name: 'test'
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

    const response = await createUser(event);
    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('requires property');
    expect(response.body).toContain('email');
  });
  test('should reject a request with a short password', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        email: 'shortpassword@email.com',
        password: '123',
        name: 'test'
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

    const response = await createUser(event);
    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('does not meet minimum length of 8');
  });
  
});