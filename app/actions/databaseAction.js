import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function testConnection(params, success, failure) {
  return {
    types: types.TESTCONNECTION,
    callAPI: () => fetchX.post('/atfcapi/database/testConnection', params),
    success,
    failure,
  };
}

export function testSuccess(result) {
  return {
    type: types.TESTSUCCESS,
    payload: result,
  };
}

export function saveDbconfig(method, params, success, failure) {
  return {
    types: types.SAVEDBCONFIG,
    callAPI: () => fetchX[method.toLowerCase()]('/atfcapi/database/', params),
    success,
    failure,
  };
}

export function getConfigData(configId, success, failure) {
  return {
    types: types.GETCONFIGDATA,
    callAPI: () => fetchX.get(`/atfcapi/database/${configId}`),
    success,
    failure,
  };
}

export function getAllAlias(success, failure) {
  return {
    types: types.GETALLALIAS,
    callAPI: () => fetchX.get('/atfcapi/database/getAllAlias'),
    success,
    failure,
  };
}

export function getDbList(params, success, failure) {
  return {
    types: types.GETDBLIST,
    callAPI: () => fetchX.post('/atfcapi/database/list', params),
    success,
    failure,
  };
}

export function deleteDbconfig(configId, success, failure) {
  return {
    types: types.DELETEDBCONFIG,
    callAPI: () => fetchX.delete(`/atfcapi/database/${configId}`),
    success,
    failure,
  };
}
