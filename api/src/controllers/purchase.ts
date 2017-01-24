import { authenticateAccessToken } from '../middleware/authenticate';
import { purchase } from '../services/transaction';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { TransactionAndBalance } from '../../../transaction/src/client/index';

export default (router) => {
  router.post(
    '/purchase',
    authenticateAccessToken,
    (request, response) => {
      const { itemID, quantity } = request.body;
      const { user, key } = request;

      promiseResponse<TransactionAndBalance>(
          purchase({
              key,
              itemID,
              userID: user.id,
              quantity,
              accountID: user.accountId,
              storeID: user.defaultStoreId,
          }),
          key,
          response);
    });
};
