import * as jwt from 'jsonwebtoken';

// Test JWT helper to generate valid tokens for integration tests
export function generateTestJWT(payload = { sub: 'test-user-123', email: 'test@example.com' }): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    },
    secret,
    { algorithm: 'HS256' }
  );
}