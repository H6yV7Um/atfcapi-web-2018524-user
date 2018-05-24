import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  aliasList: [],
};

const database = createReducer(initialState, {
  [types.TESTCONNECTION[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.TESTCONNECTION[1]](state) {
    return { ...state, isFetching: false, isTestSuc: true };
  },
  [types.TESTCONNECTION[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.TESTSUCCESS](state, action) {
    return { ...state, isFetching: false, isTestSuc: action.payload };
  },
  [types.GETCONFIGDATA[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETCONFIGDATA[1]](state, action) {
    const configData = action.response.data;
    return { ...state, isFetching: false, configData };
  },
  [types.GETCONFIGDATA[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETALLALIAS[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETALLALIAS[1]](state, action) {
    const aliasList = action.response.data;
    return { ...state, isFetching: false, aliasList };
  },
  [types.GETALLALIAS[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETDBLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETDBLIST[1]](state, action) {
    const dbInfo = action.response.data;
    return { ...state, isFetching: false, dbInfo };
  },
  [types.GETDBLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
});

export default database;
