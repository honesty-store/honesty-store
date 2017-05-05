import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';
import express = require('express');
import bodyParser = require('body-parser');
import * as ms from 'ms';

import { createAssertValidUuid } from '../../service/src/assert';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { Item } from './client';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Item>({
  tableName: process.env.TABLE_NAME
});

const itemCache = new Map<string, { item: Item, cacheTime: number }>();
const cacheExpiry = ms('5m');

const assertValidItemId = createAssertValidUuid('itemId');

const getItem = async(itemId): Promise<Item> => {
  assertValidItemId(itemId);

  const now = Date.now();
  const { item: cachedItem, cacheTime } = itemCache.get(itemId);
  if (cachedItem && cacheTime > now - cacheExpiry) {
    return cachedItem;
  }

  const item = await cruft.read({ id: itemId });
  itemCache.set(itemId, { item, cacheTime: now });
  return item;
};

const invalidateCache = () => itemCache.clear();

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
  '/invalidateCache',
  serviceAuthentication,
  async (_key, {}) => invalidateCache()
);

router.get(
  '/:itemId',
  serviceAuthentication,
  async (_key, { itemId }) => getItem(itemId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => void res.sendStatus(200));

app.listen(3000);
