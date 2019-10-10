import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');

export interface CustomMangedPolicyProps {
  readonly uniqueIdentifier: string;
}

export class CustomMangedPolicy extends iam.ManagedPolicy {
  constructor(scope: cdk.Construct, id: string, props: CustomMangedPolicyProps) {
    const policyProps = {
      managedPolicyName: `${id}-${props.uniqueIdentifier}`
    };
    super(scope, id, policyProps);
  }
}
