import { browserHistory } from 'react-router';
import { apifetch } from './apirequest';

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

export const performSession = () => async (dispatch, getState) => {
  dispatch(sessionRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/session',
      token: getState().refreshToken
    });

    dispatch(sessionSuccess(response));

  } catch (e) {
    if (e.code === 'NetworkError') {
      dispatch(sessionUnauthorised());
      browserHistory.push(`/`);
      return;
    }

    dispatch(sessionFailure());
    browserHistory.push(`/error`);
  }
};
