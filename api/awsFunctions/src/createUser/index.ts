import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { dbPut, dbScan, USERS_TABLE, getUserByEmail } from '../shared/db';
import { User, UserResponse, RegisterRequest } from '../shared/types';

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

    const data : RegisterRequest = JSON.parse(event.body)
    if (await getUserByEmail(data.email))
         return {
        statusCode: 409,
        body: JSON.stringify({
          success: false,
          error: 'User with this email already exists'
        })
    }
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser : User ={
        id: uuidv4(),
        email: data.email,
        name:data.name,
        password:hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()    
    }

   const dbResponse = await dbPut(USERS_TABLE, newUser)
   const userResponse = {
    id: newUser.id,
    email: newUser.email,
    name:newUser.name
   }
   return  {
    statusCode:201,
    body: JSON.stringify({
        success:true,
        message: 'User created',
        user:userResponse
    })
   }

           
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};