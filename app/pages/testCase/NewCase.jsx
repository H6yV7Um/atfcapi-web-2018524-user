import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';
import fetchX from '../../vendor/Fetch';

class NewCase extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: false,
      loading: false,
      errMsg: '',
      folderId: 0,
      suiteId: 0, // V1.4版本开始，suiteId表示父组件传来的caseId
      name: '',
      descrip: '',
    };

    this.show = (folderId, suiteId, name, descrip )=> this.setState({
      show: true,
      folderId: folderId || 0,
      suiteId: suiteId || 0,
      name: name || '',
      descrip: descrip || '',
    });
    this.close = () => this.setState({
      show: false,
      errMsg: '',
    });
  }

  handleChange(event) {
    const target = event.target;
    const state = this.state;
    state[target.name] = target.value;
    state.errMsg = '';
    this.setState(state);
  }

  handleSubmit() {
    let url;
    const { folderId, suiteId, name, descrip } = this.state;
    const reg = /\s/g;
    if (!name) {
      this.setState({
        errMsg: 'Please complete the case name!',
      });
      return false;
    }
    if (!descrip) {
      this.setState({
        errMsg: 'Please complete case description!',
      });
      return false;
    }
    if (reg.test(name)) {
      this.setState({
        errMsg: 'case name can not be blank spaces!',
      });
      return false;
    }

    const condi = {};

    if (!suiteId) {// new case
      url = '/atfcapi/suiteCase/addSuite';
      condi.folderId = folderId;
      condi.testCaseFileName = name;
      condi.testCaseFileDescription = descrip;
    } else { // edit case
      url = '/atfcapi/suiteCase/updateSuite';
      condi.suiteId = suiteId;
      condi.suiteName = name;
      condi.description = descrip;
    }
    this.setState({
      loading: true,
    });
    fetchX.post(url, condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({ show: false});
        window.location.reload();
      } else {
        this.setState({
          loading: false,
          errMsg: json.msg,
        });
      }
    });
    this.setState({
      loading: false,
    });
  }

  render() {
    const {loading, errMsg, show, name, descrip, suiteId} = this.state;
    const title = !suiteId ? 'New Case' : 'Edit Case';
    return (
      <Modal backdrop="static" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            <Input
              type="text"
              label="Case name"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-7"
              name="name"
              placeholder="Enter Case name can not be blank spaces"
              value={name}
              onChange={e => this.handleChange(e)}
            />
            <Input
              type="text"
              label="Case description"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-7"
              name="descrip"
              value={descrip}
              onChange={e => this.handleChange(e)}
            />
            <p className="error">{errMsg}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>Cancel</Button>
          <Button
            bsStyle="primary"
            disabled={loading}
            onClick={() => this.handleSubmit()}
          >
            {loading ? `Submit...` : `Submit`}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

NewCase.contextTypes = {
  router: React.PropTypes.object,
};

export default NewCase;
