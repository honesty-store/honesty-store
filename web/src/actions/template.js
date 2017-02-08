import { browserHistory } from 'react-router';

export const performTemplate = ({
  url,
  requestDispatch, successDispatch, failureDispatch,
  unauthDispatch = undefined,
  createBody, getToken,
  onSuccess, onFailure
}) => async (dispatch, getState) => {
  dispatch(requestDispatch());
  try {
    const token = getToken && getToken(getState);
    const response = await fetch(url, {
      method: 'POST',
      body: createBody ? JSON.stringify(await createBody()) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer: ${token}` } : {})
      }
    });
    if (unauthDispatch && response.status === 401) {
      dispatch(unauthDispatch());
      browserHistory.push(`/`);
      return;
    }
    const json = await response.json();
    if (json.error) {
      const error = new Error(json.error.message);
      if (json.error.code) {
        throw Object.assign(error, { code: json.error.code });
      }
      throw error;
    }
    dispatch(successDispatch(json.response));
    onSuccess(json.response);
  }
  catch (e) {
    dispatch(failureDispatch(e));
    onFailure(e);
  }
};
