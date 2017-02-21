import { DISMISS_ERROR } from '../actions/dismissError';
import { INITIALISE } from '../actions/inititialise';
import { REGISTER_REQUEST, REGISTER_SUCESSS, REGISTER_FAILURE } from '../actions/register';
import { REGISTER2_REQUEST, REGISTER2_SUCESSS, REGISTER2_FAILURE } from '../actions/register2';
import { SESSION_REQUEST, SESSION_SUCCESS, SESSION_UNAUTHORISED, SESSION_FAILURE } from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import { PURCHASE_REQUEST, PURCHASE_SUCCESS, PURCHASE_FAILURE } from '../actions/purchase';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/logout';
import { SUPPORT_REQUEST, SUPPORT_SUCCESS, SUPPORT_FAILURE } from '../actions/support';
import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_FAILURE } from '../actions/signin';
import { SIGNIN2_REQUEST, SIGNIN2_SUCCESS, SIGNIN2_FAILURE } from '../actions/signin2';
import { STORE_REQUEST, STORE_SUCCESS, STORE_FAILURE } from '../actions/store';

const getInitialState = () => {
  return {
    initialised: false,
    pending: [],
    user: {
      cardDetails: {}
    },
    store: {},
    register: {},
    error: undefined,
    accessToken: null,
    refreshToken: localStorage.refreshToken
  };
};

const save = (props) => {
  try {
    for (const prop in props) {
      if (props[prop] === undefined) {
        delete localStorage[prop];
      } else {
        localStorage[prop] = props[prop];
      }
    }

    return undefined;

  } catch (e) {
    return Object.assign(new Error('local storage failure'), { code: 'LocalStorageBlocked' });
  }
};

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case INITIALISE: {
      return {
        ...state,
        initialised: true
      };
    }
    case DISMISS_ERROR: {
      return {
        ...state,
        error: undefined
      };
    }
    case REGISTER_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'register']
      };
    }
    case REGISTER_SUCESSS: {
      const { refreshToken } = action.response;
      const error = save({ refreshToken });

      return {
        ...state,
        ...action.response,
        error: error || state.error,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case REGISTER_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case SIGNIN_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin']
      };
    }
    case SIGNIN_SUCCESS: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error
      };
    }
    case SIGNIN_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'signin')
      };
    }
    case SIGNIN2_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin2']
      };
    }
    case SIGNIN2_SUCCESS: {
      const { refreshToken } = action.response;
      const error = save({ refreshToken });

      return {
        ...state,
        ...action.response,
        error: error || state.error,
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case SIGNIN2_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case REGISTER2_REQUEST: {
      return {
        ...state,
        register: {},
        pending: [...state.pending, 'register2']
      };
    }
    case REGISTER2_SUCESSS: {
      const { user } = action.response;
      return {
        ...state,
        user: user,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case REGISTER2_FAILURE: {
      const { registerError, error } = action;
      return {
        ...state,
        register: {
          error: registerError
        },
        error,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case SESSION_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'session']
      };
    }
    case SESSION_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case SESSION_UNAUTHORISED: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error
      };
    }
    case SESSION_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case SUPPORT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'support']
      };
    }
    case SUPPORT_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case SUPPORT_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case LOGOUT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'logout']
      };
    }
    case LOGOUT_SUCCESS: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error
      };
    }
    case LOGOUT_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'logout')
      };
    }
    case TOPUP_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'topup']
      };
    }
    case TOPUP_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...state.user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case TOPUP_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case PURCHASE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'purchase']
      };
    }
    case PURCHASE_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    case PURCHASE_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    case STORE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'store']
      };
    }
    case STORE_SUCCESS: {
      console.log(state.pending);
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => {
          console.log(e);
          return e !== 'store';
        })
      };
    }
    case STORE_FAILURE: {
      return {
        ...state,
        error: action.error,
        pending: state.pending.filter(e => e !== 'store')
      };
    }
    default:
      return state;
  }
};
