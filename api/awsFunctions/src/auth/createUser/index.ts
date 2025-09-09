import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dynamodb, USERS_TABLE } from '../../shared/db';
import { User, UserResponse, RegisterRequest } from '../../shared/types';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const { email, password, name }: RegisterRequest = JSON.parse(event.body);

    // Validate input
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Email, password, and name are required',
          details: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null,
            name: !name ? 'Name is required' : null
          }
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Password must be at least 8 characters long' 
        })
      };
    }

    // Validate name length
    if (name.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Name must be at least 2 characters long' 
        })
      };
    }

    // Check if user already exists
    try {
      const existingUserQuery = {
        TableName: USERS_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email.toLowerCase()
        }
      };

      const existingUser = await dynamodb.scan(existingUserQuery).promise();

      if (existingUser.Items && existingUser.Items.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ 
            error: 'User with this email already exists' 
          })
        };
      }
    } catch (queryError) {
      console.error('Error checking existing user:', queryError);
      // Continue with registration if query fails
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user object
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    const user: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };

    // Save user to database
    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(id)' // Ensure no duplicate IDs
    }).promise();

    console.log(`User created successfully: ${userId}`);

    // Return user without password
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: userResponse
      })
    };

  } catch (error) {
    console.error('User creation error:', error);
    
    // Handle specific DynamoDB errors
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'User already exists' 
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to create user. Please try again later.'
      })
    };
  }
};