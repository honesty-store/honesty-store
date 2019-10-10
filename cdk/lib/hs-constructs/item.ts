import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');

export class Item extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const lambdaZipPath = '../item/lambda.zip';
    const lambdaHandler = 'lib/bundle-min.handler';

    const fn = new lambda.Function(this, 'lambda', {
      runtime: lambda.Runtime.NODEJS_8_10,
      handler: lambdaHandler,
      code: lambda.Code.fromAsset(lambdaZipPath),
      timeout: cdk.Duration.seconds(10)
    });
  }
}
