// tslint:disable:variable-name
import { Route53 } from 'aws-sdk';
import * as winston from 'winston';

const HostedZoneId = 'Z1NOZ8HJXP3L7I';

export const aliasToName = (alias) => `${alias}.honesty.store`;

export const aliasToBaseUrl = (alias) => `https://${aliasToName(alias)}`;

export const ensureAlias = async ({ alias, value }) => {
  const resourceRecordSet: Route53.ResourceRecordSet = {
    Name: aliasToName(alias),
    Type: 'CNAME',
    ResourceRecords: [
      { Value: value }
    ],
    TTL: 300
  };

  const response = await new Route53({ apiVersion: '2013-04-01' })
    .changeResourceRecordSets({
      HostedZoneId,
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: resourceRecordSet
          }
        ]
      }
    })
    .promise();

  winston.debug('alias: response', response);

  return resourceRecordSet;
};

const extractName = (name) => name.split('.')[0];

export const pruneAliases = async ({ filter = (_name: string) => false }) => {
  const route53 = new Route53({ apiVersion: '2013-04-01' });

  const listResponse = await route53.listResourceRecordSets({ HostedZoneId })
    .promise();

  winston.debug('alias: listResourceRecordSets', listResponse.ResourceRecordSets);

  const resourceRecordSetsToPrune = listResponse.ResourceRecordSets
    .filter(resourceRecordSet => {
      if (resourceRecordSet.Type !== 'CNAME') {
        return false;
      }
      if (resourceRecordSet.Name.match(/_domainkey/)) {
        // required for DKIM email signing
        return false;
      }
      return filter(extractName(resourceRecordSet.Name));
    });

  winston.debug('alias: recordSetsToPrune', resourceRecordSetsToPrune);

  const changes = resourceRecordSetsToPrune.map(resourceRecordSet => ({
    Action: 'DELETE',
    ResourceRecordSet: resourceRecordSet
  }));

  if (changes.length === 0) {
    return;
  }

  await route53.changeResourceRecordSets({
    HostedZoneId,
    ChangeBatch: {
      Changes: changes
    }
  })
    .promise();
};
