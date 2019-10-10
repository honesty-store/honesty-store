import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import { MicroserviceRole, MicroserviceRoleTableAccess } from './MicroserviceRole';

export interface MicroserviceProps {
  readonly tableAcessLevel?: MicroserviceRoleTableAccess;
  readonly hsPackageName: string;
  readonly lambdaTimeout: cdk.Duration;
}

export interface Configuration {
  readonly tableRemovalPolicy: cdk.RemovalPolicy;
  readonly serviceTokenSecret: string;
  readonly slackChannelPrefix: string;
  readonly baseUrl: string;
  readonly stackName: string;
}

interface MicroserviceLambdaEnvironment {
  [key: string]: string;
}

export class Microservice extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: MicroserviceProps, configuration: Configuration) {
    super(scope, id);

    const lambdaZipPath = `../${props.hsPackageName}/lambda.zip`;
    const lambdaHandler = 'lib/bundle-min.handler';
    const lambdaRuntime = lambda.Runtime.NODEJS_8_10;

    const lambdaEnvironment: MicroserviceLambdaEnvironment = {
      ['SERVICE_TOKEN_SECRET']: configuration.serviceTokenSecret,
      ['SLACK_CHANNEL_PREFIX']: configuration.slackChannelPrefix,
      ['BASE_URL']: configuration.baseUrl,
      ['LAMBDA_BASE_URL']: configuration.baseUrl
    };

    if (props.tableAcessLevel != null) {
      const table = new dynamodb.Table(this, 'table', {
        readCapacity: 1,
        writeCapacity: 1,
        partitionKey: {name: 'id', type: AttributeType.STRING},
        removalPolicy: configuration.tableRemovalPolicy
      });
      lambdaEnvironment.TABLE_NAME = table.tableName;
    }

    const lambdaRole = new MicroserviceRole(this, 'microservice_role', {
      tableAccessLevel: props.tableAcessLevel,
      uniqueIdentifier: `${configuration.stackName}_${props.hsPackageName}`
    });

    const fn = new lambda.Function(this, 'lambda', {
      runtime: lambdaRuntime,
      handler: lambdaHandler,
      code: lambda.Code.fromAsset(lambdaZipPath),
      timeout: props.lambdaTimeout,
      role: lambdaRole,
      environment: lambdaEnvironment
    });
  }
}
