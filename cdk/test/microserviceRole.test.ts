import { expect as expectCDK, haveResource, HaveResourceAssertion, haveResourceLike } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import { MicroserviceRole, MicroserviceRoleTableAccess } from '../lib/MicroserviceRole';

test('MicroserviceRole has AWS::IAM::Role', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});

  expectCDK(stack).to(haveResource('AWS::IAM::Role'));
});

test('MicroserviceRole has AWS::IAM::ManagedPolicy with correct PolicyStatement', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});

  expectCDK(stack).to(haveResource('AWS::IAM::ManagedPolicy', {
    PolicyDocument: {
      Statement: [
        {
          Action: 'lambda:InvokeFunction',
          Effect: 'Allow',
          Resource: '*'
        }
      ],
      Version: '2012-10-17'
    }
  }));
});

test('MicroserviceRole with RW table property hasAmazonDynamoDBFullAccess ', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {tableAccessLevel: MicroserviceRoleTableAccess.RW});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).toMatch(':iam::aws:policy/AmazonDynamoDBFullAccess');
});

test('MicroserviceRole with RO table property does not have AmazonDynamoDBFullAccess ', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {tableAccessLevel: MicroserviceRoleTableAccess.RO});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).not.toMatch(':iam::aws:policy/AmazonDynamoDBFullAccess');
});

test('MicroserviceRole with RO table property has AmazonDynamoDBReadOnlyAccess', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {tableAccessLevel: MicroserviceRoleTableAccess.RO});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).toMatch(':iam::aws:policy/AmazonDynamoDBReadOnlyAccess');
});

test('MicroserviceRole without table property does not have AmazonDynamoDBFullAccess ', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).not.toMatch(':iam::aws:policy/AmazonDynamoDBFullAccess');
});

test('MicroserviceRole without table property does not have AmazonDynamoDBReadOnlyAccess', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).not.toMatch(':iam::aws:policy/AmazonDynamoDBReadOnlyAccess');
});

test('MicroserviceRole has AWSLambdaBasicExecutionRole', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).toMatch(':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole');
});

test('MicroserviceRole has AWSXrayWriteOnlyAccess', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');
  const role = new MicroserviceRole(stack, 'testrole', {});
  const stackString = JSON.stringify(expectCDK(stack).value);

  expect(stackString).toMatch(':iam::aws:policy/AWSXrayWriteOnlyAccess');
});
