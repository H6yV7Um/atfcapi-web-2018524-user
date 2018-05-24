import fetchX from 'fetch-x';

fetchX.applyMiddleware({
  response: [res => res.json(), json => {
    if (json.code === '401') {
      window.location.href = `${ATFCAPI.HOME}?from=${window.location.href}`;
    } else {
      return json;
    }
  }],
  request: request => {
    if (ATFCAPI.PROXY) {
      request.url = ATFCAPI.PROXY + request.url;
    }
    return request;
  }
})

export default fetchX;
