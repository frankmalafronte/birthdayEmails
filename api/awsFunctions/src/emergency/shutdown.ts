import { SNSEvent, Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const lambda = new AWS.Lambda();
const apigateway = new AWS.APIGateway();
const sns = new AWS.SNS();

interface ShutdownAction {
  action: string;
  resource: string;
  success: boolean;
  error?: string;
}

export const handler = async (event: SNSEvent, context: Context) => {
  console.log('🚨 EMERGENCY BILLING ALARM TRIGGERED - INITIATING SHUTDOWN');
  
  const shutdownActions: ShutdownAction[] = [];
  const serviceName = process.env.SERVICE_NAME || 'birthday-app-backend';
  const stage = process.env.STAGE || 'dev';

  try {
    // 1. 🛑 Set ALL Lambda functions to ZERO concurrency (stops new invocations)
    const functionsToDisable = [
      `${serviceName}-${stage}-createUser`,
      `${serviceName}-${stage}-findBirthdays`, 
      `${serviceName}-${stage}-addBirthday`,
      `${serviceName}-${stage}-deleteBirthday`,
      `${serviceName}-${stage}-sendBirthdayEmails`
    ];

    for (const functionName of functionsToDisable) {
      try {
        await lambda.putProvisionedConcurrencyConfig({
          FunctionName: functionName,
          Qualifier: '$LATEST',
          ProvisionedConcurrencyConfig: {
            ProvisionedConcurrency: 0
          }
        }).promise();

        // Also set reserved concurrency to 0 (completely blocks function)
        await lambda.updateFunctionConfiguration({
          FunctionName: functionName,
          ReservedConcurrencyConfig: {
            ReservedConcurrency: 0  // 🛑 NO executions allowed
          }
        }).promise();

        shutdownActions.push({
          action: 'disable_lambda',
          resource: functionName,
          success: true
        });

        console.log(`✅ DISABLED Lambda function: ${functionName}`);
      } catch (error) {
        console.error(`❌ Failed to disable ${functionName}:`, error);
        shutdownActions.push({
          action: 'disable_lambda',
          resource: functionName,
          success: false,
          error: error.message
        });
      }
    }

    // 2. 🛑 Get API Gateway ID and disable it
    try {
      const apis = await apigateway.getRestApis().promise();
      const birthdayApi = apis.items?.find(api => 
        api.name?.includes(serviceName) && api.name?.includes(stage)
      );

      if (birthdayApi?.id) {
        // Create a resource policy that denies all requests
        const denyAllPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Deny',
              Principal: '*',
              Action: 'execute-api:Invoke',
              Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:*:${birthdayApi.id}/*`
            }
          ]
        };

        await apigateway.updateRestApi({
          restApiId: birthdayApi.id,
          patchOps: [
            {
              op: 'replace',
              path: '/policy',
              value: JSON.stringify(denyAllPolicy)
            }
          ]
        }).promise();

        shutdownActions.push({
          action: 'disable_api_gateway',
          resource: birthdayApi.id,
          success: true
        });

        console.log(`✅ DISABLED API Gateway: ${birthdayApi.id}`);
      }
    } catch (error) {
      console.error('❌ Failed to disable API Gateway:', error);
      shutdownActions.push({
        action: 'disable_api_gateway',
        resource: 'unknown',
        success: false,
        error: error.message
      });
    }

    // 3. 📧 Send detailed emergency notification
    const message = `
🚨 EMERGENCY SHUTDOWN EXECUTED 🚨

Billing threshold of $25 was exceeded.
All functions have been automatically disabled to prevent further charges.

Actions taken:
${shutdownActions.map(action => 
  `${action.success ? '✅' : '❌'} ${action.action}: ${action.resource}${action.error ? ` (Error: ${action.error})` : ''}`
).join('\n')}

IMMEDIATE ACTIONS REQUIRED:
1. Log into AWS Console to investigate the cause
2. Check CloudWatch logs for suspicious activity  
3. Review DynamoDB and Lambda metrics
4. Once issue is resolved, manually re-enable functions:
   - Set Lambda reserved concurrency back to normal values
   - Remove API Gateway deny policy

Service: ${serviceName}
Stage: ${stage}
Time: ${new Date().toISOString()}
Account: ${context.invokedFunctionArn.split(':')[4]}
`;

    // Send to emergency SNS topic
    await sns.publish({
      TopicArn: process.env.EMERGENCY_TOPIC_ARN,
      Subject: `🚨 EMERGENCY SHUTDOWN: ${serviceName}-${stage}`,
      Message: message
    }).promise();

    console.log('📧 Emergency notification sent');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Emergency shutdown completed',
        actions: shutdownActions,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('💥 CRITICAL: Emergency shutdown failed:', error);
    
    // Send failure notification
    await sns.publish({
      TopicArn: process.env.EMERGENCY_TOPIC_ARN,
      Subject: `💥 EMERGENCY SHUTDOWN FAILED: ${serviceName}-${stage}`,
      Message: `Emergency shutdown failed: ${error.message}\n\nMANUAL INTERVENTION REQUIRED IMMEDIATELY!`
    }).promise();

    throw error;
  }
};