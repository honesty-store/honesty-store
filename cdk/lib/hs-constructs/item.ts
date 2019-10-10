import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import { LambdaDynamoRole, LambdaDynamoRoleDynamoAccess } from '../hs-constructs/LambdaDynamoRole';

export interface ItemProps {
  readonly tableRemovalPolicy: cdk.RemovalPolicy;
  readonly secretServiceToken: string;
  readonly slackChannelPrefix: string;
  readonly baseUrl: string;
}

export class Item extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ItemProps) {
    super(scope, id);

    const lambdaZipPath = '../item/lambda.zip';
    const lambdaHandler = 'lib/bundle-min.handler';

    const table = new dynamodb.Table(this, 'table', {
      readCapacity: 1,
      writeCapacity: 1,
      partitionKey: {name: 'id', type: AttributeType.STRING},
      removalPolicy: props.tableRemovalPolicy
    });

    const fn = new lambda.Function(this, 'lambda', {
      runtime: lambda.Runtime.NODEJS_8_10,
      handler: lambdaHandler,
      code: lambda.Code.fromAsset(lambdaZipPath),
      timeout: cdk.Duration.seconds(10),
      role: new LambdaDynamoRole(this, 'lambda-dynamo', {dynamoAccess: LambdaDynamoRoleDynamoAccess.RW}),
      environment: {
        TABLE_NAME: table.tableName,
        BASE_URL: props.baseUrl,
        LAMBDA_BASE_URL: props.baseUrl,
        SERVICE_TOKEN_SECRET: props.secretServiceToken,
        SLACK_CHANNEL_PREFIX: props.slackChannelPrefix
      }
    });
  }
}
