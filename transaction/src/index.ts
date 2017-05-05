import { config } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');

import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { assertValidAccountId, createAccount, getAccountInternal, updateAccount } from './account';
import {
  AccountAndTransactions, balanceLimit, InternalAccount,
  TEST_DATA_EMPTY_ACCOUNT_ID, TransactionAndBalance,
  TransactionBody, TransactionDetails
} from './client';
import {
  assertValidTransaction, createTransactionId, extractFieldsFromTransactionId,
  getTransaction, getTransactions, hashTransaction, putTransaction, walkTransactions
} from './transaction';

const ACCOUNT_TRANSACTION_CACHE_SIZE = 10;
const GET_TRANSACTION_LIMIT = 10;

config.region = process.env.AWS_REGION;

const getAccountAndTransactions = async ({ accountId, limit = GET_TRANSACTION_LIMIT }): Promise<AccountAndTransactions> => {
  assertValidAccountId(accountId);

  const { transactionHead, cachedTransactions, ...externalAccount } = await getAccountInternal({ accountId });

  const idToFetch = cachedTransactions.length > 0
    ? cachedTransactions[cachedTransactions.length - 1].next
    : transactionHead;

  const transactions = idToFetch ? await getTransactions({
    transactionId: idToFetch,
    limit: limit - cachedTransactions.length
  }) : [];

  return {
    ...externalAccount,
    transactions: [
      ...cachedTransactions,
      ...transactions
    ]
  };
};

const createTransaction = async (
  originalAccount: InternalAccount,
  body: TransactionBody,
): Promise<TransactionAndBalance> => {
  const transactionDetails: TransactionDetails = {
    timestamp: Date.now(),
    next: originalAccount.transactionHead,
    ...body
  };

  const transaction = {
    id: createTransactionId({ accountId: originalAccount.id, transactionId: hashTransaction(transactionDetails) }),
    ...transactionDetails
  };

  assertValidTransaction(transaction);

  const updatedBalance = originalAccount.balance + transaction.amount;

  if (updatedBalance < 0) {
    throw new Error(`Balance would be negative ${updatedBalance}`);
  }
  if (updatedBalance > balanceLimit) {
    throw new Error(`Balance would be greater than ${balanceLimit} (${updatedBalance})`);
  }

  // is this ok  - if updateAccount fails do we end up putting a dangling transaction in the db?
  await putTransaction(transaction);

  const updatedAccount: InternalAccount = {
    ...originalAccount,
    version: originalAccount.version + 1,
    balance: updatedBalance,
    transactionHead: transaction.id,
    cachedTransactions: [transaction, ...originalAccount.cachedTransactions.slice(0, ACCOUNT_TRANSACTION_CACHE_SIZE - 1)]
  };

  await updateAccount({ updatedAccount, originalAccount });

  return {
    transaction: transaction,
    balance: updatedAccount.balance
  };
};

const refundTransaction = async (transactionId: string) => {
  const { accountId } = extractFieldsFromTransactionId(transactionId);
  const account = await getAccountInternal({ accountId });

  const transactionToRefund = await getTransaction(transactionId);

  if (transactionToRefund.type !== 'purchase') {
    throw new Error(`Only purchase transactions may be refunded`);
  }

  for await (const transaction of walkTransactions(account.transactionHead)) {
    if (transaction.type === 'refund' && transaction.other === transactionId) {
      throw new Error(`Refund already issued for transactionId ${transactionId}`);
    }
    if (transaction.id === transactionId) {
      break;
    }
  }

  const response = await createTransaction(
    account,
    {
      type: 'refund',
      amount: -transactionToRefund.amount,
      data: {},
      other: transactionToRefund.id
    }
  );
  return {
    balance: response.balance,
    transaction: response.transaction
  };
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('transaction', 1);

router.get(
  '/account/:accountId',
  serviceAuthentication,
  async (_key, { accountId }) => await getAccountAndTransactions({ accountId })
);

router.post(
  '/account/:accountId',
  serviceAuthentication,
  async (_key, { accountId }, { type, amount, data }) => {
    const account = await getAccountInternal({ accountId });
    return await createTransaction(account, { type, amount, data });
  }
);

router.post(
  '/account',
  serviceAuthentication,
  async (_key, {}, { accountId }) => {
    const internalAccount = await createAccount({ accountId });
    const { transactionHead, cachedTransactions, ...externalAccount } = internalAccount;
    return externalAccount;
  }
);

router.get(
  '/tx/:transactionId',
  serviceAuthentication,
  async (_key, { transactionId }) => await getTransaction(transactionId)
);

router.post(
  '/tx/:transactionId/refund',
  serviceAuthentication,
  async (_key, { transactionId }) => await refundTransaction(transactionId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  getAccountAndTransactions({ accountId: TEST_DATA_EMPTY_ACCOUNT_ID })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

app.listen(3000);
