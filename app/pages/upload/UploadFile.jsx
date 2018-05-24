import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ServiceFilter, Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class UploadFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      appId: 0,
      serviceId: 0,
      filePath: null,
      show: false,
      error: false,
      isThrift: false,
    };

    this.show = () => this.setState({show: true});
    this.close = () => this.setState({show: false});
  }

  handleSelect(a, b, c) {
    this.setState({
      appId: b,
      serviceId: c,
    });
  }

  hanldeChange(event) {
    const filePath = event.target.value;
    const test = filePath.indexOf('.md') !== -1
      || filePath.indexOf('.yaml') !== -1
      || filePath.indexOf('.yml') !== -1
      || filePath.indexOf('.thrift') !== -1;
    if (test) {
      this.setState({
        filePath: filePath,
        error: false,
        isThrift: filePath.indexOf('.thrift') !== -1,
      });
    } else {
      this.setState({
        error: true,
        filePath: null,
      });
    }
  }

  handleSubmit() {
    const { appId, serviceId, filePath, isThrift } = this.state;
    if (!filePath) {
      Notification.info(`Please see the file in the correct format!`);
      return false;
    } else if (!appId) {
      Notification.info(`Please select AppId!`);
      return false;
    } else if (!serviceId) {
      Notification.info(`Please select Service Name!`);
      return false;
    }

    let url;
    const formData = new FormData();
    formData.append('file', this.refs.file.files[0]);
    formData.append('serviceId', serviceId );
    if (isThrift) {
      formData.append('appId', appId );
      url = '/atfcapi/uploadFile/uploadThriftFile';
    } else {
      url = '/atfcapi/uploadFile/upload';
    }
    fetchX.fetch(url, {
      method: 'POST',
      body: formData,
    }).then(json => {
      if (json.code === '200') {
        Notification.success(json.msg);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  render() {
    const { loading, filePath, show, error } = this.state;
    const tip = error ?
      <span className="tip error">The file you uploaded the wrong type!</span>
      :
      <span className="tip">{filePath}</span>;

    return (
      <Modal backdrop="static" dialogClassName="upload-form" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="upload-wrap">
            <span className="tit">Upload file</span>
            <a href="javascript:;" className="file">
              Click Choose File
              <input type="file" ref="file" onChange={e => this.hanldeChange(e)} />
            </a>
            {tip}
            <p>Only supports uploading <code>.md</code>、<code>.yml</code>、<code>.yaml</code>、<code>.thrift</code>types of files</p>
          </div>
          <ServiceFilter callback={(a, b, c) => this.handleSelect(a, b, c)} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            bsStyle="primary"
            onClick={() => this.handleSubmit()}
          >
            { loading ? `Submit...` : `Submit` }
          </Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UploadFile;
