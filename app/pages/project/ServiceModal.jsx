import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';

class ServiceModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      name: '',
      id: 0,
      err: '',
      loading: false,
    };

    this.show = (name, id) => this.setState({
      show: true,
      name: name || '',
      id: id || 0,
    });
    this.close = () => this.setState({
      show: false,
      err: '',
    });
  }

  handleFail(err) {
    this.setState({
      loading: false,
      err: err,
    });
  }

  handleChange(event) {
    this.setState({
      name: event.target.value,
      err: '',
    });
  }

  handleSubmit() {
    const {id, name} = this.state;
    this.setState({
      loading: true,
    }, () => this.props.save({
      id: id,
      name: name,
    }));
  }

  render() {
    const { name, show, loading, err } = this.state;
    return (
      <Modal dialogClassName="new-project" backdrop="static" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">AppId</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            <Input
              type="text"
              name="name"
              label="AppId Name"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
              value={name}
              onChange={e => this.handleChange(e)}
            />
            <p className="error">{err}</p>
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

ServiceModal.propTypes = {
  save: React.PropTypes.func,
};

export default ServiceModal;
