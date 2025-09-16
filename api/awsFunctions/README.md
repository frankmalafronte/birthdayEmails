# Birthday Email Reminder API

A serverless AWS Lambda-based API for managing birthday reminders and sending automated email notifications.

## Features

- **User Management**: User registration with secure password hashing
- **Birthday Tracking**: Add, update, and delete birthday records
- **Email Automation**: Daily scheduled job to send birthday reminder emails
- **Authentication**: JWT-based authentication system
- **Rate Limiting**: Built-in protection against API abuse
- **Cost Monitoring**: AWS billing alarms and emergency shutdown mechanisms

## Tech Stack

- **Runtime**: Node.js 18.x with TypeScript
- **Framework**: Serverless Framework v4
- **Database**: DynamoDB with Global Secondary Indexes
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: AWS SES for email delivery
- **Testing**: Playwright for integration tests
- **Local Development**: DynamoDB Local + Serverless Offline

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **AWS CLI** (for local DynamoDB access)

### Installing AWS CLI

**macOS (using Homebrew):**
```bash
brew install awscli
```

**Other platforms:**
Follow the [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd birthdayEmails/api/awsFunctions
   ```

2. **One-time setup:**
   ```bash
   npm run setup
   ```
   This installs dependencies, configures AWS CLI with dummy credentials, and builds the project.

3. **Start the development environment:**
   ```bash
   npm run dev:start
   ```
   This starts DynamoDB Local, creates tables, and runs the serverless offline environment.

4. **Your API is now running at:** `http://localhost:3000`

## Available Scripts

### Development
- `npm run setup` - One-time setup (install deps, configure AWS, build)
- `npm run dev:start` - Start the complete development environment
- `npm run sls:offline` - Start only the serverless offline (requires DynamoDB running)
- `npm run dynamodb:start` - Start only DynamoDB Local
- `npm run dynamodb:create-tables` - Create required DynamoDB tables

### Building
- `npm run build` - Compile TypeScript
- `npm run build:watch` - Compile TypeScript in watch mode

### Testing

- **Run all tests**: `npm test`
- **Integration tests**: `npm run test:integration`
- **Unit tests**: `npm run test:unit`
- **Test with UI**: `npm run test:ui`

## API Endpoints

### Authentication
- `POST /dev/auth/register` - Create new user account

### Birthdays (Protected)
- `GET /dev/birthdays` - List user's birthdays
- `POST /dev/birthdays` - Add new birthday
- `DELETE /dev/birthdays/{id}` - Delete birthday

### Users (Protected)
- `GET /dev/users` - List all users (admin)

## Database Schema

### Users Table
- **Primary Key**: `id` (UUID)
- **GSI**: `EmailIndex` on `email` field
- **Fields**: id, email, name, password (hashed), createdAt, updatedAt

### Birthdays Table
- **Primary Key**: `id` (UUID)
- **Fields**: id, userId, name, birthDate, email, relationship, createdAt, updatedAt

## Environment Variables

```bash
# Required for production
JWT_SECRET=your-jwt-secret-key
AWS_REGION=us-east-1

# Optional (has defaults)
USERS_TABLE=birthday-app-users-dev
BIRTHDAYS_TABLE=birthday-app-birthdays-dev
```

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to AWS**:
   ```bash
   npm run deploy
   ```

## Cost Controls & Monitoring

This project includes comprehensive cost protection:

- **Billing Alarms**: Alerts at $10 and emergency shutdown at $25
- **Rate Limiting**: Per-IP limits on registration and API calls
- **Reserved Concurrency**: Limits on all Lambda functions
- **DynamoDB**: Pay-per-request billing mode
- **Email Limits**: Daily send quotas and SES monitoring

## Local Testing

The project uses Playwright for comprehensive integration testing:

```bash
# Make sure DynamoDB Local and serverless offline are running
npm run sls:offline

# In another terminal, run tests
npm run test:integration
```

## Troubleshooting

### DynamoDB Local Issues
- Ensure Java is installed: `java -version`
- Restart serverless offline if tables aren't created
- Check DynamoDB Local is running: `http://localhost:8000/shell`

### Build Issues  
- Clean and rebuild: `npm run clean && npm run build`
- Check TypeScript errors: `npx tsc --noEmit`

### Test Failures
- Ensure serverless offline is running on port 3000
- Check DynamoDB Local is accessible on port 8000
- Verify all dependencies are installed

## Project Structure

```
src/
├── shared/           # Shared utilities and types
│   ├── db.ts        # Database helpers
│   └── types.ts     # TypeScript interfaces
├── createUser/      # User registration endpoint
├── auth/            # JWT authorizer
└── jobs/            # Scheduled jobs (email sender)

tests/
├── integration/     # API integration tests
├── unit/           # Unit tests
└── helpers/        # Test utilities

schemas/            # JSON Schema validation
dist/              # Compiled JavaScript (generated)
```

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update this README for significant changes
4. Ensure all tests pass before PR submission

## License

[Your License Here]