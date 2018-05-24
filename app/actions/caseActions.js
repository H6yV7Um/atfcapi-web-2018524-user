import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function startRun(params, success, failure) {
  return {
    types: types.RUNCASE,
    callAPI: () => fetchX.get('/atfcapi/suiteCase/runTestCase', params),
    success,
    failure,
  }
}
/**
 * [根据文件夹id获取全部case]
 * @param  {[type]} params  [folderId]
 * @return {[type]}         [description]
 */
export function getAllCases(folderId, success, failure) {
  return {
    types: types.GET_ALLCASES,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/getAll', { folderId }),
    success,
    failure
  };
}
// 分页
export function getCaseList(params, success, failure) {
  return {
    types: types.GET_CASELIST,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/list', params),
    success,
    failure,
  };
}
// 获取某个case下的api列表
export function getApiList(params, success, failure) {
  return {
    types: types.GET_CASE_APILIST,
    callAPI: () => fetchX.get('/atfcapi/suiteCase/descriptionList', params),
    success,
    failure,
  };
}

export function insertCaseInfo(params, success, failure) {
  return {
    types: types.INSERT_CASEINFO,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/insertCaseInfo', params),
    success,
    failure,
  };
}

export function deleteCaseInfo(params, success, failure) {
  return {
    types: types.DELETE_CASEINFO,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/deleteCaseInfo', params),
    success,
    failure,
  };
}

export function updateCaseInfo(params, success, failure) {
  return {
    types: types.UPDATE_CASEINFO,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/updateCaseInfo', params),
    success,
    failure,
  };
}

export function replaceCaseInfo(params, success, failure) {
  return {
    types: types.REPLACE_CASEINFO,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/replaceCaseInfo', params),
    success,
    failure,
  };
}

export function copyCaseInfo(params, success, failure) {
  return {
    types: types.COPY_CASEINFO,
    callAPI: () => fetchX.fetch('/atfcapi/suiteCase/copyCaseInfo',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }),
    success,
    failure
  };
}

export function addCase(params, success, failure) {
  return {
    types: types.ADD_CASE,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/addSuite', params),
    success,
    failure
  };
}

export function deleteCase(id, success, failure) {
  return {
    types: types.DELETE_CASE,
    callAPI: () => fetchX.delete(`/atfcapi/suiteCase/deleteSuite/${id}`),
    success,
    failure,
  };
}

export function getCase(params, success, failure) {
  return {
    types: types.GET_CASE,
    callAPI: () => fetchX.get('/atfcapi/suiteCase/getCaseApi', params),
    success,
    failure,
  };
}

export function debugCase(params, success, failure) {
  return {
    types: types.DEBUG_CASE,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/debugTestCase', params),
    success,
    failure,
  };
}

export function copyCase(params, success, failure) {
  return {
    types: types.COPY_CASE,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/copy', params),
    success,
    failure,
  };
}

export function moveCase(params, success, failure) {
  return {
    types: types.MOVE_CASE,
    callAPI: () => fetchX.post('/atfcapi/suiteCase/move', params),
    success,
    failure,
  };
}

export function getGlobal(params, success, failure) {
  return {
    types: types.GET_GLOBAL,
    callAPI: () => fetchX.get('/atfcapi/suiteCase/getGlobal', params),
    success,
    failure,
  };
}

export function getFailedCategory(success, failure) {
  return {
    types: types.GETFAILEDCATEGORY,
    callAPI: () => fetchX.get('/atfcapi/failCase/category'),
    success,
    failure,
  };
}

export function getFailedList(params, success, failure) {
  return {
    types: types.GETFAILEDLIST,
    callAPI: () => fetchX.post('/atfcapi/failCase/list', params),
    success,
    failure,
  };
}

export function saveFailedDetail(params, success, failure) {
  return {
    types: types.SAVEFAILEDDETAIL,
    callAPI: () => fetchX.put('/atfcapi/failCase/update', params),
    success,
    failure,
  };
}
