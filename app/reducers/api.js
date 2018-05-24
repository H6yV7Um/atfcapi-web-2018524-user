import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  apiList: []
};

const project = createReducer(initialState, {
  [types.GET_APILIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_APILIST[1]](state, action) {
    const apiList = action.response.data;
    return { ...state, isFetching: false, apiList };
  },
  [types.GET_APILIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
});

export default project;
