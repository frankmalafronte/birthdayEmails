import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken;

    if (!token) {
      throw new Error('No authorization token provided');
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');

    const secret = process.env.JWT_SECRET || 'test-secret-key';

    // Verify the JWT token
    const decoded = jwt.verify(cleanToken, secret) as JWTPayload;

    // Generate policy allowing access
    const policy: APIGatewayAuthorizerResult = {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId: decoded.sub,
        email: decoded.email
      }
    };

    return policy;

  } catch (error) {
    console.error('Authorization failed:', error);

    // Return policy denying access
    const policy: APIGatewayAuthorizerResult = {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: event.methodArn
          }
        ]
      }
    };

    return policy;
  }
};