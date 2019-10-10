import { expect as expectCDK, MatchStyle, matchTemplate } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Cdk = require('../lib/honesty-store');

test('Empty Stack', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new Cdk.HonestyStore(app, 'MyTestStack');
    // THEN
  expectCDK(stack).to(matchTemplate({
    Resources: {}
  },                                MatchStyle.EXACT));
});
