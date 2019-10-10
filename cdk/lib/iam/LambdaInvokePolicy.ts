import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import { CustomMangedPolicy, CustomMangedPolicyProps } from './CustomManagedPolicy';

export interface LambdaInvokePolicyProps extends CustomMangedPolicyProps {
  readonly invokeStatementResources: string[];
}

export class LambdaInvokePolicy extends CustomMangedPolicy {
  constructor(scope: cdk.Construct, id: string, props: LambdaInvokePolicyProps) {
    super(scope, id, props);

    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: props.invokeStatementResources,
      actions: ['lambda:InvokeFunction']
    });
    this.addStatements(managedPolicyLambdaInvokeStatement);
  }
}
