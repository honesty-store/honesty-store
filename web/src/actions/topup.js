import { browserHistory } from 'react-router';
import { performTemplate } from './template';

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
    error
  };
};

export const performTopup = ({ amount }) =>
  performTemplate({
    url: '/api/v1/topup',
    requestDispatch: topupRequest,
    successDispatch: topupSuccess,
    failureDispatch: topupFailure,
    createBody: async () => ({ amount }),
    getToken: (getState) => getState().accessToken,
    onSuccess: () => browserHistory.push(`/topup/success`),
    onFailure: () => browserHistory.push(`/error`)
  });
