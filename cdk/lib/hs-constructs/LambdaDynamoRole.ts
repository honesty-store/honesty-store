import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

interface LambdaDynamoRoleProps {
  readonly dynamoAccess: LambdaDynamoRoleDynamoAccess;
}

export enum LambdaDynamoRoleDynamoAccess {
  RW = 'rw',
  RO = 'ro'
}

const lambdaDynamoRoleDynamoAccessPolicyMap = new Map();
lambdaDynamoRoleDynamoAccessPolicyMap.set(LambdaDynamoRoleDynamoAccess.RO, 'AmazonDynamoDBReadOnlyAccess');
lambdaDynamoRoleDynamoAccessPolicyMap.set(LambdaDynamoRoleDynamoAccess.RW, 'AmazonDynamoDBFullAccess');

export class LambdaDynamoRole extends iam.Role {
  constructor(scope: cdk.Construct, id: string, props: LambdaDynamoRoleProps) {
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
    const dynamoAccessPolicy = lambdaDynamoRoleDynamoAccessPolicyMap.get(props.dynamoAccess);
    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(dynamoAccessPolicy));
  }
}
