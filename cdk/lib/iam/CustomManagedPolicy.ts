import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

export class CustomMangedPolicy extends iam.ManagedPolicy {
  constructor(scope: cdk.Construct, id: string) {
    const policyProps = {
      managedPolicyName: id
    };
    super(scope, id, policyProps);
  }
}
