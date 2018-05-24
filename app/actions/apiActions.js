import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function getApiList(params, success, failure) {
  return {
    types: types.GET_APILIST,
    callAPI: () => fetchX.get('/atfcapi/apiQuery/list', params),
    success,
    failure,
  };
}

export function getResponsesBodies(params, success, failure) {
  return {
    types: types.GET_RESPONSESBODIES,
    callAPI: () => fetchX.get('/atfcapi/apiQuery/getResponsesBodies', params),
    success,
    failure,
  };
}
