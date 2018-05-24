import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  searchOptions: []
};

const project = createReducer(initialState, {
  [types.GET_PROJECTS[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_PROJECTS[1]](state, action) {
    const searchOptions = action.response.data;
    return { ...state, isFetching: false, searchOptions };
  },
  [types.GET_PROJECTS[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GET_PROJECTLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_PROJECTLIST[1]](state, action) {
    const { projectInfoDto: list, totalCount } = action.response.data;
    return { ...state, isFetching: false, list, totalCount };
  },
  [types.GET_PROJECTLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.LASTPROEJCT](state, action) {
    const lastProjectName = action.payload;
    return { ...state, isFetching: false, lastProjectName };
  },
});

export default project;
