import { browserHistory } from 'react-router';

export const TOPUP_REQUEST = 'TOPUP_REQUEST';
export const TOPUP_SUCCESS = 'TOPUP_SUCCESS';
export const TOPUP_FAILURE = 'TOPUP_FAILURE';

const topupRequest = () => {
  return {
    type: TOPUP_REQUEST,
  };
};

const topupSuccess = (response) => {
  return {
    type: TOPUP_SUCCESS,
    response
  };
};

const topupFailure = (error) => {
  return {
    type: TOPUP_FAILURE,
    error,
  };
};

export const performTopup = ({ amount }) => async (dispatch, getState) => {
  dispatch(topupRequest());
  try {
    const accessToken = getState().accessToken;
    const response = await fetch('/api/v1/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(topupSuccess(json.response));
    browserHistory.push(`/topup/success`);
  }
  catch (e) {
    if (e.message.indexOf('topping up would increase balance over the limit') !== -1) {
      dispatch(topupFailure(e.message));
      browserHistory.push(`/error`);
    } else {
      dispatch(topupFailure());
      browserHistory.push(`/topup/error`);
    }
  }
};
