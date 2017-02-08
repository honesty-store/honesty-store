import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCESSS = 'REGISTER_SUCESSS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

const registerRequest = () => ({
  type: REGISTER_REQUEST
});

const registerSuccess = ({ user, store, accessToken, refreshToken }) => ({
  type: REGISTER_SUCESSS,
  response: {
    user,
    store,
    accessToken,
    refreshToken
  }
});

const registerFailure = () => ({
  type: REGISTER_FAILURE
});

export const performRegister = ({ storeCode }) =>
  performTemplate({
    url: '/api/v1/register',
    requestDispatch: registerRequest,
    successDispatch: registerSuccess,
    failureDispatch: registerFailure,
    createBody: async () => ({ storeCode }),
    createToken: undefined,
    onSuccess: () => browserHistory.push(`/store`),
    onFailure: () => browserHistory.push(`/error`)
  });
