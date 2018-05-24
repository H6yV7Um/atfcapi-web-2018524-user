import React from 'react';
import { Modal, Button } from 'react-bootstrap';

class DeleteDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      index: null,
      data: {},
      text: '',
      loading: false,
      errMsg: '',
      serviceId: 0,
    };

    this.show = ({index, text, data, serviceId}) => this.setState({
      show: true,
      loading: false,
      index: index || null,
      data: data,
      text: text,
      serviceId: serviceId || 0,
    });
    this.close = () => this.setState({
      loading: false,
      show: false,
      errMsg: '',
    });
    this.handleFail = msg => this.setState({
      loading: false,
      errMsg: msg,
    });
  }

  handleClick() {
    const {index, data, serviceId} = this.state;
    this.setState({
      loading: true,
    });
    this.props.delete({
      index: index,
      data: data,
      serviceId: serviceId,
    });
  }

  render() {
    const { show, text, loading, errMsg } = this.state;
    return (
      <Modal bsSize="sm" show={show} onHide={this.close} dialogClassName="dialog-modal">
        <Modal.Header closeButton>
          <Modal.Title>{`delete${this.props.title || ''}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete<code>{text}</code>？
          <br />
          It will not be recoverable after deletion！
        </Modal.Body>
        <Modal.Footer>
          <span className="error">{errMsg}</span>
          <Button
            onClick={this.close}
          >
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            disabled={loading}
            onClick={() => this.handleClick()}
          >
            {loading ? `Confirm...` : `Confirm`}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

DeleteDialog.propTypes = {
  delete: React.PropTypes.func,
  title: React.PropTypes.string,
};

export default DeleteDialog;
