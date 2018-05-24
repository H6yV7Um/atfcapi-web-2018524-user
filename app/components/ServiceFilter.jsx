import React from 'react';
import { Input } from 'react-bootstrap';
import Notification from './Notification';
import fetchX from '../vendor/Fetch';

const page = {
  limit: 10000,
  offset: 0,
};

class ServiceFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      appIds: [],
      services: [],
      projectId: 0,
      appId: 0,
      serviceId: 0,
    };
  }

  componentWillMount() {
    const { projectId = 0, appId = 0, serviceId = 0 } = this.props.header || {};
    this.setState({
      projectId,
      appId,
      serviceId,
    })
  }

  componentDidMount() {
    this.getProjects();
    const { projectId, appId } = this.state;
    if (projectId) this.getAppIds();
    if (appId) this.getServices();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isThrift: nextProps.isThrift,
    });
  }

  async getProjects() {
    const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryProject', page);
    if (code === '200') {
      this.setState({
        projects: data.list || [],
      });
    } else {
      Notification.error(msg);
    }
    this.handleSearch(); // 不知道为什么要去请求一次
  }

  async getAppIds() {
    const { projectId } = this.state;

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryAppId', { ...page, projectId });
      if (code === '200') {
        this.setState({
          appIds: data.list || [],
        });
      } else {
        Notification.error(msg);
      }
      this.handleSearch();
    } catch(err) {
      throw err
    }
  }

  async getServices() {
    const { projectId, appId } = this.state;
    if (projectId === '0' || appId === '0') {
      this.setState({
        services: [],
      });
      return;
    }

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryServiceName', { ...page, projectId, appId });
      if (code === '200') {
        this.setState({
          services: data.list || [],
        });
      } else {
        Notification.error(msg);
      }
      this.handleSearch();
    } catch(err) {
      throw err
    }
  }

  handleChange(event) {
    const target = event.target;
    const value = parseInt(target.value, 10);
    switch(target.name) {
      case 'projectId':
        this.setState({
          projectId: value,
          appId: 0,
          serviceId: 0,
        }, this.getAppIds);
        break;
      case 'appId':
        this.setState({
          appId: value,
          serviceId: 0,
        }, this.getServices);
        break;
      default:
        this.setState({
          serviceId: value,
        }, this.handleSearch);
    }
  }

  handleSearch() {
    if ( typeof this.props.callback === 'function') {
      const { projectId, appId, serviceId } = this.state;
      this.props.callback(projectId, appId, serviceId);
    }
  }

  render() {
    const { projects, appIds, services, projectId, appId, serviceId } = this.state;
    const projectOption = projects.map( item =>
      <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
    );
    const appIdOption = appIds.map( item =>
      <option key={item.appId} value={item.appId}>{item.appIdName}</option>
    );
    const serviceOption = services.map( item =>
      <option key={item.serviceId} value={item.serviceId}>{item.serviceName}</option>
    );
    return (
      <div className="form-horizontal api-filter">
        <Input
          type="select"
          label="Project"
          name="projectId"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-8"
          value={projectId}
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          {projectOption}
        </Input>
        <Input
          type="select"
          label="AppId"
          name="appId"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-8"
          disabled={projectId == 0}
          value={appId}
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          {appIdOption}
        </Input>
        <Input
          type="select"
          label="Service Name"
          name="serviceId"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          disabled={appId == 0}
          value={serviceId}
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          {serviceOption}
        </Input>
      </div>
    );
  }
}

ServiceFilter.propTypes = {
  header: React.PropTypes.object,
  callback: React.PropTypes.func,
}

export default ServiceFilter;
