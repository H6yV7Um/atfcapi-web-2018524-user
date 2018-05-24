import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  caseList: [],
  failedList: [],
  failedCategory: [],
};

const suitecase = createReducer(initialState, {
  [types.GET_ALLCASES[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_ALLCASES[1]](state, action) {
    const allCases = action.response.data;
    return { ...state, isFetching: false, allCases };
  },
  [types.GET_ALLCASES[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GET_CASELIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_CASELIST[1]](state, action) {
    const caseList = action.response.data;
    return { ...state, isFetching: false, caseList };
  },
  [types.GET_CASELIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.ADD_CASE[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.ADD_CASE[1]](state, action) {
    const newCase = action.response.data;
    return { ...state, isFetching: false, newCase };
  },
  [types.ADD_CASE[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.COPY_CASEINFO[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.COPY_CASEINFO[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.COPY_CASEINFO[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.RUNCASE[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.RUNCASE[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.RUNCASE[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETFAILEDCATEGORY[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETFAILEDCATEGORY[1]](state, action) {
    const failedCategory = action.response.data;
    return { ...state, failedCategory, isFetching: false };
  },
  [types.GETFAILEDCATEGORY[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GETFAILEDLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GETFAILEDLIST[1]](state, action) {
    const { list: failedList , count: totalCount } = action.response.data;
    return { ...state, failedList, totalCount, isFetching: false };
  },
  [types.GETFAILEDLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  }
});

export default suitecase;
