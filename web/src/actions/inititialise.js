import { performRegister } from './register';
import { performSession } from './session';
import { performSignin2 } from './signin2';

export const INTIALISE = 'INTIALISE';

const initialise = () => {
  return {
    type: INTIALISE
  };
};

export const performInitialise = ({ storeCode, emailToken }) => async (dispatch, getState) => {
    const { refreshToken, initialised } = getState();
    if (initialised) {
        return;
    }
    if (refreshToken != null) {
        dispatch(initialise());
        return dispatch(performSession({ storeId: storeCode }));
    }
    if (emailToken != null) {
        dispatch(initialise());
        return dispatch(performSignin2({ storeId: storeCode, emailToken }));
    }
    if (storeCode != null) {
        dispatch(initialise());
        return dispatch(performRegister({ storeId: storeCode }));
    }
};