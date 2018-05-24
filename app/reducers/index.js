import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import project from './project';
import folder from './folder';
import suitecase from './suitecase';
import database from './database';
import common from './common';
import api from './api';

const rootReducer = combineReducers({
  project,
  folder,
  suitecase,
  database,
  common,
  api,
  routing,
});

export default rootReducer;
