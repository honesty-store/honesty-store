import { DynamoDB } from 'aws-sdk';
import { createHash } from 'crypto';
import stringify = require('json-stable-stringify');
import isUUID = require('validator/lib/isUUID');

import { InternalTransaction, Transaction, TransactionDetails } from './client';

const isSHA256 = (hash) => /^[a-f0-9]{64}$/.test(hash);

export const extractFieldsFromTransactionId = (id: string) => {
  const [, accountId, transactionId, ...rest] = /(.*):(.*)/.exec(id);

  return {
    accountId,
    transactionId,
    ...rest
  };
};

const assertValidTransactionId = (id) => {
  const { accountId, transactionId, ...rest } = extractFieldsFromTransactionId(id);

  if (rest.length) {
    throw new Error(`Transaction id isn't <accountId>:<transactionHash> (${id})`);
  }

  if (!isUUID(accountId)) {
    throw new Error(`Transaction id's accountId isn't a uuid (${accountId})`);
  }

  if (!isSHA256(transactionId)) {
    throw new Error(`Transaction hash isn't a SHA256 hash (${transactionId})`);
  }
};

export const createTransactionId = ({ accountId, transactionId }) => `${accountId}:${transactionId}`;

export const hashTransaction = (transaction: TransactionDetails) => {
  const hash = createHash('sha256');

  hash.update(stringify(transaction));

  return hash.digest('hex');
};

export const assertValidTransaction = async ({ type, amount, data, id }: Transaction) => {
  assertValidTransactionId(id);
  if (type == null || (type !== 'topup' && type !== 'purchase' && type !== 'refund')) {
    throw new Error(`Invalid transaction type ${type}`);
  }
  if (!Number.isInteger(amount) /* this also checks typeof amount */) {
    throw new Error(`Non-integral transaction amount ${amount}`);
  }
  if (((type === 'topup' || type === 'refund') && amount <= 0) || (type === 'purchase' && amount >= 0)) {
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

export const getTransaction = async (id) => {
  await assertValidTransactionId(id);
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

  return <InternalTransaction>item;
};

const walkTransactions = async (transactionId: string, shouldContinue: (transaction: InternalTransaction) => boolean) => {
  const transaction = await getTransaction(transactionId);
  if (!transaction.next) {
    return;
  }

  if (!shouldContinue(transaction)) {
    return;
  }

  await walkTransactions(transaction.next, shouldContinue);
};

export const assertRefundableTransaction = async ({ id, type }, transactionHead) => {
  if (type !== 'purchase') {
    throw new Error(`Only purchase transactions may be refunded`);
  }

  await walkTransactions(transactionHead, (transaction) => {
    if (transaction.type === 'refund' && transaction.data['refundedTransactionId'] === id) {
      throw new Error(`Refund already issued for transactionId ${id}`);
    }
    return transaction.id === id;
  });
};

export const getTransactions = async ({ transactionId, limit = Infinity }): Promise<Transaction[]> => {
  const transactions = [];
  await walkTransactions(transactionId, (transaction) => {
    transactions.push(transaction);
    return transactions.length < limit;
  });
  return transactions;
};

export const putTransaction = async (transaction: InternalTransaction) => {
  assertValidTransaction(transaction);

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: transaction
    })
    .promise();
};
