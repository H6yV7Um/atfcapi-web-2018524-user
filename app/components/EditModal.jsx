import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { CodeMirror} from '../components';

class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      data: null,
      index: null,
      type: 0,
      loading: false,
      errMsg: '',
    };

    this.show = (data, type, index) => this.setState({
      show: true,
      data: this.formatStr(data),
      type: type || 0, // 0: Context, 1: Global, 2: DBUnit
      index: index,
    });
    this.close = () => this.setState({show: false, errMsg: ''});
    this.handleFail = msg => this.setState({
      loading: false,
      errMsg: msg,
    });
  }

  handleChange(value) {
    this.setState({
      data: value,
      errMsg: '',
    });
  }

  formatStr(str) {
    if (str) {
      const result = JSON.stringify(str, null, 2);
        // .replace(/\\"/g, '"')
        // .replace(/\"{/g, '{')
        // .replace(/\}\"/g, '}')
        // .replace(/\"\[/g, '[')
        // .replace(/\]\"/g, ']');
      return result;
    }
  }

  save() {
    const {type, index, data} = this.state;
    try {
      JSON.parse(data);
      if (typeof(JSON.parse(data)) === 'number' || typeof(JSON.parse(data)) === 'string') throw 'not json';
    } catch (err) {
      this.handleFail('JSON format validation error: ' + err);
      return;
    }
    this.setState({
      loading: true,
    });
    this.props.save({
      value: data,
      type: type,
      index: index,
    });
  }

  render() {
    const textArr = ['Context', 'Global', 'DB Init'];
    const { show, data, type, loading, errMsg } = this.state;
    const title = textArr[type];
    return (
      <Modal backdrop="static" bsSize="lg" show={show} onHide={() => this.close()}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CodeMirror
            ref="editInfo"
            className="api-editor"
            height="500px"
            value={data}
            onChange={e => this.handleChange(e)}
          />
        </Modal.Body>
        <Modal.Footer>
          <span className="error">{errMsg}</span>
          <Button onClick={() => this.close()}>
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            disabled={loading}
            onClick={() => this.save()}
          >
            {loading ? `Saving...` : `Save`}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  save: React.PropTypes.func,
};

export default EditModal;
