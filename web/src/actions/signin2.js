import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const SIGNIN2_REQUEST = 'SIGNIN2_REQUEST';
export const SIGNIN2_SUCCESS = 'SIGNIN2_SUCCESS';
export const SIGNIN2_FAILURE = 'SIGNIN2_FAILURE';

const signin2Request = () => {
  return {
    type: SIGNIN2_REQUEST,
  };
};

const signin2Success = (response) => {
  return {
    type: SIGNIN2_SUCCESS,
    response
  };
};

const signin2Failure = (error) => {
  return {
    type: SIGNIN2_FAILURE,
    error
  };
};

export const performSignin2 = ({ emailToken }) =>
  performTemplate({
    url: '/api/v1/signin2',
    requestDispatch: signin2Request,
    successDispatch: signin2Success,
    failureDispatch: signin2Failure,
    createBody: async () => ({}),
    getToken: (getState) => emailToken,
    onSuccess: () => browserHistory.push(`/store`),
    onFailure: () => browserHistory.push(`/error`)
  });
