import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

interface LambdaInvokePolicyProps {
  readonly uniqueIdentifier: string;
}

export class LambdaInvokePolicy extends iam.ManagedPolicy {
  constructor(scope: cdk.Construct, id: string, props: LambdaInvokePolicyProps) {
    const managedPolicyLambdaInvokeStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    });

    const policyProps = {
      managedPolicyName: `${id}-${props.uniqueIdentifier}`,
      statements:  [managedPolicyLambdaInvokeStatement]
    };

    super(scope, id, policyProps);
  }
}
