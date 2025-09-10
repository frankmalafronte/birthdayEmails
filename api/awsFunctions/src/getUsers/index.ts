import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: process.env.USERS_TABLE!,
      ProjectionExpression: 'id, email, #name, createdAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    
    const users = result.Items || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        users,
        count: users.length
      })
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to fetch users'
      })
    };
  }
};