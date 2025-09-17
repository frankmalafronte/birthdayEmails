import { test, expect } from '@playwright/test';
import { generateTestJWT } from '../helpers/testAuth';

const BASE_URL = process.env.LAMBDA_ENDPOINT || 'http://localhost:3000/dev';

test.describe('GetUsers API Integration Tests', () => {

  test('should return 401 without authorization token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);

    expect(response.status()).toBe(401);
  });

  
  // test('should return users list with valid authorization', async ({ request }) => {
  //   const mockToken = generateTestJWT()

  //   const response = await request.get(`${BASE_URL}/users`, {
  //     headers: {
  //       'Authorization': mockToken
  //     }
  //   });

  //   expect(response.status()).toBe(200);
  //   const body = await response.json();
  //   expect(body.users).toEqual([]);
  //   expect(body.count).toBe(0);
  // });
});