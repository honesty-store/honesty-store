import jsonwebtoken = require('jsonwebtoken');
import ms = require('ms');
import { getBaseUrl } from './baseUrl';

const getSecret = () => {
  const secret = process.env.SERVICE_TOKEN_SECRET;
  if (!secret) {
    throw new Error('no $SERVICE_TOKEN_SECRET provided');
  }
  return secret;
};

export const signServiceSecret = () => jsonwebtoken.sign({ baseUrl: getBaseUrl() }, getSecret(), { algorithm: 'HS256', expiresIn: '30s' });

export const verifyServiceSecret = (opaqueObject) => {
  const { baseUrl: foundBaseUrl } = jsonwebtoken.verify(opaqueObject, getSecret(), { algorithms: ['HS256'], clockTolerance: ms('30s') });

  if (foundBaseUrl !== getBaseUrl()) {
    const e: any = new Error('Incorrect service secret');
    e.invalidServiceSecret = foundBaseUrl;
    throw e;
  }
};
