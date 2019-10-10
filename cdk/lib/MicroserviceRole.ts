import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

interface MicroserviceRoleProps {
  readonly tableAccessLevel?: MicroserviceRoleTableAccess;
  readonly uniqueIdentifier: string;
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
    const baseRoleName = 'lambda';
    const roleProps = {
      // tslint:disable-next-line: max-line-length
      roleName: props.tableAccessLevel ? `${baseRoleName}-table-${props.tableAccessLevel}-${props.uniqueIdentifier}` : `${baseRoleName}-${props.uniqueIdentifier}`,
      path: '/',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    };
    super(scope, id, roleProps);

    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    });

    const managedPolicyLambdaInvoke = new iam.ManagedPolicy(this, 'lamba-invoke', {
      managedPolicyName: `lambda-invoke-${props.uniqueIdentifier}`,
      statements:  [managedPolicyLambdaInvokeStatement]
    });

    this.addManagedPolicy(managedPolicyLambdaInvoke);
    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'));
    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    if (props.tableAccessLevel != null) {
      const dynamoAccessPolicy = microserviceRoleAccessPolicyMap.get(props.tableAccessLevel);
      this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(dynamoAccessPolicy));
    }
  }
}
