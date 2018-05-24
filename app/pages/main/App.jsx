import React from 'react';
import Header from './Header';
import NewProject from '../project/NewProject';
import UploadFile from '../upload/UploadFile';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Header
          showUpload={() => this.refs.upload.show()}
          showCreate={() => this.refs.createProject.show()}
        />
        <div className="content-wrap">
          {this.props.children}
        </div>
        <NewProject ref="createProject" />
        <UploadFile ref="upload" />
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.node,
};

export default App;
