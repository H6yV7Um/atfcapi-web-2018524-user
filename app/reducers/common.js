import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  envList: [],
  appIds: [],
  ifaceList: [],
  methodList: [],
  logList: [],
  logDetailList: [],
  pathIds: [],
  projectList: [],
  services: [],
};

const common = createReducer(initialState, {
  [types.GETALLEVN[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETALLEVN[1]](state, action) {
    const envList = action.response.data;
    return { ...state, isFetching: false, envList };
  },
  [types.GETALLEVN[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETCONFIGLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETCONFIGLIST[1]](state, action) {
    const configInfo = action.response.data;
    return { ...state, isFetching: false, configInfo };
  },
  [types.GETCONFIGLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETPROJECTENTRIES[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETPROJECTENTRIES[1]](state, action) {
    const { list:projectList } = action.response.data;
    return { ...state, isFetching: false, projectList };
  },
  [types.GETPROJECTENTRIES[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETAPPIDS[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETAPPIDS[1]](state, action) {
    const { list:appIds } = action.response.data;
    return { ...state, isFetching: false, appIds };
  },
  [types.GETAPPIDS[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETIFACES[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETIFACES[1]](state, action) {
    const ifaceList = action.response.data;
    return { ...state, isFetching: false, ifaceList };
  },
  [types.GETIFACES[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETMETHODLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETMETHODLIST[1]](state, action) {
    const methodList = action.response.data;
    return { ...state, isFetching: false, methodList };
  },
  [types.GETMETHODLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETLOGLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETLOGLIST[1]](state, action) {
    const logList = action.response.data;
    return { ...state, isFetching: false, logList };
  },
  [types.GETLOGLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETLOGITEMDETAIL[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETLOGITEMDETAIL[1]](state, action) {
    const logDetailList = action.response.data;
    return { ...state, isFetching: false, logDetailList };
  },
  [types.GETLOGITEMDETAIL[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.RESETAPPIDS](state) {
    const appIds = [];
    return { ...state, isFetching: false, appIds };
  },
  [types.RESETIFACES](state) {
    const ifaceList = [];
    return { ...state, isFetching: false, ifaceList };
  },
  [types.SETAPP](state, action) {
    const { id, name } = action.payload;
    return { ...state, isFetching: false, appId: id, appIdName: name };
  },
  [types.SETIFACE](state, action) {
    const { iface } = action.payload;
    return { ...state, isFetching: false, iface };
  },
  [types.SETMETHODLIST](state, action) {
    const { methodList } = action.payload;
    return { ...state, isFetching: false, methodList };
  },
  [types.SETLOGLIST](state, action) {
    const { logList } = action.payload;
    return { ...state, isFetching: false, logList };
  },
  [types.SETTIMEQUANTUM](state, action) {
    const { startDate, endDate } = action.payload;
    return { ...state, isFetching: false, startDate, endDate };
  },
  [types.SETPATHIDS](state, action) {
    const { pathIds } = action.payload;
    return { ...state, isFetching: false, pathIds };
  },
  [types.SETPROJECT](state, action) {
    const { id, name } = action.payload;
    return { ...state, isFetching: false, projectId: id, projectName: name };
  },
  [types.UPLOADHAR[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.UPLOADHAR[1]](state, action) {
    const { appId, projectId } = action.response.data;
    return { ...state, isFetching: false, appId, projectId };
  },
  [types.UPLOADHAR[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.SAVEHAR[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.SAVEHAR[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.SAVEHAR[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.SAVEUNITCASE[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.SAVEUNITCASE[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.SAVEUNITCASE[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETSERVICES[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETSERVICES[1]](state, action) {
    const { list:services } = action.response.data;
    return { ...state, isFetching: false, services };
  },
  [types.GETSERVICES[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.RESETSERVICES](state) {
    const services = [];
    return { ...state, isFetching: false, services };
  },
  [types.DELETEMETHODITEM](state, action) {
    const { pathId } = action;
    const { methodList } = state;
    return { ...state, isFetching: false, methodList: methodList.filter(item => item.pathId !== pathId) };
  },
  [types.UPLOADMOCK[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.UPLOADMOCK[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.UPLOADMOCK[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GET_PROJECT_COVERAGE[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_PROJECT_COVERAGE[1]](state, action) {
    const coverageList = action.response.data;
    return { ...state, isFetching: false, coverageList }
  },
  [types.GET_PROJECT_COVERAGE[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.UPLOADHARTOJMX[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.UPLOADHARTOJMX[1]](state, action) {
    return { ...state, isFetching: false, jmxData: action.response.data };
  },
  [types.UPLOADHARTOJMX[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
});

export default common;
