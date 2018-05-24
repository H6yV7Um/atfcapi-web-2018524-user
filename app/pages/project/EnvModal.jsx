import React from 'react';
import { Modal, Button, Input } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import { getEnvId } from '../../vendor/util';
import fetchX from '../../vendor/Fetch';

class EnvModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      loading: false,
      data: {scheme: '0', port: 80},
      env: [],
      envId: 0,
      err: '',
      serviceId: 0,
    };

    this.show = (data, serviceId) => this.setState({
      show: true,
      data: data || {scheme: '0', port: 80},
      serviceId: serviceId,
    });
    this.close = () => this.setState({
      show: false,
      err: '',
    });
  }

  componentDidMount() {
    this.getEnvList();
  }

  getEnvList() {
    fetchX.get('/atfcapi/commonConfig/getAllEvn')
    .then(res => {
      if (res.code === '200') {
        const envId = getEnvId(res.data);
        this.setState({
          env: res.data,
          envId,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  handleChange(event) {
    const state = this.state;
    let value = event.target.value;
    if (event.target.name === 'port') value = value.replace(/\D+/g, '');
    if (event.target.name === 'envId') {
      state.envId = value;
    } else {
      state.data[event.target.name] = value;
    }
    if (event.target.name === 'scheme') {
      state.data.port = value === '0' ? 80 : 443;
    }
    state.err = '';
    this.setState(state);
  }

  buildEnvList(data) {
    return data.map( item =>
      <option key={item.envId} value={item.envId}>{item.envName}</option>
    );
  }


  async handleSubmit() {
    let url;
    const { data, serviceId, envId } = this.state;
    const condi = {
      host: data.host,
      port: data.port,
      scheme: data.scheme,
    };
    if (!condi.host) {
      Notification.info('Please enter a host');
      return;
    } else if (!condi.port) {
      condi.port = -1;
    }
    if (!data.hostportId) {
      url = '/atfcapi/commonConfig/insertProjectConfigureDetail';
      condi.serviceId = serviceId;
      condi.envId = envId;
    } else {
      url = '/atfcapi/commonConfig/updateProjectConfigureDetail';
      condi.hostportId = data.hostportId;
    }
    this.setState({
      loading: true,
    });
    const { code, msg } = await fetchX.post(url, condi);
    if (code === '200') {
      Notification.success(msg);
    } else {
      Notification.error(msg);
    }
    this.setState({
      loading: false,
      show: false,
    }, this.props.save);
  }

  buildEnvInput(data, env, envId) {
    const envInput = !data.hostportId ?
      <Input
        type="select"
        name="envId"
        label="Env Name"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-8"
        value={envId || ''}
        onChange={e => this.handleChange(e)}
      >
        {this.buildEnvList(env)}
      </Input>
      :
      <Input
        type="text"
        name="env"
        label="Env Name"
        disabled
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-8"
        value={data.env || ''}
      />;

    return envInput;
  }

  render() {
    const { show, loading, err, data, env, envId } = this.state;
    return (
      <Modal backdrop="static" show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Env Config</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal">
            { this.buildEnvInput(data, env, envId) }
            <Input
              type="select"
              name="scheme"
              label="Schemes"
              value={data.scheme || ''}
              onChange={e => this.handleChange(e)}
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
            >
              <option value="0">HTTP</option>
              <option value="1">HTTPS</option>
            </Input>
            <Input
              type="text"
              name="host"
              label="Host"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
              value={data.host || ''}
              onChange={e => this.handleChange(e)}
            />
            <Input
              type="text"
              name="port"
              label="Port"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-8"
              value={data.port > 0 ? data.port : ''}
              onChange={e => this.handleChange(e)}
              maxLength="8"
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

EnvModal.propTypes = {
  save: React.PropTypes.func,
};

export default EnvModal;
