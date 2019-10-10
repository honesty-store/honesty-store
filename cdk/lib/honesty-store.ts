import cdk = require('@aws-cdk/core');
import { Item } from './hs-constructs/item';

export class HonestyStore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const item = new Item(this, `item`, {
      tableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      secretServiceToken: 'service:foo',
      slackChannelPrefix: 'zrhs-',
      baseUrl: 'https://zrhs.honestystore.com'
    });
  }
}
