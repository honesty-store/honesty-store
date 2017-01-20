import HTTPStatus = require('http-status');
import winston = require('winston');
import { getSessionData, SessionData } from '../services/session';
import { authenticateEmailToken } from '../middleware/authenticate'
import { promiseResponse } from '../../../service/src/endpoint-then-catch';
import { WithRefreshToken, sendMagicLinkEmail } from '../../../user/src/client/index';

export const sendEmailToken = async (emailAddress) => {
  await sendMagicLinkEmail(emailAddress);
  return {};
};

const setupSignInPhase1 = (router) => {
  router.post(
    '/signin',
    (request, response) => {
      const { emailAddress } = request.body;
      promiseResponse<{}>(
          sendEmailToken(emailAddress),
          response,
          HTTPStatus.OK);
    });
};

const signin2 = async (userID) => {
  return await getSessionData(userID);
}

const setupSignInPhase2 = (router) => {
  router.post(
    '/signin2',
    authenticateEmailToken,
    (request, response) => {
      promiseResponse<SessionData & WithRefreshToken>(
          signin2(request.user.id),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};

export default (router) => {
  setupSignInPhase1(router);
  setupSignInPhase2(router);
};
