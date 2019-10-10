import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { parse as parseUrl } from 'url';
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
  public functionName: string;
  private functionRole: MicroserviceRole;
  private region: string;
  private accountId: string;
  protected function: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: MicroserviceProps, configuration: Configuration) {
    super(scope, id);

    this.functionName = this.getFunctionPrefix(configuration.baseUrl) + props.hsPackageName;
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

  public addLambdaInvokePolicy(policy: LambdaInvokePolicy) {
    this.functionRole.addManagedPolicy(policy);
  }

  get calculatedFunctionArn(): string {
    return `arn:aws:lambda:${this.region}:${this.accountId}:function:${this.functionName}`;
  }

  private getFunctionPrefix = (baseUrl: string) => {
    const { hostname } = parseUrl(baseUrl);
    if (hostname == null) {
      throw new Error(`Failed to parse ${baseUrl}`);
    }
    const branch = hostname.split('.')[0];
    return branch === 'live' ? 'honesty-store-' : `hs-${branch}-` ;
  };
}
