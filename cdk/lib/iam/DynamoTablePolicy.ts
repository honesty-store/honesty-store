
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { MicroserviceRoleTableAccess } from '../MicroserviceRole';
import { CustomMangedPolicy } from './CustomManagedPolicy';

export interface DynamoTablePolicyProps {
  readonly tableProps: DynamoTablePolicyTableProps;
}

export interface DynamoTablePolicyTableProps {
  readonly tableAccessLevel: MicroserviceRoleTableAccess;
  readonly table: dynamodb.Table;
}

export class DynamoTablePolicy extends CustomMangedPolicy {
  constructor(scope: cdk.Construct, id: string, props: DynamoTablePolicyProps) {
    super(scope, id);

    const tablePolicyStatement = new DynamoDBTablePolicyStatement(props.tableProps);
    this.addStatements(tablePolicyStatement);
  }
}

class DynamoDBTablePolicyStatement extends iam.PolicyStatement {
  constructor(tableProps: DynamoTablePolicyTableProps) {
    const statementProps = {
      effect: iam.Effect.ALLOW,
      resources: [tableProps.table.tableArn],
      actions: DynamoDBTablePolicyStatement.getStatementActionsFromTableAccessLevel(tableProps.tableAccessLevel)
    };
    super(statementProps);
  }

  private static getStatementActionsFromTableAccessLevel(tableAccessLevel: MicroserviceRoleTableAccess): string[] {
    const statementActionsMap = {
      [MicroserviceRoleTableAccess.RO]: [
        'dynamodb:BatchGetItem',
        'dynamodb:Describe*',
        'dynamodb:List*',
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:Scan'
      ],
      [MicroserviceRoleTableAccess.RW]: [
        'dynamodb:*'
      ]
    };
    return statementActionsMap[tableAccessLevel];
  }
}
