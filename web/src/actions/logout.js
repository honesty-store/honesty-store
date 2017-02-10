import { browserHistory } from 'react-router';
import { apifetch, unpackJson } from './apirequest';

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

export const performLogout = () => async (dispatch, getState) => {
  dispatch(logoutRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/logout',
      token: getState().accessToken
    });

    dispatch(logoutSuccess(await unpackJson(response)));
    browserHistory.push(`/`);

  } catch (e) {
    dispatch(logoutFailure());
  }
};
