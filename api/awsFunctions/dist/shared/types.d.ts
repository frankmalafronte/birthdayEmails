export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserResponse extends Omit<User, 'password'> {
}
export interface Birthday {
    id: string;
    userId: string;
    name: string;
    birthDate: string;
    email?: string;
    relationship?: string;
    createdAt: string;
    updatedAt: string;
}
export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}
export interface CreateBirthdayRequest {
    name: string;
    birthDate: string;
    email?: string;
    relationship?: string;
}
export interface UpdateBirthdayRequest extends Partial<CreateBirthdayRequest> {
    id: string;
}
export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export interface SendEmailRequest {
    to: string;
    birthday: Birthday;
}
export interface ApiResponse<T = any> {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}
export interface ValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=types.d.ts.map