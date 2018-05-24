import createReducer from './createReducer';
import * as types from '../constants/ActionTypes';

const initialState = {
  folderData: {}
};

const folder = createReducer(initialState, {
  [types.GET_FOLDERLIST[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_FOLDERLIST[1]](state, action) {
    const folderData = action.response.data;
    return { ...state, isFetching: false, folderData };
  },
  [types.GET_FOLDERLIST[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.ADD_FOLDER[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.ADD_FOLDER[1]](state) {
    return { ...state, isFetching: false, add: false };
  },
  [types.ADD_FOLDER[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, add: false, error };
  },
  [types.ADD_FOLDER_VIRTUAL](state, action) {
    const { allFolders } = state;
    allFolders.push(action.newFolder);
    return {...state, allFolders: allFolders };
  },
  [types.SHOW_NEWFOLDER](state, action) {
    return { ...state, add: action.payload };
  },
  [types.COPY_FOLDER[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.COPY_FOLDER[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.COPY_FOLDER[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.DELETE_FOLDER[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.DELETE_FOLDER[1]](state) {
    return { ...state, isFetching: false };
  },
  [types.DELETE_FOLDER[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
  [types.GET_ALLFOLDERS[0]](state) {
    return { ...state, isFetching: true };
  },
  [types.GET_ALLFOLDERS[1]](state, action) {
    const allFolders = action.response.data;
    return { ...state, isFetching: false, allFolders };
  },
  [types.GET_ALLFOLDERS[2]](state, action) {
    const error = action.error;
    return { ...state, isFetching: false, error };
  },
});

export default folder;
