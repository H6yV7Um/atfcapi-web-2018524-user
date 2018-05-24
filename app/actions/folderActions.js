import * as types from '../constants/ActionTypes';
import fetchX from '../vendor/Fetch';

export function showNewFolder(isshow = true) {
  return {
    type: types.SHOW_NEWFOLDER,
    payload: isshow,
  };
}

export function getFolderList(params, success, failure) {
  return {
    types: types.GET_FOLDERLIST,
    callAPI: () => fetchX.post('/atfcapi/folder/list', params),
    success,
    failure,
  };
}

export function getAllFolders(projectId, success, failure) {
  return {
    types: types.GET_ALLFOLDERS,
    callAPI: () => fetchX.post('/atfcapi/folder/getAll', { projectId }),
    success,
    failure,
  };
}

export function addFolder(params, success, failure) {
  return {
    types: types.ADD_FOLDER,
    callAPI: () => fetchX.post('/atfcapi/folder', params),
    success,
    failure,
  };
}

export function addFolderVirtual(newFolder) {
  return {
    type: types.ADD_FOLDER_VIRTUAL,
    newFolder,
  };
}

export function copyFolder(id, success, failure) {
  return {
    types: types.COPY_FOLDER,
    callAPI: () => fetchX.post('/atfcapi/folder/copy', { id }),
    success,
    failure,
  };
}

export function delFolder(id, success, failure) {
  return {
    types: types.DELETE_FOLDER,
    callAPI: () => fetchX.delete(`/atfcapi/folder/${id}`),
    success,
    failure,
  };
}

export function updateFolder(params, success, failure) {
  return {
    types: types.UPDATE_FOLDER,
    callAPI: () => fetchX.put('/atfcapi/folder/reName'),
    success,
    failure,
  };
}
