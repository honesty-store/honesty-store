import cdk = require('@aws-cdk/core');
import { Item } from './microservices/Item';
import { Store } from './microservices/Store';
import { Transaction } from './microservices/Transaction';
import { User } from './microservices/User';

export class HonestyStore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const configuration = {
      tableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      serviceTokenSecret: 'service:foo',
      slackChannelPrefix: 'zrhs-',
      baseUrl: 'https://zrhs.honestystore.com',
      stackName: this.stackName,
      region: this.region,
      accountId: this.account
    };

    const item = new Item(this, `item`, configuration);

    const store = new Store(this, `store`, configuration);

    const transaction = new Transaction(this, 'transaction', configuration);

    const user = new User(this, 'user', {...configuration, userTokenSecret:"user:foo"});

    const microservices = [item, store, transaction, user];
    microservices.forEach(microservice => {
      microservice.requestAccessToInvokeMicroservices(microservices);
    });
  }
}
