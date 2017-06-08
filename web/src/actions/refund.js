import apifetch from './apirequest';
import history from '../history';

export const REFUND_REQUEST = 'REFUND_REQUEST';
export const REFUND_SUCCESS = 'REFUND_SUCCESS';
export const REFUND_FAILURE = 'REFUND_FAILURE';

const refundRequest = () => {
  return {
    type: REFUND_REQUEST
  };
};

const refundSuccess = response => {
  return {
    type: REFUND_SUCCESS,
    response
  };
};

const refundFailure = error => {
  return {
    type: REFUND_FAILURE,
    error
  };
};

export const performRefund = ({ transactionId, reason }) => async (
  dispatch,
  getState
) => {
  dispatch(refundRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/refund/${transactionId}`,
        getToken: () => getState().accessToken,
        body: {
          reason
        }
      },
      dispatch,
      getState
    );

    dispatch(refundSuccess(response));
    history.replace(`/refund/success`);
  } catch (e) {
    dispatch(refundFailure(e));
  }
};
