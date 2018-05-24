import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';
import fetchX from '../../vendor/Fetch';
import { validator } from '../../vendor/util';

class NewProject extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: false,
      loading: false,
      errMsg: '',
      name: '',
      id: 0,
    };
    this.show = (name, id) => this.setState({
      show: true,
      name: name || '',
      id: id || 0,
    });
    this.close = () => this.setState({
      show: false,
      loading: false,
      errMsg: '',
    });
  }

  handleChange(event) {
    this.setState({
      name: event.target.value,
      errMsg: '',
    });
  }

  async handleSubmit() {
    let url;
    const { name, id } = this.state;
    if (name === '') {
      this.setState({
        errMsg: "What's your project name?",
      });
      return;
    }
    if (!validator.maxLength(name, 30)) {
      this.setState({
        errMsg: 'Project name is too long',
      });
      return;
    }
    if (!validator.projectName(name)) {
      this.setState({
        errMsg: 'Project name should only contain letters, numbers and underscores',
      });
      return;
    }
    const condi = {
      projectName: name,
    };
    if (!id) {
      url = '/atfcapi/project/createProject';
    } else {
      url = '/atfcapi/project/updateProject';
      condi.projectId = id;
    }
    this.setState({
      loading: true,
    });
    try {
      const { code, msg } = await fetchX.get(url, condi);
      if (code === '200') {
        window.location.reload();
      } else {
        this.setState({
          errMsg: msg,
        });
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, errMsg, name, show } = this.state;
    return (
      <Modal dialogClassName="new-project" backdrop="static" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            <Input
              type="text"
              name="projectName"
              label="Project Name"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
              maxLength={30}
              value={name}
              placeholder="only letters, numbers and underscores"
              onChange={e => this.handleChange(e)}
            />
            <span className="left-word">{ name.length <= 30 ? 30 - name.length : 0}/30</span>
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

NewProject.contextTypes = {
  router: React.PropTypes.object,
};

export default NewProject;
