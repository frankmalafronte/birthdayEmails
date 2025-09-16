const AWS = require('aws-sdk');

// Configure for local DynamoDB
const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000'
});

async function createTables() {
  try {
    console.log('Creating DynamoDB tables...');

    // Create Users table
    await dynamodb.createTable({
      TableName: 'birthday-app-users-dev',
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
          Projection: { ProjectionType: 'KEYS_ONLY' },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('✅ Users table created');

    // Create Rate Limits table
    await dynamodb.createTable({
      TableName: 'birthday-app-backend-rate-limits-dev',
      KeySchema: [
        { AttributeName: 'ip', KeyType: 'HASH' },
        { AttributeName: 'action', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'ip', AttributeType: 'S' },
        { AttributeName: 'action', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('✅ Rate limits table created');
    console.log('🎉 All tables created successfully!');

  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('ℹ️  Tables already exist, skipping creation');
    } else {
      console.error('❌ Error creating tables:', error.message);
      process.exit(1);
    }
  }
}

createTables();