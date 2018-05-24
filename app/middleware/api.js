export default function callAPIMiddleware({ dispatch, getState }) {
  return function(next) {
    return function(action) {
      const {
        types,
        callAPI,
        shouldCallAPI = () => true,
        payload = {},
        success,
        failure,
      } = action;

      if (!types) {
        // 普通 action：传递
        return next(action);
      }

      if (
        !Array.isArray(types) ||
        types.length !== 3 ||
        !types.every(type => typeof type === 'string')
      ) {
        throw new Error('Expected an array of three string types.');
      }

      if (typeof callAPI !== 'function') {
        throw new Error('Expected fetch to be a function.');
      }

      if (!shouldCallAPI(getState())) {
        return false;
      }

      const [requestType, successType, failureType] = types;

      dispatch(Object.assign({}, payload, {
        type: requestType,
      }));

      return callAPI().then(json => {
        if (json.code === '200') {
          dispatch(Object.assign({}, payload, {
            response: json,
            type: successType,
          }));
          if (typeof success === 'function') success(json.msg);
        } else {
          failure(json.msg || json.message);
          dispatch(Object.assign({}, payload, {
            error: json,
            type: failureType,
          }));
        }
      })
      .catch(error => {
        dispatch(Object.assign({}, payload, {
          error: error,
          type: failureType,
        }));
      });
    };
  };
}
