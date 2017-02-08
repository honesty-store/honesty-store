import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

const logoutRequest = () => {
  return {
    type: LOGOUT_REQUEST
  };
};

const logoutSuccess = (response) => {
  return {
    type: LOGOUT_SUCCESS,
    response
  };
};

const logoutFailure = () => {
  return {
    type: LOGOUT_FAILURE
  };
};

export const performLogout = () =>
  performTemplate({
    url: '/api/v1/logout',
    requestDispatch: logoutRequest,
    successDispatch: logoutSuccess,
    failureDispatch: logoutFailure,
    createBody: undefined,
    createToken: (getState) => getState().accessToken,
    onSuccess: () => browserHistory.push(`/`),
    onFailure: () => void 0,
  });
