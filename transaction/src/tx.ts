import { createHash } from 'crypto';

import { DynamoDB } from 'aws-sdk';
import stringify = require('json-stable-stringify');

import { Transaction, TransactionBody } from './client';

type TransactionChain = Transaction & { next?: TransactionChain };
type DBTransaction = Transaction & { next?: string };

export const assertValidTransaction = ({ type, amount, data }: Transaction) => {
  if (type == null || (type !== 'topup' && type !== 'purchase')) {
    throw new Error(`Invalid transaction type ${type}`);
  }
  if (!Number.isInteger(amount) /* this also checks typeof amount */) {
    throw new Error(`Non-integral transaction amount ${amount}`);
  }
  if ((type === 'topup' && amount <= 0) || (type === 'purchase' && amount >= 0)) {
    throw new Error(`Invalid transaction amount for type '${type}': ${amount}`);
  }
  if (data == null || typeof data !== 'object') {
    throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
  }
  for (const key of Object.keys(data)) {
    if (typeof data[key] !== 'string') {
      throw new Error(`Invalid transaction data ${JSON.stringify(data)}`);
    }
  }
};

export const hashTransaction = (tx: TransactionBody & { next?: string }) => {
  const hash = createHash('sha256');

  hash.update(stringify(tx));

  return hash.digest('hex');
};

export const createTransactionId = ({ accountId, txId }) => `${accountId}:${txId}`;

const getTransaction = async (id) => {
  const response = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: { id }
    })
    .promise();

  const { Item: item } = response;
  if (item == null) {
    throw new Error(`Transaction not found ${id}`);
  }

  return <DBTransaction>item;
};

const getTransactionChain = async ({ txId, limit = Infinity }): Promise<TransactionChain> => {
  if (!txId) {
    return undefined;
  }
  if (limit <= 0) {
    return undefined;
  }

  const tx = await getTransaction(txId);

  return {
    ...tx,
    next: await getTransactionChain({ txId: tx.next, limit: limit - 1 })
  };
};

const txChainToArray = (chain) => {
  const txs = [];
  for (let tx = chain; tx; tx = tx.next) {
    // tslint:disable-next-line:no-unused-variable
    const { next, ...externalisedTx } = tx;
    txs.push(externalisedTx);
  }
  return txs;
};

export const getTransactions = async ({ txId, limit = Infinity }) => {
  const chain = await getTransactionChain({ txId, limit });
  return txChainToArray(chain);
};

export const putTransaction = async (tx: DBTransaction) => {
  assertValidTransaction(tx);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: tx
    })
    .promise();
};