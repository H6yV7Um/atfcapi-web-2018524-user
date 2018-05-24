import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function insertProject(params, success, failure) {
  return {
    types: types.INSERT_PROJECT,
    callAPI: () => fetchX.get('/atfcapi/project/createProject', params),
    success,
    failure,
  };
}

export function updateProject(params, success, failure) {
  return {
    types: types.UPDATE_PROJECT,
    callAPI: () => fetchX.get('/atfcapi/project/updateProject', params),
    success,
    failure,
  };
}

export function getProjects() {
  return {
    types: types.GET_PROJECTS,
    callAPI: () => fetchX.get('/atfcapi/project/getProjects'),
  };
}

export function getProjectList(params) {
  return {
    types: types.GET_PROJECTLIST,
    callAPI: () => fetchX.post('/atfcapi/project/mainPageList', params),
  };
}

export function setLogLevel(params, success, failure) {
  return {
    types: types.SET_LOGLEVEL,
    callAPI: () => fetchX.post('/atfcapi/project/setLogLevel', params),
    payload: { ...params },
    success,
    failure,
  };
}

export function setMock(params, success, failure) {
  return {
    types: types.SET_MOCK,
    callAPI: () => fetchX.post('/atfcapi/project/isMock', params),
    success,
    failure,
  }
}

export function lastProejct(name) {
  return {
    type: types.LASTPROEJCT,
    payload: name
  };
}
