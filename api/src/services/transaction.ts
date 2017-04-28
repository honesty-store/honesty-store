import * as moment from 'moment';
import { getItem } from '../../../item/src/client';
import { CodedError } from '../../../service/src/error';
import { createTransaction, getAccount, getTransaction, refundTransaction, TransactionBody } from '../../../transaction/src/client/index';
import { getItemPriceFromStore } from './store';

const expandItemDetails = async (key, transaction) => {
  const { itemId } = transaction.data;
  const item = itemId && await getItem(key, itemId);
  return {
    ...transaction,
    data: {
      ...transaction.data,
      item
    }
  };
};

const pageItems = <T>({ items, page, perPage = 10 }: { items: T[], page: number, perPage?: number }) => {
  const startIndex = perPage * page;
  const endIndex = Math.min(startIndex + perPage, items.length);
  return items.slice(startIndex, endIndex);
};

const assertValidQuantity = (quantity) => {
  if (!Number.isInteger(quantity)) {
    throw new Error(`quantity ${quantity} isn't an integer`);
  }
  if (quantity <= 0) {
    throw new Error(`quantity ${quantity} too small`);
  }
  if (quantity > 10) {
    throw new CodedError('TooManyPurchaseItems', `quantity ${quantity} too large`);
  }
};

const assertTransactionIsRefundable = async (key, transactionId, userId) => {
  const { timestamp, data: { userId: transactionUserId } } = await getTransaction(key, transactionId);
  const refundCutOffDate = moment().subtract(1, 'hours').unix();
  if (timestamp < refundCutOffDate) {
    throw new CodedError('RefundRequestPeriodExpired', 'Refunds can only be requested up to 1 hour after initial purchase');
  }
  if (!transactionUserId || transactionUserId !== userId) {
    throw new Error(`userId contained within transaction ${transactionId} does not match id of user requesting refund (${userId})`);
  }
};

export const purchase = async ({ key, itemID, userID, accountID, storeID, quantity }) => {
  assertValidQuantity(quantity);

  const price = quantity * await getItemPriceFromStore(key, storeID, itemID);

  const transaction: TransactionBody = {
    type: 'purchase',
    amount: -price,
    data: {
      quantity: String(quantity),
      itemId: itemID,
      userId: userID,
      storeId: storeID
    }
  };

  const response = await createTransaction(key, accountID, transaction);
  return {
    balance: response.balance,
    transaction: await expandItemDetails(key, response.transaction)
  };
};

export const refund = async ({ key, transactionId, userId }) => {
  await assertTransactionIsRefundable(key, transactionId, userId);
  return await refundTransaction(key, transactionId);
};

export const getExpandedTransactionsAndBalance = async ({ key, accountID, page = 0 }) => {
  const { balance, transactions: rawTransactions } = await getAccount(key, accountID);
  const transactionPromises = pageItems({
      items: rawTransactions,
      page
    })
    .map(item => expandItemDetails(key, item));

  return {
    balance,
    transactions: await Promise.all(transactionPromises)
  };
};
