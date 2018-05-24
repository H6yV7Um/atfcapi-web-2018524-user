import React from 'react';
import { Table, Button, Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { DeleteDialog, Notification } from 'atfcapi';
import EnvModal from './EnvModal';
import fetchX from '../../vendor/Fetch';

class EnvConfig extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      serviceId: props.location.query.serviceId,
      data: [],
      info: {},
    };
  }

  componentDidMount() {
    this.getEnvConfig();
    this.getServiceInfo();
  }

  getEnvConfig() {
    const { serviceId } = this.state;
    fetchX.get('/atfcapi/commonConfig/queryProjectConfigureDetail', {
      serviceId,
    }).then(res => {
      if (res.code === '200') {
        this.setState({
          data: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  getServiceInfo() {
    const { serviceId } = this.state;
    fetchX.get('/atfcapi/uploadFile/querydetail', {
      projectServiceId: serviceId,
    }).then(res => {
      if (res.code === '200') {
        this.setState({
          info: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  handleDeleteEnv(obj) {
    fetchX.get('/atfcapi/commonConfig/deleteProjectConfigureDetail', {
      hostPortId: obj.index,
    }).then(res => {
      if (res.code === '200') {
        Notification.success(res.msg);
        window.location.reload();
      } else {
        Notification.error(res.msg || res.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  buildEnvHtml(data) {
    const schemeMap = {
      '0': 'HTTP',
      '1': 'HTTPS',
    };

    return data.map( (item, index) =>
      <tr key={item.hostportId}>
        <td>{index + 1}</td>
        <td>{item.env}</td>
        <td>{item.host}</td>
        <td>{item.port > 0 ? item.port : ''}</td>
        <td>{schemeMap[item.scheme]}</td>
        <td>
          <a href="javascript:;" onClick={() => this.refs.envModal.show(item)}>Edit</a>
          <a
            href="javascript:;"
            onClick={() => this.refs.delete.show({
              index: item.hostportId,
              text: item.env,
            })}
          >
            Delete
          </a>
        </td>
      </tr>
    );
  }

  render() {
    const { data, info, serviceId } = this.state;
    const { projectId } = this.props.params;
    return (
      <div id="config">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href={`#project/${projectId}/config`}>
            Project Config
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Environment
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="service-info">
          <span>Project: <b>{info.projectName}</b> </span>
          <span>AppId: <b>{info.appIdName}</b> </span>
          <span>Service Name: <b>{info.serviceName}</b> </span>
        </div>
        <Table responsive bordered striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>env</th>
              <th>host</th>
              <th>port</th>
              <th>scheme</th>
              <th>operation</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? this.buildEnvHtml(data) : <tr><td colSpan="6">No data</td></tr>}
          </tbody>
        </Table>
        <div className="btn-panel">
          <Button
            bsStyle="primary"
            onClick={() => this.refs.envModal.show({scheme: '0', port: 80}, serviceId)}
          >
            Add Environment
          </Button>
        </div>
        <EnvModal ref="envModal" save={() => this.getEnvConfig()} />
        <DeleteDialog
          ref="delete"
          delete={obj => this.handleDeleteEnv(obj)}
        />
      </div>
    );
  }
}

EnvConfig.propTypes = {
  params: React.PropTypes.object,
  location: React.PropTypes.object,
};

export default EnvConfig;
