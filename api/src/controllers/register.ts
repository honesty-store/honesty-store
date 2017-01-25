import isEmail = require('validator/lib/isEmail');
import HTTPStatus = require('http-status');
import { error } from '../../../service/src/log';
import uuid = require('uuid/v4');

import { createUserKey, createUnauthenticatedKey } from '../../../service/src/key';
import { createUser, updateUser } from '../../../user/src/client/index';
import { createAccount, TransactionDetails, TransactionAndBalance } from '../../../transaction/src/client/index';
import { getPrice } from '../services/store';
import { purchase } from '../services/transaction';
import { getSessionData, SessionData } from '../services/session';
import { authenticateAccessToken } from '../middleware/authenticate';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken, WithAccessToken } from '../../../user/src/client/index';
import { storeCodeToStoreID } from '../services/store'
import { createTopup, TopupResponse, CardDetails } from '../../../topup/src/client/index'

const register = async (storeCode) => {
  const userId = uuid();
  const accountId = uuid();
  const profile = {
    accountId,
    defaultStoreId: storeCodeToStoreID(storeCode),
  };
  const key = createUserKey({ userId });
  const user = await createUser(key, userId, profile)
  const account = await createAccount(key, accountId);

  return await getSessionData(key, { user });
};

interface RegistrationSessionData {
  user: {
    balance: number;
    transactions: TransactionDetails[];
    cardDetails: CardDetails;
  };
}

const register2 = async (key, { userID, emailAddress, topUpAmount, itemID, stripeToken }) => {
  const user = await updateUser(key, userID, { emailAddress });

  const topupTx = await createTopup(key, { accountId: user.accountId, userId: user.id, amount: topUpAmount, stripeToken });

  let purchaseTx: TransactionAndBalance = null;
  try {
    purchaseTx = await purchase({
        key,
        itemID,
        userID,
        quantity: 1,
        accountID: user.accountId,
        storeID: user.defaultStoreId,
    });
  } catch (e) {
    /* We don't want to fail if the item could not be purchased, however the client
       is expected to assert that a transaction exists for the item and alert the user
       appropriately if one doesn't. */
    error(key, `couldn't purchase item ${itemID}`, e);
  }

  return {
    user: {
      ...user,
      balance: purchaseTx == null ? topupTx.balance : purchaseTx.balance,
      transactions: [
        ...(purchaseTx != null ? [purchaseTx.transaction] : []),
        topupTx.transaction
      ],
      cardDetails: topupTx.cardDetails,
    }
  };
};

const setupRegisterPhase1 = (router) => {
  router.post(
    '/register',
    (request, response) => {
      const { storeCode } = request.body;
      request.key = createUnauthenticatedKey();

      type ResultType = SessionData & WithRefreshToken & WithAccessToken;

      promiseResponse<ResultType>(register(storeCode), request, response, HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

const setupRegisterPhase2 = (router) => {
  router.post(
    '/register2',
    authenticateAccessToken,
    (request, response) => {
      const emailAddress = request.body.emailAddress || '';
      if (!isEmail(emailAddress)) {
        response.status(HTTPStatus.UNAUTHORIZED)
          .json({
            error: {
              message: 'Invalid email address provided',
            },
          });
        return;
      }

      const { itemID, topUpAmount, stripeToken } = request.body;
      const { user: { id: userID }, key } = request;

      promiseResponse<RegistrationSessionData>(
          register2(key, { userID, emailAddress, topUpAmount, itemID, stripeToken }),
          request,
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupRegisterPhase1(router);
  setupRegisterPhase2(router);
};
