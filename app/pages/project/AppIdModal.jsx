import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';

class AppIdModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      name: '',
      id: 0,
      err: '',
      loading: false,
      data: [],
      descrip: '',
      appId: 0, // new service
      serviceId: 0, // update service
    };

    this.show = ({name, id, data, appId, descrip, serviceId}) => this.setState({
      show: true,
      name: name || '',
      id: id || 0,
      data: data || [],
      descrip: descrip || '',
      appId: appId || ( data && data.length ? data[0].appId : 0 ),
      serviceId: serviceId || 0,
      namedisable: name ? true : false,
    });
    this.close = () => this.setState({
      show: false,
      loading: false,
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
    const state = this.state;
    state[event.target.name] = event.target.value;
    state.err = '';
    this.setState(this.state);
  }

  buildAppId(arr) {
    return arr.map( item =>
      <option key={item.appId} value={item.appId}>{item.appIdName}</option>
    );
  }

  handleSubmit() {
    const {id, name, appId, descrip, serviceId} = this.state;
    this.setState({
      loading: true,
    }, () => this.props.save({
      index: id,
      name: name,
      appId: appId,
      descrip: descrip,
      serviceId: serviceId,
    }));
  }

  render() {
    const { name, show, loading, err, data, appId, descrip, namedisable } = this.state;

    return (
      <Modal dialogClassName="new-project" bsSize="lg" backdrop="static" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Project Config</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            { data.length > 0 ?
              <div>
                <Input
                  type="select"
                  name="appId"
                  label="AppId Name"
                  labelClassName="col-xs-3"
                  wrapperClassName="col-xs-8"
                  value={appId}
                  onChange={e => this.handleChange(e)}
                >
                  { this.buildAppId(data) }
                </Input>
                <Input
                  type="text"
                  name="name"
                  label="Service Name"
                  labelClassName="col-xs-3"
                  wrapperClassName="col-xs-8"
                  value={name}
                  disabled={namedisable}
                  onChange={e => this.handleChange(e)}
                />
                <Input
                  type="text"
                  name="descrip"
                  label="Service Description"
                  labelClassName="col-xs-3"
                  wrapperClassName="col-xs-8"
                  value={descrip}
                  onChange={e => this.handleChange(e)}
                />
              </div>
              :
              <Input
                type="text"
                name="name"
                label="AppId Name"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-8"
                value={name}
                onChange={e => this.handleChange(e)}
              />
            }

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

AppIdModal.propTypes = {
  save: React.PropTypes.func,
};

export default AppIdModal;
