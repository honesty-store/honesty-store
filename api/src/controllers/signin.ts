import HTTPStatus = require('http-status');
import { sendEmailToken, updateRefreshToken } from '../services/user'
import { getSessionData, SessionData } from '../services/session';
import { authenticateEmailToken } from '../middleware/authenticate'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken } from '../../../user/src/client/index';

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    (request, response) => {
      const { emailAddress } = request.body;
      sendEmailToken(emailAddress)
        .then(() =>
          response.status(HTTPStatus.OK)
            .json({ response: {} }))
        .catch((error) =>
          response.status(HTTPStatus.OK)
            .json({ error: error.message }))
    });
};

const signin2 = async (userID) => {
  const [sessionResponse, { refreshToken }] = await Promise.all([
    getSessionData(userID),
    updateRefreshToken(userID),
  ]);

  return {
    ...sessionResponse,
    refreshToken
  };
}

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    (request, response) => {
      promiseResponse<SessionData & WithRefreshToken>(
          signin2(request.userID),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};
