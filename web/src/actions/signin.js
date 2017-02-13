import { browserHistory } from 'react-router';
import { apifetch } from './apirequest';

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

const signinFailure = () => {
  return {
    type: SIGNIN_FAILURE
  };
};

export const performSignin = ({ itemId, emailAddress }) => async (dispatch, getState) => {
  dispatch(signinRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/signin',
      body: {
        emailAddress
      }
    });

    dispatch(signinSuccess(response));
    browserHistory.push(`/signin/success`);

  } catch (e) {
    dispatch(signinFailure());
    if (e.code === 'EmailNotFound') {
      browserHistory.push(`/register/${itemId}/${emailAddress}`);
    } else {
      browserHistory.push(`/error`);
    }
  }
};
