import { test, expect } from '@playwright/test';

const BASE_URL = process.env.LAMBDA_ENDPOINT || 'http://localhost:3000/dev';

test.describe('CreateUser API Integration Tests', () => {


  const testUser = {
      email:'test@example.com',
      password: 'password123',
      name: 'Test User'
    }
    
    test('should create user', async ({request})=>{

const email = `test-${Date.now()}@example.com`

const response = await request.post (`${BASE_URL}/auth/register`, {
   data : {
    ...testUser,
    email: email
   }
})

console.log('Response status:', response.status());

let body;
try {
  body = await response.json();
  console.log('Response body:', body);
} catch (error) {
  console.log('Failed to parse response as JSON:', error.message);
  const textBody = await response.text();
  console.log('Raw response body:', textBody);
  throw error;
}

expect(response.status()).toBe(201);
expect(body.user.email).toBe(email);
expect(body.user.name).toBe('Test User');
expect(body.user.password).toBeUndefined(); // Password should NOT be in response
  });
});