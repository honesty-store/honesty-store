import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

interface MicroserviceRoleProps {
  readonly dynamoAccess: MicroserviceRoleTableAccess;
}

export enum MicroserviceRoleTableAccess {
  RW = 'rw',
  RO = 'ro'
}

const microserviceRoleAccessPolicyMap = new Map();
microserviceRoleAccessPolicyMap.set(MicroserviceRoleTableAccess.RO, 'AmazonDynamoDBReadOnlyAccess');
microserviceRoleAccessPolicyMap.set(MicroserviceRoleTableAccess.RW, 'AmazonDynamoDBFullAccess');

export class MicroserviceRole extends iam.Role {
  constructor(scope: cdk.Construct, id: string, props: MicroserviceRoleProps) {
    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    });

    const managedPolicyLambdaInvoke = new iam.ManagedPolicy(scope, 'lamba-invoke', {
      managedPolicyName: 'lambda-invoke',
      statements:  [managedPolicyLambdaInvokeStatement]
    });

    const roleAwsLambdaAndDynamoBase = [
      managedPolicyLambdaInvoke,
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    ];

    const roleProps = {
      roleName: `aws-lambda-and-dynamo-${props.dynamoAccess}`,
      managedPolicies: roleAwsLambdaAndDynamoBase,
      path: '/',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    };

    super(scope, id, roleProps);
    const dynamoAccessPolicy = microserviceRoleAccessPolicyMap.get(props.dynamoAccess);
    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(dynamoAccessPolicy));
  }
}
