import { browserHistory } from 'react-router';
import { performTemplate } from './template';

export const PURCHASE_REQUEST = 'PURCHASE_REQUEST';
export const PURCHASE_SUCCESS = 'PURCHASE_SUCCESS';
export const PURCHASE_FAILURE = 'PURCHASE_FAILURE';

const purchaseRequest = () => {
  return {
    type: PURCHASE_REQUEST
  };
};

const purchaseSuccess = (response) => {
  return {
    type: PURCHASE_SUCCESS,
    response
  };
};

const purchaseFailure = (error) => {
  return {
    type: PURCHASE_FAILURE,
    error
  };
};

export const performPurchase = ({ itemId, quantity }) =>
  performTemplate({
    url: '/api/v1/purchase',
    requestDispatch: purchaseRequest,
    successDispatch: purchaseSuccess,
    failureDispatch: purchaseFailure,
    createBody: async () => ({ itemID: itemId, quantity }),
    getToken: (getState) => getState().accessToken,
    onSuccess: () => browserHistory.push(`/item/${itemId}/success`),
    onFailure: () => browserHistory.push(`/error`)
  });
