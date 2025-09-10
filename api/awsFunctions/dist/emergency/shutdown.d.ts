import { SNSEvent, Context } from 'aws-lambda';
export declare const handler: (event: SNSEvent, context: Context) => Promise<{
    statusCode: number;
    body: string;
}>;
//# sourceMappingURL=shutdown.d.ts.map