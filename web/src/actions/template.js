export const performTemplate = ({
  url,
  requestDispatch, successDispatch, failureDispatch,
  createBody, createToken,
  onSuccess, onFailure
}) => async (dispatch, getState) => {
  dispatch(requestDispatch());
  try {
    const token = createToken && createToken(getState);
    const response = await fetch(url, {
      method: 'POST',
      body: createBody ? JSON.stringify(await createBody()) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer: ${token}` } : {})
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(successDispatch(json.response));
    onSuccess(json.response);
  }
  catch (e) {
    dispatch(failureDispatch(e));
    onFailure(e);
  }
};
