"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../shared/db");
const handler = async (event) => {
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
        if (!data.name || !data.birthDate || !data.userEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: 'Name, birthDate, and userEmail are required'
                })
            };
        }
        const user = await (0, db_1.getUserByEmail)(data.userEmail);
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
            id: (0, uuid_1.v4)(),
            name: data.name,
            birthDate: data.birthDate,
            userEmail: data.userEmail,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await (0, db_1.dbPut)(db_1.BIRTHDAYS_TABLE, newBirthday);
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
    }
    catch (error) {
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
exports.handler = handler;
