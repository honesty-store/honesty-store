import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import { DynamoTablePolicy, DynamoTablePolicyTableProps} from './iam/DynamoTablePolicy';
import { LambdaInvokePolicy } from './iam/LambdaInvokePolicy';

export interface MicroserviceRoleProps {
  tableProps?: DynamoTablePolicyTableProps;
  readonly functionName: string;
}

export enum MicroserviceRoleTableAccess {
  RW = 'rw',
  RO = 'ro'
}

export class MicroserviceRole extends iam.Role {
  constructor(scope: cdk.Construct, id: string, props: MicroserviceRoleProps) {
    const baseRoleName = 'lambda';
    const roleProps = {
      // tslint:disable-next-line: max-line-length
      roleName: props.tableProps ? `${baseRoleName}-table-${props.tableProps.tableAccessLevel}-${props.functionName}` : `${baseRoleName}-${props.functionName}`,
      path: '/',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    };
    super(scope, id, roleProps);

    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'));
    this.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

    if (props.tableProps != null) {
      const dynamoAccessPolicy = new DynamoTablePolicy(this, `table-${props.tableProps.tableAccessLevel}`, {
        tableProps: props.tableProps,
        uniqueIdentifier: props.functionName
      });
      this.addManagedPolicy(dynamoAccessPolicy);
    }
  }
}
