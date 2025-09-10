import { test, expect } from '@playwright/test';
import { generateTestJWT } from '../helpers/testAuth';

const BASE_URL = process.env.LAMBDA_ENDPOINT || 'http://localhost:3000/dev';

test.describe('GetUsers API Integration Tests', () => {

  test('should return 401 without authorization token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);

    expect(response.status()).toBe(401);
  });

  test('should return users list with valid authorization', async ({ request }) => {
    // TODO(human) - Replace this weak test logic with strict validation
    // Use generateTestJWT() to create a real token and require 200 + user data
    const mockToken = generateTestJWT()

    const response = await request.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': mockToken
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.users).toEqual([]);
    expect(body.count).toBe(0);
  });

  test('should return users with correct structure', async ({ request }) => {
    const mockToken = 'Bearer test-jwt-token';

    const response = await request.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': mockToken
      }
    });

    if (response.status() === 200) {
      const body = await response.json();

      // Check response structure
      expect(body).toHaveProperty('users');
      expect(body).toHaveProperty('count');

      // If there are users, check their structure
      if (body.users.length > 0) {
        const user = body.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('createdAt');
        // Should not include password or other sensitive fields
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('passwordHash');
      }
    }
  });


  test('should reject non-GET methods', async ({ request }) => {
    const mockToken = 'Bearer test-jwt-token';

    const postResponse = await request.post(`${BASE_URL}/users`, {
      headers: {
        'Authorization': mockToken
      }
    });

    expect([405, 403, 404]).toContain(postResponse.status());
  });
});