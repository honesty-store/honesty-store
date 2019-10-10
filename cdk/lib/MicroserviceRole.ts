import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import uuid = require('uuid/v4');

interface MicroserviceRoleProps {
  readonly tableAccessLevel?: MicroserviceRoleTableAccess;
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
    const nameRandomPart = uuid().split('-')[0];
    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    });

    const managedPolicyLambdaInvoke = new iam.ManagedPolicy(scope, 'lamba-invoke', {
      managedPolicyName: `lambda-invoke-${nameRandomPart}`,
      statements:  [managedPolicyLambdaInvokeStatement]
    });

    const roleAwsLambdaAndDynamoBase = [
      managedPolicyLambdaInvoke,
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    ];

    const baseRoleName = 'lambda';
    const roleProps = {
      // tslint:disable-next-line: max-line-length
      roleName: props.tableAccessLevel ? `${baseRoleName}-table-${props.tableAccessLevel}-${nameRandomPart}` : `${baseRoleName}-${nameRandomPart}`,
      managedPolicies: roleAwsLambdaAndDynamoBase,
      path: '/',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    };

    super(scope, id, roleProps);
    if (props.tableAccessLevel != null) {
      const dynamoAccessPolicy = microserviceRoleAccessPolicyMap.get(props.tableAccessLevel);
      this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(dynamoAccessPolicy));
    }
  }
}
