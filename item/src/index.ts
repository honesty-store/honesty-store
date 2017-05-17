import { config } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import cruftDDB from 'cruft-ddb';
import express = require('express');
import bodyParser = require('body-parser');

import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { serviceAuthentication, serviceRouter } from '@honesty-store/service/src/router';
import { Item } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Item>({
  tableName: process.env.TABLE_NAME
});

const assertValidItemId = createAssertValidUuid('itemId');

const getItem = async(itemId): Promise<Item> => {
  assertValidItemId(itemId);

  return await cruft.read({ id: itemId });
};

const getAllItems = () => cruft.__findAll({});

export const app = express();

app.use(bodyParser.json());

const router = serviceRouter('item', 1);

router.get(
  '/all',
  serviceAuthentication,
  async (_key, {}) => getAllItems()
);

router.get(
  '/:itemId',
  serviceAuthentication,
  async (_key, { itemId }) => getItem(itemId)
);

app.use(AWSXRay.express.openSegment('item'));
app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => void res.sendStatus(200));

app.use(AWSXRay.express.closeSegment());

app.listen(3000);
