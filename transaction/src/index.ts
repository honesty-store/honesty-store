import { config } from 'aws-sdk';

import { lambdaRouter } from '@honesty-store/service/src/lambdaRouter';
import { assertValidAccountId, createAccount, getAccountInternal, updateAccount } from './account';
import {
  AccountAndTransactions, balanceLimit, InternalAccount,
  TransactionAndBalance, TransactionDetails
} from './client';
import { assertValidTransaction, createTransactionId, getTransactions, hashTransaction, putTransaction } from './transaction';

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

const createTransaction = async ({ accountId, type, amount, data }): Promise<TransactionAndBalance> => {
  assertValidAccountId(accountId);

  const originalAccount = await getAccountInternal({ accountId });

  const transactionDetails: TransactionDetails = {
    timestamp: Date.now(),
    type,
    amount,
    data,
    next: originalAccount.transactionHead
  };

  const transaction = {
    id: createTransactionId({ accountId, transactionId: hashTransaction(transactionDetails) }),
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

export const router = lambdaRouter('transaction', 1);

router.get(
  '/:accountId',
  async (_key, { accountId }) => await getAccountAndTransactions({ accountId })
);

router.post(
  '/:accountId',
  async (_key, { accountId }, { type, amount, data }) =>
    await createTransaction({ accountId, type, amount, data })
);

router.post(
  '/',
  async (_key, {}, { accountId }) => {
    const internalAccount = await createAccount({ accountId });
    const { transactionHead, cachedTransactions, ...externalAccount } = internalAccount;
    return externalAccount;
  }
);
