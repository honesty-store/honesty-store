import { getCardDetails } from '../../../topup/src/client/index';
import { Transaction } from '../../../transaction/src/client/index';
import { userRegistered } from '../../../user/src/client';
import { storeIDToStoreCode, storeItems } from '../services/store';
import { getTransactionHistory } from '../services/transaction';

export interface SessionData {
  user: {
    balance: number;
    transactions: Transaction[];
  };
  store: {
    code: string;
    items: {
      id: string;
      name: string;
      price: number;
      count: number;
    }[];
  };
}

const getUserSessionData = async (key, user) => {
  const { id, accountId: accountID, emailAddress } = user;
  const allTransactions = accountID ? await getTransactionHistory({ key, accountID }) : [];
  const recentTransactions = allTransactions.slice(0, 10);

  let cardDetails;
  if (userRegistered(user)) {
    try {
      cardDetails = await getCardDetails(key, id);
    } catch (e) {
      if (e.code !== 'NoCardDetailsPresent') {
        throw e;
      }

      /* User is registered but has no card details - this means they managed
       * to sign up but weren't successful in their initial topup.
       *
       * Returning undefined cardDetails will push the frontend/web into
       * retrying the topup.
       */
      cardDetails = undefined;
    }
  }

  return {
    emailAddress,
    balance: allTransactions.reduce((balance, transaction) => balance + transaction.amount, 0),
    transactions: recentTransactions,
    cardDetails
  };
};

const getStoreSessionData = async (user) => {
  const { defaultStoreId } = user;

  const defaultStoreCode = storeIDToStoreCode(defaultStoreId);

  return {
    items: storeItems(defaultStoreCode),
    code: defaultStoreCode
  };
};

export const getSessionData = async (key, { user }) => {
  const { accessToken, refreshToken } = user;
  const [userProfile, store] = await Promise.all([
    getUserSessionData(key, user),
    getStoreSessionData(user)
  ]);
  return {
    user: userProfile,
    store,
    refreshToken,
    accessToken
  };
};
