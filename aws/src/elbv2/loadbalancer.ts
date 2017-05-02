import { ELBv2 } from 'aws-sdk';
import * as winston from 'winston';
import { describeAll } from '../describe';

export const ensureLoadBalancer = async ({ name, securityGroups, subnets }) => {
  const loadBalancerResponse = await new ELBv2({ apiVersion: '2015-12-01' })
    .createLoadBalancer({
      Name: name,
      Scheme: 'internet-facing',
      SecurityGroups: securityGroups,
      Subnets: subnets
    })
    .promise();

  const loadBalancer = loadBalancerResponse.LoadBalancers[0];

  winston.debug('loadBalancer: ensureLoadBalancer', loadBalancer);

  return loadBalancer;
};

export const pruneLoadBalancers = async ({ filter = (_loadBalancer: ELBv2.LoadBalancer) => false }) => {
  const elbv2 = new ELBv2({ apiVersion: '2015-12-01' });

  const loadBalancers = await describeAll(
    (Marker) => elbv2.describeLoadBalancers({ Marker }),
    (response) => response.LoadBalancers
  );

  winston.debug(`loadBalancer: loadBalancers`, loadBalancers);

  const loadBalancersToPrune = loadBalancers.filter(filter);

  winston.debug('loadBalancer: loadBalancersToPrune', loadBalancersToPrune);

  const promises = loadBalancersToPrune.map(loadBalancer =>
    elbv2.deleteLoadBalancer({ LoadBalancerArn: loadBalancer.LoadBalancerArn })
      .promise()
  );

  await Promise.all(promises);
};
