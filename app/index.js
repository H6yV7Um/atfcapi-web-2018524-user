import React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';
import 'babel-polyfill';
import './style/main.scss';
import Root from './pages';
import configureStore from './store';


const store = configureStore();

const history = syncHistoryWithStore(hashHistory, store);

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>, document.getElementById('content')
);

if (module.hot) {
  module.hot.accept('./pages', () => {
    const NewRoot = require('./pages').default;
    render(
      <AppContainer>
        <NewRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('content')
    );
  });
}
