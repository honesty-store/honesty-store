import cdk = require('@aws-cdk/core');
import { Item } from './microservices/Item';
import { Store } from './microservices/Store';
import { Transaction } from './microservices/Transaction';
import { User } from './microservices/User';

export interface HonestyStoreProps extends cdk.StackProps {
  readonly tableRemovalPolicy: cdk.RemovalPolicy;
  readonly serviceTokenSecret: string;
  readonly slackChannelprefix: string;
  readonly baseUrl: string;
}

export class HonestyStore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: HonestyStoreProps) {
    super(scope, id, props);

    const configuration = {
      slackChannelPrefix: props.slackChannelprefix,
      serviceTokenSecret: props.serviceTokenSecret,
      baseUrl: props.baseUrl,
      tableRemovalPolicy: props.tableRemovalPolicy,
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
