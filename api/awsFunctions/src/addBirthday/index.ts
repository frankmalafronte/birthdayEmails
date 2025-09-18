import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dbPut, BIRTHDAYS_TABLE, getUserByEmail } from '../shared/db';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Request body is required'
        })
      };
    }

    const data = JSON.parse(event.body);

    // Validate required fields
    if (!data.name || !data.birthDate || !data.userEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Name, birthDate, and userEmail are required'
        })
      };
    }

    // Check if user exists
    const user = await getUserByEmail(data.userEmail);
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'User not found'
        })
      };
    }

    const newBirthday = {
      id: uuidv4(),
      name: data.name,
      birthDate: data.birthDate,
      userEmail: data.userEmail,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbPut(BIRTHDAYS_TABLE, newBirthday);

    const birthdayResponse = {
      id: newBirthday.id,
      name: newBirthday.name,
      birthDate: newBirthday.birthDate,
      userEmail: newBirthday.userEmail
    };

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: 'Birthday created successfully',
        birthday: birthdayResponse
      })
    };

  } catch (error) {
    console.error('Error creating birthday:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};