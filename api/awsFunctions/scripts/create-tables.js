const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Configure for local DynamoDB
const dynamodb = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

async function createTables() {
  try {
    console.log('Creating DynamoDB tables...');

    const service = 'birthday-app-backend';
    const stage = 'dev';
    const usersTableName = `${service}-users-${stage}`;
    const birthdaysTableName = `${service}-birthdays-${stage}`;

    console.log(`Creating users table: ${usersTableName}`);
    console.log(`Creating birthdays table: ${birthdaysTableName}`);

    // Create Users table
    await dynamodb.send(new CreateTableCommand({
      TableName: usersTableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));

    console.log('✅ Users table created');

    // Create Birthdays table
    await dynamodb.send(new CreateTableCommand({
      TableName: birthdaysTableName,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));

    console.log('✅ Birthdays table created');
    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error.name, error.message);
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️  Tables already exist, skipping creation');
    } else {
      console.error('Full error:', JSON.stringify(error, null, 2));
      process.exit(1);
    }
  }
}

createTables();