import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const SUPPORT_REQUEST = 'SUPPORT_REQUEST';
export const SUPPORT_SUCCESS = 'SUPPORT_SUCCESS';
export const SUPPORT_FAILURE = 'SUPPORT_FAILURE';

const supportRequest = () => {
  return {
    type: SUPPORT_REQUEST,
  };
};

const supportSuccess = () => {
  return {
    type: SUPPORT_SUCCESS
  };
};

const supportFailure = (error) => {
  return {
    type: SUPPORT_FAILURE,
    error
  };
};

export const performSupport = ({ message, emailAddress }) =>
  performTemplate({
    url: '/api/v1/support',
    requestDispatch: supportRequest,
    successDispatch: supportSuccess,
    failureDispatch: supportFailure,
    createBody: async () => {
      const userAgent = navigator.userAgent;
      return {
        message,
        emailAddress,
        userAgent
      };
    },
    getToken: (getState) => getState().accessToken,
    onSuccess: () => browserHistory.push(`/help/success`),
    onFailure: () => browserHistory.push(`/error`)
  });
