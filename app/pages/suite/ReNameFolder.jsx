import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';
import fetchX from '../../vendor/Fetch';
import { validator } from '../../vendor/util';

const propTypes = {
  name: React.PropTypes.string,
  id: React.PropTypes.number,
  projectId: React.PropTypes.number,
  reload: React.PropTypes.func,
};

const defaultProps = {
  name: '', // 文件夹名称
  id: 0, // 文件夹id
  projectId: 0, // 项目id
  reload() {},
};

class ReNameFolder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      errMsg: '',
      show: false,
      loading: false,
    };
  }

  handleChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  async handleReName() {
    const { id, projectId } = this.props;
    const { name } = this.state;
    if (name.trim() === '') {
      this.error('Folder name cannot be empty');
      return;
    }
    if (!validator.maxLength(name, 30)) {
      this.error('Folder name is too long');
      return;
    }
    if (!validator.folderName(name)) {
      this.error('Please enter the correct folder name should contain only letters, numbers, underscores');
      return;
    }
    const condi = {
      name,
      id,
      projectId,
    };
    this.setState({
      loading: true,
    });
    const { code, msg } = await fetchX.put('/atfcapi/folder/reName', condi);
    if (code === '200') {
      this.reset(this.props.reload);
    } else {
      this.error(msg);
    }
  }

  reset(cb) {
    this.setState({
      loading: false,
      show: false,
      errMsg: '',
    }, () => {
      if (cb) cb();
    });
  }

  show(name) {
    this.setState({
      show: true,
      name,
    });
  }

  error(msg = '') {
    this.setState({
      loading: false,
      errMsg: msg,
    });
  }

  render() {
    const { name, errMsg, show, loading } = this.state;
    const notice = errMsg ? (
      <p className="error">{errMsg}</p>
    ) : '';
    return (
      <Modal dialogClassName="new-project" backdrop="static" show={show}>
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">Rename folders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            <Input
              type="text"
              name="folderName"
              label="Folder Name"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
              maxLength={30}
              value={name}
              placeholder="only letters, numbers, underscores"
              onChange={e => this.handleChange(e)}
            />
            {notice}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.reset()} disabled={loading}>Cancel</Button>
          <Button
            bsStyle="primary"
            disabled={loading}
            onClick={() => this.handleReName()}
          >
            {loading ? `Submit...` : `Submit`}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ReNameFolder.propTypes = propTypes;

ReNameFolder.defaultProps = defaultProps;

export default ReNameFolder;
