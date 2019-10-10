import cdk = require('@aws-cdk/core');
import { Item } from './microservices/Item';

export class HonestyStore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const item = new Item(this, `item`, {
      tableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      serviceTokenSecret: 'service:foo',
      slackChannelPrefix: 'zrhs-',
      baseUrl: 'https://zrhs.honestystore.com'
    });
  }
}
