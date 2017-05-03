import { CodedError } from '../../../service/src/error';
import fetch from '../../../service/src/fetch';

export const balanceLimit = 1000; // £10

export interface TransactionBody {
  type: 'topup' | 'purchase' | 'refund';
  amount: number;
  data: {
    [key: string]: string;
  };
  other?: string;
}

export interface TransactionDetails extends TransactionBody {
  timestamp: number;
  next?: string;
}

export interface Transaction extends TransactionDetails {
  id: string;
  legacyId?: string;
}

export interface Account {
  id: string;
  created: number;
  balance: number;
  version: number;
}

export type InternalAccount = Account & { transactionHead?: string } & { cachedTransactions: TransactionList; };

export type TransactionList = Transaction[];

export type AccountAndTransactions = Account & { transactions: TransactionList };

export interface TransactionAndBalance {
  transaction: Transaction;
  balance: number;
}

const { get, post } = fetch('transaction');

export const createAccount = (key, accountId: string) =>
  post<AccountAndTransactions>(1, key, '/account', { accountId });

export const getAccount = (key, accountId: string) =>
  get<AccountAndTransactions>(1, key, `/account/${accountId}`);

export const createTransaction = (key, accountId: string, transaction: TransactionBody) =>
  post<TransactionAndBalance>(1, key, `/account/${accountId}`, transaction);

export const getTransaction = (key, transactionId: string) =>
  get<Transaction>(1, key, `/tx/${transactionId}`);

export const refundTransaction = (key, transactionId: string) =>
  post<TransactionAndBalance>(1, key, `/tx/${transactionId}/refund`, {});

export const assertBalanceWithinLimit = async ({ key, accountId, amount }) => {
  const currentBalance = (await getAccount(key, accountId)).balance;

  // The rhs of the OR expression will never be reached, but is instead used to qualify the type of 'amount'
  if (!Number.isFinite(amount) || typeof amount !== 'number') {
    throw new Error('amount is not a number');
  }

  if (currentBalance + amount > balanceLimit) {
    throw new CodedError(
      'TopupExceedsMaxBalance',
      `topping up would increase balance over the limit of £${balanceLimit / 100}`);
  }
};

export const TEST_DATA_EMPTY_ACCOUNT_ID = 'b423607f-64de-441f-ac39-12d50aaedbe9';
