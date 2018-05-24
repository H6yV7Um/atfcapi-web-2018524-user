import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './pages/main/App';
import ProjectList from './pages/project/ProjectList';

const errorLoading = err => {
  throw Error(err)
};

const loadRoute = cb => {
  return module => cb(null, module.default);
};

export default (
  <Route path="/" component={App}>
    <IndexRoute component={ProjectList} />
    <Route path="project" component={ProjectList} />
    <Route
      path="project/:projectId/config"
      getComponent={(location, cb) => {
        System.import('./pages/project/ProjectConfig')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/config/env"
      getComponent={(location, cb) => {
        System.import('./pages/project/EnvConfig')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/folder/:folderId/case/:caseId"
      getComponent={(location, cb) => {
        System.import('./pages/testCase/Case')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/folder"
      getComponent={(location, cb) => {
        System.import('./pages/suite/FolderList')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/folder/:folderId"
      getComponent={(location, cb) => {
        System.import('./pages/testCase/Case')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/folder/:folderId/copy"
      getComponent={(location, cb) => {
        System.import('./pages/suite/CopyCase')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="project/:projectId/coverage"
      getComponent={(location, cb) => {
        System.import('./pages/project/Coverage')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/select"
      getComponent={(location, cb) => {
        System.import('./pages/selectApi/SelectApi')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/new"
      getComponent={(location, cb) => {
        System.import('./pages/api/NewApi')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/list"
      getComponent={(location, cb) => {
        System.import('./pages/api/ApiList')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/assert"
      getComponent={(location, cb) => {
        System.import('./pages/selectApi/ApiAssertation')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/request"
      getComponent={(location, cb) => {
        System.import('./pages/selectApi/ApiRequest')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="api/:pathId"
      getComponent={(location, cb) => {
        System.import('./pages/api/EditApi')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="header/new"
      getComponent={(location, cb) => {
        System.import('./pages/header/NewHeader')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="header/list"
      getComponent={(location, cb) => {
        System.import('./pages/header/HeaderList')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="copyCase/CopyCaseList/:type"
      getComponent={(location, cb) => {
        System.import('./pages/copyCase/CopyCaseList')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="/protocolTemplate/protocolTemplate/:type"
      getComponent={(location, cb) => {
        System.import('./pages/protocolTemplate/protocolTemplate')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="upload/ImportSoa"
      getComponent={(location, cb) => {
        System.import('./pages/upload/ImportSoa')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="stress/StressSetting"
      getComponent={(location, cb) => {
        System.import('./pages/stress/StressSetting')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="dbConfig/config/:dbCfgId"
      getComponent={(location, cb) => {
        System.import('./pages/dbConfig/DbConfig')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="dbConfig/DbConfigList"
      getComponent={(location, cb) => {
        System.import('./pages/dbConfig/DbConfigList')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="demo"
      getComponent={(location, cb) => {
        System.import('./pages/example/demo')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="batch/ImportCase"
      getComponent={(location, cb) => {
        System.import('./pages/batch/UploadHAR')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="batch/ImportUnitCase"
      getComponent={(location, cb) => {
        System.import('./pages/batch/ImportUnitCases')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="batch/LogReplay"
      getComponent={(location, cb) => {
        System.import('./pages/batch/LogReplay')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="batch/LogReplay/:id"
      getComponent={(location, cb) => {
        System.import('./pages/batch/LogReplay/Logs')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="stress/HarToJmx"
      getComponent={(location, cb) => {
        System.import('./pages/stress/HarToJmx')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="case/failures"
      getComponent={(location, cb) => {
        System.import('./pages/caseSummary/Failures')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="regist/appidRegist"
      getComponent={(location, cb) => {
        System.import('./pages/registCenter/appidRegist')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="regist/ipRegist"
      getComponent={(location, cb) => {
        System.import('./pages/registCenter/ipRegist')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="regist/ipRegister"
      getComponent={(location, cb) => {
        System.import('./pages/registCenter/ipRegister')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="regist/ipRegister/history/:newkey"
      getComponent={(location, cb) => {
        System.import('./pages/registCenter/history')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="regist/ipRegister/report"
      getComponent={(location, cb) => {
        System.import('./pages/registCenter/report')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="pict/testCaseShow"
      getComponent={(location, cb) => {
        System.import('./pages/pict/testCaseShow')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
    <Route
      path="pict/testCaseSelect"
      getComponent={(location, cb) => {
        System.import('./pages/pict/testCaseSelect')
        .then(loadRoute(cb))
        .catch(errorLoading);
      }}
    />
  </Route>
);
