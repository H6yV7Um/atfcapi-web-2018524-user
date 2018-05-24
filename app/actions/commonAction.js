import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function getAllEvn(success, failure) {
  return {
    types: types.GETALLEVN,
    callAPI: () => fetchX.get('/atfcapi/commonConfig/getAllEvn'),
    success,
    failure,
  };
}

export function getConfigList(params, success, failure) {
  return {
    types: types.GETCONFIGLIST,
    callAPI: () => fetchX.get('/atfcapi/commonConfig/queryProjectConfigure', params),
    success,
    failure,
  };
}

export function updateConfig(type, url, params, success, failure) {
  return {
    types: types.UPDATECONFIG,
    callAPI: () => fetchX[type.toLowerCase()](url, params),
    success,
    failure,
  };
}
// projectId & ProjectName
export function getProjectEntries(success, failure) {
  return {
    types: types.GETPROJECTENTRIES,
    callAPI: () => fetchX.get('/atfcapi/uploadFile/queryProject'),
    success,
    failure,
  };
}

export function getAppIds(params, success, failure) {
  return {
    types: types.GETAPPIDS,
    callAPI: () => fetchX.get('/atfcapi/uploadFile/queryAppId', params),
    success,
    failure,
  };
}

export function getServices(params, success, failure) {
  return {
    types: types.GETSERVICES,
    callAPI: () => fetchX.get('/atfcapi/uploadFile/queryServiceName', params),
    success,
    failure,
  };
}

export function getIfaces(params, success, failure) {
  return {
    types: types.GETIFACES,
    callAPI: () => fetchX.post('/atfcapi/unitTest/ifaceList', params),
    success,
    failure,
  };
}

export function getMethodList(params, success, failure) {
  return {
    types: types.GETMETHODLIST,
    callAPI: () => fetchX.post('/atfcapi/unitTest/methodList', params),
    success,
    failure,
  };
}

export function setMethodList(methodList) {
  return {
    type: types.SETMETHODLIST,
    payload: { methodList },
  };
}

export function getLogList(params, success, failure) {
  return {
    types: types.GETLOGLIST,
    callAPI: () => fetchX.fetch('/atfcapi/unitTest/searchLog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }),
    success,
    failure,
  };
}

export function setLogList(logList) {
  return {
    type: types.SETLOGLIST,
    payload: { logList },
  };
}

export function getLogItemDetail(params, success, failure) {
  return {
    types: types.GETLOGITEMDETAIL,
    callAPI: () => fetchX.post('/atfcapi/unitTest/detail', params),
    success,
    failure,
  };
}

export function deleteMethodItem(pathId) {
  return {
    type: types.DELETEMETHODITEM,
    payload: { pathId },
  };
}

export function uploadMock(formData, success, failure) {
  return {
    types: types.UPLOADMOCK,
    callAPI: () => fetchX.fetch('/atfcapi/uploadFile/mock', {
      method: 'POST',
      body: formData,
    }),
    success,
    failure,
  };
}

export function resetAppIds() {
  return {
    type: types.RESETAPPIDS,
  };
}

export function resetIfaces() {
  return {
    type: types.RESETIFACES,
  };
}

export function resetServices() {
  return {
    type: types.RESETSERVICES,
  };
}

export function setApp(id, name) {
  return {
    type: types.SETAPP,
    payload: { id, name },
  };
}

export function setIface(iface) {
  return {
    type: types.SETIFACE,
    payload: { iface },
  };
}

export function setTimeQuantum(startDate, endDate) {
  return {
    type: types.SETTIMEQUANTUM,
    payload: { startDate, endDate },
  };
}

export function setPathIds(pathIds) {
  return {
    type: types.SETPATHIDS,
    payload: { pathIds },
  };
}

export function setProject(id, name) {
  return {
    type: types.SETPROJECT,
    payload: { id, name },
  };
}

export function uploadHar(formData, success, failure) {
  return {
    types: types.UPLOADHAR,
    callAPI: () => fetchX.fetch('/atfcapi/har/upload', {
      method: 'POST',
      body: formData,
    }),
    success,
    failure,
  };
}

export function saveHar(params, success, failure) {
  return {
    types: types.SAVEHAR,
    callAPI: () => fetchX.fetch('/atfcapi/har/saveAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }),
    success,
    failure,
  };
}

export function getProjectCoverage(params, success, failure) {
  return {
    types: types.GET_PROJECT_COVERAGE,
    callAPI: () => fetchX.post('/atfcapi/project/coverage', params),
    success,
    failure,
  };
}

export function uploadHarToJmx(formData, success, failure) {
  return {
    types: types.UPLOADHARTOJMX,
    callAPI: () => fetchX.fetch('/atfcapi/toJmx/upload', {
      method: 'POST',
      body: formData,
    }),
    success,
    failure,
  }
}

export function saveUnitCase(params, success, failure) {
  return {
    types: types.SAVEUNITCASE,
    callAPI: () => fetchX.fetch('/atfcapi/unitTest/saveCase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }),
    success,
    failure,
  };
}
