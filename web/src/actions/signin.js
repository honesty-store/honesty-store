import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
export const SIGNIN_FAILURE = 'SIGNIN_FAILURE';

const signinRequest = () => {
  return {
    type: SIGNIN_REQUEST,
  };
};

const signinSuccess = () => {
  return {
    type: SIGNIN_SUCCESS
  };
};

const signinFailure = (error) => {
  return {
    type: SIGNIN_FAILURE,
    error
  };
};

export const performSignin = ({ itemId, emailAddress }) =>
  performTemplate({
    url: '/api/v1/signin',
    requestDispatch: signinRequest,
    successDispatch: signinSuccess,
    failureDispatch: signinFailure,
    createBody: async () => ({ emailAddress }),
    getToken: undefined,
    onSuccess: () => browserHistory.push(`/signin/success`),
    onFailure: (e) => {
      if (e.code === 'EmailNotFound') {
        browserHistory.push(`/register/${itemId}/${emailAddress}`);
      } else {
        browserHistory.push(`/error`);
      }
    }
  });
