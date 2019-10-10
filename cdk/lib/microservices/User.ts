import cdk = require('@aws-cdk/core');
import { Configuration, Microservice } from '../Microservice';
import { MicroserviceRoleTableAccess } from '../MicroserviceRole';

export interface UserConfiguration extends Configuration {
  readonly userTokenSecret: string;
}

export class User extends Microservice {
  constructor(scope: cdk.Construct, id: string, configuration: UserConfiguration) {
    super(scope, id, {
      hsPackageName: 'user',
      tableAcessLevel: MicroserviceRoleTableAccess.RW,
      lambdaTimeout: cdk.Duration.seconds(10)
    },    configuration);
    this.function.addEnvironment('USER_TOKEN_SECRET', configuration.userTokenSecret);
  }
}
