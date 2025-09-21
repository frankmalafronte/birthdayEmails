import { dynamodb } from '../../src/shared/db';
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

export const clearTable = async (tableName: string): Promise<void> => {
  console.log('Trying to clear table:', tableName);

  // Scan all items
  const scanCommand = new ScanCommand({ TableName: tableName });
  const result = await dynamodb.send(scanCommand);

  // Delete each item
  for (const item of result.Items || []) {
    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: { id: item.id }
    });
        await dynamodb.send(deleteCommand);
  }
};

