import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import { CustomMangedPolicy, CustomMangedPolicyProps } from './CustomManagedPolicy';

export class LambdaInvokePolicy extends CustomMangedPolicy {
  constructor(scope: cdk.Construct, id: string, props: CustomMangedPolicyProps ) {
    super(scope, id, props);

    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    });
    this.addStatements(managedPolicyLambdaInvokeStatement);
  }
}
