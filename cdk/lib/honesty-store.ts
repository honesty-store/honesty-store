import cdk = require('@aws-cdk/core');
import { Item } from './microservices/Item';
import { Store } from './microservices/Store';

export class HonestyStore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serviceTokenSecret = 'service:foo';

    const item = new Item(this, `item`, {
      tableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      serviceTokenSecret: serviceTokenSecret,
      slackChannelPrefix: 'zrhs-',
      baseUrl: 'https://zrhs.honestystore.com'
    });

    const store = new Store(this, `store`, {
      tableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      serviceTokenSecret: serviceTokenSecret,
      slackChannelPrefix: 'zrhs-',
      baseUrl: 'https://zrhs.honestystore.com'
    });
  }
}
