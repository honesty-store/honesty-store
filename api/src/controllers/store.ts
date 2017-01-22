import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate'
import { updateUser } from '../../../user/src/client/index';
import { getItems, storeCodeToStoreID } from '../services/store'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { createUserKey } from '../../../service/src/key';

interface Item {
    id: string;
    name: string;
    price: number;
};

type ItemAndCount = Item & { count: number };

const updateDefaultStoreCode = async (userID, storeCode) => {
  const key = createUserKey({ userId: userID });
  return await updateUser(key, userID, { defaultStoreId: storeCodeToStoreID(storeCode) });
};

const updateStoreAndGetItems = async (userId, storeCode) => {
    await updateDefaultStoreCode(userId, storeCode);
    return getItems(storeCode);
};

export default (router) => {
  router.post(
    '/store',
    authenticateAccessToken,
    (req, res) => {
      const { storeCode } = req.body;

      promiseResponse<ItemAndCount[]>(
          updateStoreAndGetItems(req.user.id, storeCode),
          res,
          HTTPStatus.OK);
    });
};
