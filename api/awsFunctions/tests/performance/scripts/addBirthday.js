import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 5 },    // Stay at 5 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.1'],     // Less than 10% failures
  },
};

const BASE_URL = 'http://localhost:3000/dev';

// Test data - we'll create users first, then test adding birthdays
const testUsers = new SharedArray('users', function () {
  return Array.from({ length: 10 }, (_, i) => ({
    email: `perftest${i}_${Date.now()}@example.com`,
    password: 'password123',
    name: `Performance Test User ${i}`
  }));
});

// Setup function - runs once per VU at the start
export function setup() {
  console.log('Setting up test users...');
  const createdUsers = [];

  // Create test users for the performance test
  for (let user of testUsers) {
    const response = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 201) {
      createdUsers.push(user);
    }
  }

  console.log(`Created ${createdUsers.length} test users`);
  return { users: createdUsers };
}

// Main test function
export default function (data) {
  // TODO(human): Implement the addBirthday performance test logic here
  // This function should:
  // 1. Select a random user from data.users
  // 2. Create a birthday payload with realistic data
  // 3. Make POST request to /birthdays endpoint
  // 4. Check the response status and validate the response
  // 5. Add a small sleep to simulate realistic user behavior

  // Hints:
  // - Use Math.floor(Math.random() * data.users.length) to select random user
  // - Birthday payload needs: name, birthDate, userEmail
  // - Use check() to validate response.status === 201
  // - Sleep for 1-3 seconds between requests
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Test completed!');
  // Could clean up test data here if needed
}