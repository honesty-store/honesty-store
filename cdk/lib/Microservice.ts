import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { LambdaInvokePolicy } from './iam/LambdaInvokePolicy';
import { MicroserviceRole, MicroserviceRoleProps, MicroserviceRoleTableAccess } from './MicroserviceRole';

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
  readonly accountId: string;
  readonly region: string;
}

interface MicroserviceLambdaEnvironment {
  [key: string]: string;
}

export class Microservice extends cdk.Construct {
  public functionRole: MicroserviceRole;
  public functionName: string;
  private region: string;
  private accountId: string;
  protected function: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: MicroserviceProps, configuration: Configuration) {
    super(scope, id);

    this.functionName = `${configuration.stackName}_${props.hsPackageName}`;
    this.region = configuration.region;
    this.accountId = configuration.accountId;

    const lambdaZipPath = `../${props.hsPackageName}/lambda.zip`;
    const lambdaHandler = 'lib/bundle-min.handler';
    const lambdaRuntime = lambda.Runtime.NODEJS_8_10;

    const lambdaEnvironment: MicroserviceLambdaEnvironment = {
      ['SERVICE_TOKEN_SECRET']: configuration.serviceTokenSecret,
      ['SLACK_CHANNEL_PREFIX']: configuration.slackChannelPrefix,
      ['BASE_URL']: configuration.baseUrl,
      ['LAMBDA_BASE_URL']: configuration.baseUrl
    };

    const roleProps: MicroserviceRoleProps = {
      functionName: this.functionName
    };

    if (props.tableAcessLevel != null) {
      const table = new dynamodb.Table(this, 'table', {
        readCapacity: 1,
        writeCapacity: 1,
        partitionKey: {name: 'id', type: AttributeType.STRING},
        removalPolicy: configuration.tableRemovalPolicy
      });
      lambdaEnvironment.TABLE_NAME = table.tableName;

      roleProps.tableProps = {
        tableAccessLevel: props.tableAcessLevel,
        table: table
      };
    }

    this.functionRole = new MicroserviceRole(this, 'microservice_role', roleProps);

    this.function = new lambda.Function(this, 'lambda', {
      runtime: lambdaRuntime,
      handler: lambdaHandler,
      code: lambda.Code.fromAsset(lambdaZipPath),
      timeout: props.lambdaTimeout,
      role: this.functionRole,
      environment: lambdaEnvironment,
      functionName: this.functionName
    });
  }
  public requestAccessToInvokeMicroservices(microservices: Microservice[]) {
    microservices.forEach(microservice => {
      const policy = new LambdaInvokePolicy(this.functionRole, `lambda-invoke-${this.functionName}-${microservice.functionName}`, {
        invokeStatementResources: [microservice.calculatedFunctionArn]
      });
      this.functionRole.addManagedPolicy(policy);
    });
  }
  get calculatedFunctionArn(): string {
    return `arn:aws:lambda:${this.region}:${this.accountId}:function:${this.functionName}`;
  }
}
