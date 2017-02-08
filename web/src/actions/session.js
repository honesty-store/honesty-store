import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const SESSION_REQUEST = 'SESSION_REQUEST';
export const SESSION_SUCCESS = 'SESSION_SUCCESS';
export const SESSION_UNAUTHORISED = 'SESSION_UNAUTHORISED';
export const SESSION_FAILURE = 'SESSION_FAILURE';

const sessionRequest = () => {
  return {
    type: SESSION_REQUEST,
  };
};

const sessionSuccess = (response) => {
  return {
    type: SESSION_SUCCESS,
    response
  };
};

const sessionFailure = () => {
  return {
    type: SESSION_FAILURE
  };
};

const sessionUnauthorised = () => {
  return {
    type: SESSION_UNAUTHORISED
  };
};

export const performSession = () =>
  performTemplate({
    url: '/api/v1/session',
    requestDispatch: sessionRequest,
    successDispatch: sessionSuccess,
    failureDispatch: sessionFailure,
    unauthDispatch: sessionUnauthorised,
    createBody: undefined,
    createToken: (getState) => getState().accessToken,
    onSuccess: () => void 0,
    onFailure: () => browserHistory.push(`/error`)
  });
